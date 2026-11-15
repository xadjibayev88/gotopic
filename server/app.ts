import express, { type Request, type Response, type NextFunction } from "express";
import cookieParser from "cookie-parser";
import { randomUUID } from "node:crypto";
import { once } from "node:events";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { searchDictionary, dictionaryStatistics } from "./dictionary.js";
import { learningCatalog } from "./catalog.js";
import { authRouter, getUser } from "./auth.js";
import { joinWaitlist, waitlistCount, waitlistCsv, waitlistInput } from "./waitlist.js";
import { activePlan, aiDailyLimitFor, billingWebhooks, checkUsdt, createOrder, orderInput, plansPayload } from "./billing.js";
import { db, loadProgress, saveProgress, acquireLease, consumeBudget, refundBudget } from "./database.js";
import { aiInput, tutorInput, jsonFragments, parseJson, safeAiError } from "./ai-service.js";
import { tutorSession, maxKoFor } from "./tutor-session.js";
import { leagueStandings, recordLeagueXp, leagueInput } from "./league.js";
import { reserveAvailableVoiceBudget, settleVoiceBudget, type VoiceReservation } from "./guards.js";
import { canUseProvider, providerSuccess, providerFailure, recordRequest, metrics } from "./telemetry.js";

const number = (key: string, fallback: number, max: number) => Math.max(1, Math.min(max, Number(process.env[key]) || fallback));
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..", "public");
const queueWait = () => number("AI_QUEUE_WAIT_MS", 8000, 15000);
const day = () => new Date().toISOString().slice(0, 10);
const minute = () => new Date().toISOString().slice(0, 16);
const month = () => new Date().toISOString().slice(0, 7);
const circuitError = () => Object.assign(new Error("Provider cooling down"), { code: "busy", retryAfter: 30 });
const budgetError = () => Object.assign(new Error("Quota exceeded"), { code: "quota_exceeded", retryAfter: 60 });
const aborted = () => new DOMException("Request closed", "AbortError");

function requestSignal(req: Request, res: Response, timeout = 45000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const close = () => { if (!res.writableEnded) controller.abort(); };
  req.on("aborted", close); res.on("close", close);
  return { signal: controller.signal, cancel: () => controller.abort(), cleanup: () => { clearTimeout(timer); req.off("aborted", close); res.off("close", close); } };
}
async function sendEvent(res: Response, signal: AbortSignal, type: string, data: unknown) {
  if (signal.aborted || res.destroyed) throw aborted();
  const ok = res.write(`event: ${type}\ndata: ${JSON.stringify(data)}\n\n`);
  if (!ok) await once(res, "drain", { signal });
}
function beginStream(res: Response) {
  res.set({ "Content-Type": "text/event-stream; charset=utf-8", "Cache-Control": "private, no-store", "X-Accel-Buffering": "no" });
  res.flushHeaders();
}
async function userBudget(userId: string) {
  if (!await consumeBudget(`minute:${userId}`, minute(), number("AI_REQUESTS_PER_MINUTE", 6, 30))) throw budgetError();
  if (!await consumeBudget(`daily:${userId}`, day(), await aiDailyLimitFor(userId, number("AI_DAILY_LIMIT", 80, 1000)))) throw budgetError();
}
function publicError(res: Response, error: unknown) {
  const safe = safeAiError(error);
  res.set("Retry-After", String(safe.retryAfter));
  return res.status(safe.status).json({ error: safe });
}

export function createApp() {
  const app = express();
  app.disable("x-powered-by");
  // No frame-blocking headers: Cloud Preview is an embedded HTTPS iframe.
  app.use((req, res, next) => {
    res.set({ "X-Content-Type-Options": "nosniff", "Referrer-Policy": "strict-origin-when-cross-origin" });
    const allowed = [process.env.PUBLIC_ORIGIN, ...(process.env.ALLOWED_ORIGINS || "").split(",")].filter(Boolean);
    if (req.headers.origin && allowed.includes(req.headers.origin)) {
      res.set({ "Access-Control-Allow-Origin": req.headers.origin, "Access-Control-Allow-Credentials": "true", "Access-Control-Allow-Headers": "Content-Type, X-GoTopic-Request", "Access-Control-Allow-Methods": "GET, POST, PUT, OPTIONS" });
      res.vary("Origin");
      if (req.method === "OPTIONS") { res.sendStatus(204); return; }
    }
    if (req.method === "OPTIONS") { res.sendStatus(403); return; }
    next();
  });
  app.use(cookieParser());
  app.use(express.json({ limit: "512kb", strict: true }));
  app.use("/api", (_req, res, next) => { res.set("Cache-Control", "private, no-store"); next(); });
  app.use("/api/billing/hooks", billingWebhooks);
  // A custom header blocks cross-site HTML forms. Unlisted CORS origins cannot set it.
  app.use("/api", (req, res, next) => {
    if (["POST", "PUT", "DELETE"].includes(req.method) && req.headers["x-gotopic-request"] !== "1") { res.status(403).json({ error: { code: "forbidden", message: "So‘rovga ruxsat yo‘q." } }); return; }
    next();
  });
  app.use("/api/auth", authRouter);
  app.get("/api/health", async (_req, res) => {
    try { await db().query("SELECT 1"); res.json({ ok: true, version: "2.0.0" }); }
    catch { res.status(503).json({ ok: false, code: "database_unavailable" }); }
  });
  app.get("/api/dictionary-stats",async(req,res)=>{try{res.set("Cache-Control","public,max-age=60").json(await dictionaryStatistics());}catch{res.status(503).json({error:{code:"dictionary_unavailable"}})}});
  app.get("/api/dictionary", async (req,res) => { try {res.set("Cache-Control","public, max-age=60");res.json(await searchDictionary(req.query));} catch(error) { const busy=(error as {code?:string}).code==="dictionary_busy",invalid=(error as Error).name==="ZodError";res.set("Retry-After","2").status(busy?429:invalid?400:503).json({error:{code:busy?"busy":invalid?"invalid_query":"dictionary_unavailable"}}); } });
  app.get("/api/catalog", async (_req,res) => { try { res.set("Cache-Control","public, max-age=60");res.json(await learningCatalog()); } catch { res.status(503).json({error:{code:"catalog_unavailable"}}); } });
  app.get("/api/session", async (req, res) => {
    try { const user = await getUser(req); const billing = user ? await activePlan(user.id).catch(() => ({ plan: "free", expiresAt: null })) : { plan: "free", expiresAt: null }; res.json({ user, billing, voiceConfigured: !!process.env.ELEVENLABS_API_KEY, aiConfigured: !!process.env.GEMINI_API_KEY, limits: { dailyAiTurns: number("AI_DAILY_LIMIT", 80, 1000), voiceMonthlyCharacters: number("VOICE_MONTHLY_CHAR_LIMIT", 10000, 100000000) } }); }
    catch { res.status(503).json({ error: { code: "unavailable", message: "Hisob xizmatiga hozir ulanib bo‘lmadi." } }); }
  });
  app.get("/api/progress", async (req, res) => {
    try { const user = await getUser(req); if (!user) { res.sendStatus(401); return; } res.json(await loadProgress(user.id)); }
    catch { res.status(503).json({ error: { code: "unavailable" } }); }
  });
  app.put("/api/progress", async (req, res) => {
    try {
      const user = await getUser(req); if (!user) { res.sendStatus(401); return; }
      const state = req.body?.state;
      if (!state || typeof state !== "object" || Array.isArray(state) || Buffer.byteLength(JSON.stringify(state)) > 500 * 1024) { res.sendStatus(400); return; }
      // Progress is learning data, never an entitlement, role, rate-limit or billing source.
      res.json(await saveProgress(user.id, state, Number.isInteger(req.body.version) ? req.body.version : undefined));
    } catch (error) {
      if ((error as { code?: string }).code === "progress_conflict") { res.status(409).json({ error: { code: "conflict" } }); return; }
      res.status(503).json({ error: { code: "unavailable" } });
    }
  });
  app.get("/api/admin/metrics", async (req, res) => {
    const user = await getUser(req).catch(() => null);
    if (!user?.isAdmin) { res.sendStatus(403); return; }
    res.json(metrics());
  });
  app.post(["/api/ai/json", "/api/ai/stream"], async (req, res) => {
    const parsed = aiInput.safeParse(req.body); if (!parsed.success) { res.status(400).json({ error: { code: "invalid_input" } }); return; }
    const user = await getUser(req).catch(() => null);
    if (!user) { res.status(401).json({ error: { code: "login_required", message: "AI ustozdan foydalanish uchun hisobga kiring." } }); return; }
    const lifecycle = requestSignal(req, res, 30000);
    let lease: Awaited<ReturnType<typeof acquireLease>> | undefined, heartbeat: ReturnType<typeof setInterval> | undefined;
    const started = performance.now(); let failed = true;
    try {
      if (!process.env.GEMINI_API_KEY) throw new Error("Gemini not configured");
      if (!canUseProvider("gemini")) throw circuitError();
      await userBudget(user.id);
      lease = await acquireLease([{ key: `user:${user.id}`, limit: 1 }, { key: "gemini", limit: number("AI_CONCURRENCY", 8, 100) }], 45000, lifecycle.signal, queueWait());
      heartbeat = setInterval(() => { void lease?.renew().catch(() => lifecycle.cancel()); }, 10000);
      let raw = "";
      const streaming = req.path.endsWith("/stream");
      if (streaming) { beginStream(res); await sendEvent(res, lifecycle.signal, "meta", { requestId: randomUUID() }); }
      for await (const text of jsonFragments(parsed.data.prompt, lifecycle.signal, parsed.data.generationConfig?.temperature, parsed.data.generationConfig?.maxOutputTokens || 1536)) {
        raw += text; if (raw.length > 20000) throw new Error("AI response too large");
        if (streaming) await sendEvent(res, lifecycle.signal, "text", { text });
      }
      const value = parseJson(raw);
      if (streaming) { await sendEvent(res, lifecycle.signal, "done", { value }); res.end(); }
      else res.json({ value });
      providerSuccess("gemini"); failed = false;
    } catch (error) {
      const safe = safeAiError(error);
      if (safe.code !== "busy" && safe.code !== "quota_exceeded" && safe.code !== "timeout") providerFailure("gemini");
      if (!res.destroyed) {
        if (res.headersSent) { res.write(`event: error\ndata: ${JSON.stringify(safe)}\n\n`); res.end(); }
        else publicError(res, error);
      }
    } finally {
      clearInterval(heartbeat); lifecycle.cleanup(); await lease?.release().catch(() => undefined); recordRequest(performance.now() - started, failed);
    }
  });
  app.post("/api/voice", async (req,res)=>{
    const parsed=tutorInput.safeParse(req.body);
    if(!parsed.success){res.status(400).json({error:{code:"invalid_input"}});return;}
    const user=await getUser(req).catch(()=>null);
    if(!user){res.status(401).json({error:{code:"login_required",message:"AI ustoz uchun hisobga kiring."}});return;}
    const lifecycle=requestSignal(req,res,22000),started=performance.now();
    let aiLease:Awaited<ReturnType<typeof acquireLease>>|undefined,voiceLease:Awaited<ReturnType<typeof acquireLease>>|undefined;
    let budget:VoiceReservation|undefined,heartbeat:ReturnType<typeof setInterval>|undefined,failed=true,paidInputStarted=false;
    try{
      if(!process.env.GEMINI_API_KEY)throw new Error("Gemini not configured");
      if(!canUseProvider("gemini"))throw circuitError();
      await userBudget(user.id);
      aiLease=await acquireLease([{key:`user:${user.id}`,limit:1},{key:"gemini",limit:number("AI_CONCURRENCY",8,100)}],45000,lifecycle.signal,1000);
      let natural=parsed.data.preferNatural!==false&&!!process.env.ELEVENLABS_API_KEY;
      let reason=parsed.data.preferNatural===false?"user_choice":!natural?"provider_unavailable":undefined;
      if(natural&&!canUseProvider("elevenlabs")){natural=false;reason="busy";}
      if(natural){
        try{
          voiceLease=await acquireLease([{key:"elevenlabs",limit:number("VOICE_CONCURRENCY",2,30)}],45000,lifecycle.signal,200);
          budget=await reserveAvailableVoiceBudget(user.id,maxKoFor(parsed.data.level)+8);
        }catch(error){
          await voiceLease?.release().catch(()=>{});voiceLease=undefined;natural=false;
          reason=(error as {code?:string}).code==="quota_exceeded"?"quota_exceeded":"busy";
        }
      }
      heartbeat=setInterval(()=>{void Promise.all([aiLease?.renew(),voiceLease?.renew()]).catch(()=>lifecycle.cancel());},10000);
      beginStream(res);
      const result=await tutorSession(parsed.data,{signal:lifecycle.signal,natural,reason,maxKoreanCharacters:budget?Math.min(budget.amount-8,maxKoFor(parsed.data.level)):maxKoFor(parsed.data.level),
        onFirstAudio:()=>{paidInputStarted=true;},onInputStarted:()=>{paidInputStarted=true;},
        emit:({type,data})=>sendEvent(res,lifecycle.signal,type,type==="meta"?{...data,requestId:randomUUID()}:data)});
      providerSuccess("gemini");
      if(natural){if(result.ttsFailed)providerFailure("elevenlabs");else providerSuccess("elevenlabs");}
      if(budget)await settleVoiceBudget(budget,paidInputStarted?Math.min(budget.amount,result.sentCharacters+8):0).catch(()=>{});
      await sendEvent(res,lifecycle.signal,"done",{value:result.value,voiceMode:result.voiceMode,reason:result.reason,timings:result.timings});
      console.log(JSON.stringify({type:"tutor_latency",mode:result.voiceMode,...result.timings}));
      res.end();failed=false;
    }catch(error){
      const safe=safeAiError(error);
      if(!["busy","quota_exceeded","timeout"].includes(safe.code))providerFailure("gemini");
      if(!res.destroyed){if(res.headersSent){res.write(`event: error\ndata: ${JSON.stringify(safe)}\n\n`);res.end();}else publicError(res,error);}
    }finally{
      clearInterval(heartbeat);lifecycle.cleanup();
      if(budget&&!paidInputStarted)await settleVoiceBudget(budget,0).catch(()=>{});
      await Promise.all([aiLease?.release().catch(()=>{}),voiceLease?.release().catch(()=>{})]);recordRequest(performance.now()-started,failed);
    }
  });
  app.get("/api/waitlist", async (_req, res) => {
    try { res.set("Cache-Control", "public, max-age=60").json({ count: await waitlistCount(), launch: "2026-12-22" }); } catch { res.status(503).json({ error: { code: "unavailable" } }); }
  });
  app.post("/api/waitlist", async (req, res) => {
    const parsed = waitlistInput.safeParse(req.body); if (!parsed.success) { res.status(400).json({ error: { code: "invalid_input" } }); return; }
    try { res.json(await joinWaitlist(req, parsed.data)); }
    catch (error) { const status = (error as { status?: number }).status ?? 503; res.status(status).json({ error: { code: (error as Error).message || "unavailable" } }); }
  });
  app.get("/api/admin/waitlist.csv", async (req, res) => {
    const user = await getUser(req).catch(() => null);
    if (!user?.isAdmin) { res.sendStatus(403); return; }
    try { res.type("text/csv; charset=utf-8").set("Content-Disposition", "attachment; filename=waitlist.csv").send("\ufeff" + await waitlistCsv()); } catch { res.sendStatus(503); }
  });
  app.get("/api/billing/plans", (_req, res) => { res.json(plansPayload()); });
  app.get("/api/billing/me", async (req, res) => {
    const user = await getUser(req).catch(() => null);
    if (!user) { res.status(401).json({ error: { code: "login_required" } }); return; }
    try { res.json(await activePlan(user.id)); } catch { res.status(503).json({ error: { code: "billing_unavailable" } }); }
  });
  app.post("/api/billing/orders", async (req, res) => {
    const parsed = orderInput.safeParse(req.body); if (!parsed.success) { res.status(400).json({ error: { code: "invalid_input" } }); return; }
    const user = await getUser(req).catch(() => null);
    if (!user) { res.status(401).json({ error: { code: "login_required", message: "To‘lov uchun hisobga kiring." } }); return; }
    try { res.json(await createOrder(user.id, parsed.data.plan, parsed.data.provider)); }
    catch (error) { const status = (error as { status?: number }).status ?? 503; res.status(status).json({ error: { code: (error as Error).message || "billing_unavailable" } }); }
  });
  app.post("/api/billing/orders/:id/check", async (req, res) => {
    const user = await getUser(req).catch(() => null);
    if (!user) { res.status(401).json({ error: { code: "login_required" } }); return; }
    const id = Number(req.params.id); if (!Number.isSafeInteger(id) || id <= 0) { res.status(400).json({ error: { code: "invalid_input" } }); return; }
    try { res.json(await checkUsdt(user.id, id)); }
    catch (error) { const status = (error as { status?: number }).status ?? 503; res.status(status).json({ error: { code: (error as Error).message || "billing_unavailable" } }); }
  });
  app.get("/api/league", async (req, res) => {
    const user = await getUser(req).catch(() => null);
    if (!user) { res.status(401).json({ error: { code: "login_required" } }); return; }
    try { res.json(await leagueStandings(user)); } catch { res.status(503).json({ error: { code: "league_unavailable" } }); }
  });
  app.post("/api/league", async (req, res) => {
    const parsed = leagueInput.safeParse(req.body); if (!parsed.success) { res.status(400).json({ error: { code: "invalid_input" } }); return; }
    const user = await getUser(req).catch(() => null);
    if (!user) { res.status(401).json({ error: { code: "login_required" } }); return; }
    try { res.json(await recordLeagueXp(user, parsed.data.xp, parsed.data.name)); } catch { res.status(503).json({ error: { code: "league_unavailable" } }); }
  });
  app.use("/api", (_req, res) => { res.status(404).json({ error: { code: "not_found" } }); });
  app.get("/.well-known/assetlinks.json", (_req,res) => { res.set("Cache-Control","public, max-age=3600");res.sendFile(resolve(ROOT,".well-known","assetlinks.json")); });
  app.use(express.static(ROOT, { maxAge: 0, etag: true, setHeaders: (res, path) => {
    if (/\.(?:html|js|css|webmanifest|json)$/.test(path)) res.set("Cache-Control", "no-cache");
    else res.set("Cache-Control", "public, max-age=86400");
  } }));
  app.use((_req, res) => { res.status(404).type("html").send("<!doctype html><html lang=uz><meta name=robots content=noindex><title>Sahifa topilmadi</title><h1>Sahifa topilmadi</h1><a href=/>Bosh sahifaga qaytish</a></html>"); });
  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    if (res.headersSent) { res.end(); return; }
    res.status((error as { status?: number }).status === 413 ? 413 : 400).json({ error: { code: "invalid_request" } });
  });
  return app;
}
