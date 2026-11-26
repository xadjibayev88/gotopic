(() => {
  "use strict";
  const api = window.GoTopicAPI;
  if (!api) return;
  const originalChatSend = window.chatSend;
  const originalCallEnd = window.callEnd;
  let turn = 0, textController = null, naturalAllowed = true;
  const escaped = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  const message = failure => failure?.code === "login_required" ? "AI ustozdan foydalanish uchun hisobga kiring. Darslar ro‘yxatdan o‘tmasdan ham ishlaydi." : failure?.message && failure.message !== failure.code ? failure.message : "AI hozir javob bera olmadi. Birozdan keyin qayta urinib ko‘ring.";
  const history = () => C.msgs.slice(-10).map(item => ({ who: item.who, text: String(item.who === "me" ? item.text : item.ko).slice(0, 1000) }));
  function appendReply(value) {
    if (!value || typeof value.ko !== "string" || !value.ko.trim()) throw new Error("AI javobi noto‘g‘ri.");
    C.msgs.push({ who: "ai", ko: value.ko, rom: String(value.rom || ""), uz: String(value.uz || ""), fix: String(value.fix || ""), fixes: Array.isArray(value.fixes) ? value.fixes.slice(0, 4) : [], pronunciation: String(value.pronunciation || "") });
    if (C.msgs.length > 60) C.msgs.splice(0, C.msgs.length - 60);
    gain(5);
  }
  function updatePartial(partial) {
    const value = typeof partial === "string" ? { ko: partial } : partial || {};
    const bubbles = document.querySelectorAll("#chat .msg.ai");
    const node = bubbles[bubbles.length - 1];
    if (!node) return;
    const ko = node.querySelector(".k") || node.querySelector(".r");
    if (ko && value.ko) { ko.className = "k"; ko.textContent = value.ko; }
    let uz = node.querySelector("[data-stream-uz]");
    if (!uz && value.uz) {
      uz = document.createElement("div"); uz.dataset.streamUz = "true";
      node.appendChild(uz);
    }
    if (uz && value.uz) uz.textContent = value.uz;
    const callKo = document.querySelector(".cs .k"), callUz = document.querySelector(".cs .sub + div");
    if (callKo && value.ko) callKo.textContent = value.ko;
    if (callUz && value.uz) callUz.textContent = value.uz;
  }
  function renderPartial(value) {
    updatePartial(value);
    if (route() === "suhbat" && CALL.on && !document.querySelector(".cs .k")) render(true);
    updatePartial(value);
  }
  const LEVEL_FOCUS = {
    1: "o‘zini tanishtirish, oila, ovqat va kundalik tartib",
    2: "kundalik hayot, xarid, sayohat va amaliy muammolar",
    3: "o‘qish, ish, sog‘liq va shaxsiy tajribalar",
    4: "ishdagi qarorlar, davlat xizmatlari va jamiyatdagi o‘zgarishlar",
    5: "jamiyat, siyosat, tengsizlik, texnologiya va dalilga asoslangan fikrlar",
    6: "texnologiya va insoniyat, iqlim, iqtisod, axloq va akademik munozara"
  };
  const SCENARIO_FOCUS = {
    0: "ism, yashash joyi, o‘qish yoki ish va koreys tilini o‘rganish maqsadi",
    1: "Seul kafesida bitta taom yoki ichimlik buyurtma qilish, did, narx va to‘lov",
    2: "do‘konda bitta mahsulotni tanlash, narx, o‘lcham, sifat va boshqa mahsulot bilan taqqoslash",
    3: "koreys tilini o‘rganishdagi hozirgi tajriba, qiyinchilik, usul va bitta aniq yaxshilanish",
    4: "Seuldagi bitta manzil, yo‘l, mo‘ljal, transport va yetib borish vaqti"
  };
  const advancedFocus = "texnologiyaning jamiyat va inson mustaqil qarorlariga ta’siri; bitta aniq misol va uning oqibati";
  const focusFor = () => C.scn === 3 && S.lvl >= 5 ? advancedFocus : SCENARIO_FOCUS[C.scn] || LEVEL_FOCUS[S.lvl] || LEVEL_FOCUS[1];
  const topicFor = () => {
    const advanced = C.scn === 3 && S.lvl >= 5;
    return {
      mainTopic: focusFor(),
      subtopic: advanced ? "bitta aniq misol va uning oqibati" : "o‘quvchining oxirgi javobi",
      goal: S.lvl >= 5 ? "sabab, qarama-qarshilik, misol yoki oqibat bilan fikrni himoya qilish" : "tabiiy javob berish va mavzuga oid bitta savol berish",
      forbiddenDrift: ["aloqasiz mavzular", "umumiy small talk", "boshqa scenario", "mavzularning uzun ro‘yxati"]
    };
  };
  const inputFor = (text, voice, snapshot) => ({ text, lang: window.GoTopicI18n?.lang || "uz", level: S.lvl, scenario: C.scn, focus: focusFor(), topic: topicFor(), history: snapshot, confidence: voice?.confidence ?? null });
  window.chatSend = async function streamingChat(typed, voiceMeta) {
    if (voiceMeta?.voice) return originalChatSend(typed, voiceMeta);
    const text = (typeof typed === "string" ? typed : C.draft).trim().slice(0, 1000);
    if (!text || C.busy) return;
    if (!api.user) { C.err = message({ code: "login_required" }); render(true); return; }
    const token = ++turn;
    C.msgs.push({ who: "me", text }); C.draft = ""; C.busy = true; C.err = ""; render(true); scrollChat();
    textController = new AbortController();
    try {
      const reply = await api.tutor(inputFor(text, null, history()), partial => { if (turn === token) renderPartial(partial); }, { signal: textController.signal });
      if (turn !== token) return;
      appendReply(reply);
      if (S.auto) speakBoth(reply.ko, reply.uz);
    } catch (failure) {
      if (turn !== token) return;
      if (C.msgs[C.msgs.length - 1]?.who === "me") C.msgs.pop();
      C.draft = text; if (failure.name !== "AbortError") C.err = message(failure);
    } finally {
      if (turn === token) { C.busy = false; textController = null; if (route() === "suhbat") { render(true); scrollChat(); } }
    }
  };
  window.callSend = async function realTimeVoice(typed) {
    clearTimeout(callT);
    const text = (typeof typed === "string" ? typed : CALL.heard).trim().slice(0, 1000);
    if (!text || C.busy || !CALL.on) return;
    if (!api.user) { callSet("idle", message({ code: "login_required" })); return; }
    const token = ++turn;
    CALL.gate = true; CALL.state = "think"; CALL.note = "Javob kelmoqda…";
    micSink = null; if (dict) await dict.stop().catch(() => {});
    C.msgs.push({ who: "me", text }); C.draft = ""; C.busy = true; C.err = ""; CALL.heard = ""; render(true);
    const input = inputFor(text, { confidence: CALL.confidence }, history());
    let spoken = "", audioStarted = false, complete = false, mode = "natural", localSpeech = null;
    const onMode = (voiceMode, reason) => {
      if (voiceMode) mode = voiceMode;
      if (reason === "quota_exceeded" || reason === "provider_unavailable" || reason === "audio_unavailable") naturalAllowed = false;
      if (turn !== token || !CALL.on) return;
      if (voiceMode === "device") CALL.note = "Qurilma ovozi rejimi. Koreyscha javobni tinglang…";
      else if (voiceMode === "text") CALL.note = reason === "quota_exceeded" ? "Tabiiy ovoz limiti tugadi. Matn va qurilma ovozidan foydalanamiz." : "Ovoz mavjud emas. Matn va qurilma ovozidan foydalanamiz.";
      render(true);
    };
    try {
      const reply = await api.voice(input, partial => {
        if (turn !== token || !CALL.on) return;
        if (typeof partial === "string") spoken += partial; else { spoken = partial?.ko || spoken; }
        renderPartial(typeof partial === "string" ? { ko: spoken } : partial);
      }, () => {
        if (!audioStarted && turn === token && CALL.on) { audioStarted = true; CALL.state = "speak"; CALL.note = "AI gapiryapti…"; render(true); }
      }, { preferNatural: naturalAllowed, onMode, onReply: partial => {
        if (turn !== token || !CALL.on) return;
        renderPartial(partial);
        if ((mode === "device" || mode === "text") && !localSpeech && partial?.ko && partial?.uz) { CALL.state = "speak"; CALL.note = "AI gapiryapti…"; localSpeech = sayLocal(partial.ko, "ko"); }
      } });
      if (turn !== token || !CALL.on) return;
      appendReply(reply); complete = true;
      if (mode === "device" || mode === "text") { CALL.state = "speak"; render(true); await (localSpeech || sayLocal(reply.ko, "ko")); }
    } catch (failure) {
      if (turn !== token || !CALL.on) return;
      if (failure.name === "AbortError") return;
      if (failure.hadAudio) { CALL.note = "Ovoz ijrosi uzildi. Matn javobi saqlandi."; }
      else { C.err = message(failure); CALL.note = C.err; }
    } finally {
      if (turn === token) {
        C.busy = false;
        if (CALL.on) {
          CALL.gate = false;
          CALL.state = "idle"; if (complete) CALL.note = "";
          render(true);
        }
      }
    }
  };
  window.callEnd = function safeCallEnd() { ++turn; C.busy = false; textController?.abort(); textController = null; api.cancel(); originalCallEnd(); };
  const oldCallStart = window.callStart;
  window.callStart = function safeCallStart() { if (!api.user) { C.err = message({ code: "login_required" }); render(true); return; } naturalAllowed = true; api.unlockAudio().catch(() => {}); oldCallStart(); };
  const oldCallOrb = window.callOrb;
  function cancelTurn(note) { ++turn; textController?.abort(); textController = null; api.cancel(); C.busy = false; try { speechSynthesis.cancel(); } catch (_) {} if (C.msgs[C.msgs.length - 1]?.who === "me") C.msgs.pop(); CALL.gate = false; callSet("idle", note || "Bekor qilindi. Tugmani bosib qayta gapiring."); }
  window.callCancelTurn = () => cancelTurn();
  window.callOrb = function safeCallOrb() { api.unlockAudio().catch(() => {}); if (CALL.state === "think") return cancelTurn(); if (CALL.state === "speak") { ++turn; api.cancel(); try { speechSynthesis.cancel(); } catch (_) {} C.busy = false; CALL.gate = false; callSet("idle", ""); return; } oldCallOrb(); };
  const oldPtt = window.pttPress;
  window.pttPress = function safePtt() { api.unlockAudio().catch(() => {}); if (CALL.state === "think") return cancelTurn(); if (CALL.state === "speak") { ++turn; api.cancel(); C.busy = false; } oldPtt(); };
  function mergeState(cloud) {
    if (!cloud || typeof cloud !== "object" || Array.isArray(cloud)) return;
    S.xp = Math.max(Number(S.xp) || 0, Number(cloud.xp) || 0);
    S.known = { ...(cloud.known || {}), ...S.known };
    S.seen = { ...(cloud.seen || {}), ...S.seen };
    const combined = { ...(cloud.decks || {}), ...S.decks };
    for (const key of Object.keys(combined)) {
      const words = new Map();
      for (const word of [...(Array.isArray(cloud.decks?.[key]) ? cloud.decks[key] : []), ...(Array.isArray(S.decks?.[key]) ? S.decks[key] : [])]) {
        if (Array.isArray(word) && typeof word[0] === "string") words.set(word[0] + "\u0000" + String(word[2] || ""), word);
      }
      combined[key] = [...words.values()];
    }
    S.decks = combined;
    S.gram = Math.max(Number(S.gram) || 0, Number(cloud.gram) || 0);
    S.quiz = Math.max(Number(S.quiz) || 0, Number(cloud.quiz) || 0);
    S.missions = {done:{...(cloud.missions?.done||{}),...(S.missions?.done||{})},attempts:Math.max(Number(cloud.missions?.attempts)||0,Number(S.missions?.attempts)||0),correct:Math.max(Number(cloud.missions?.correct)||0,Number(S.missions?.correct)||0)};
    const plans = [...(Array.isArray(S.savedPlans) ? S.savedPlans : []), ...(Array.isArray(cloud.savedPlans) ? cloud.savedPlans : []), S.plan, cloud.plan].filter(value => value && typeof value === "object");
    S.savedPlans = [...new Map(plans.map(plan => [JSON.stringify(plan), plan])).values()];
    if (!S.plan && cloud.plan) S.plan = cloud.plan;
    if (!S.name && typeof cloud.name === "string") S.name = cloud.name.slice(0, 24);
    for (const key of Object.keys(S.decks)) if (!["__proto__", "constructor", "prototype"].includes(key)) TOPICS[key] = S.decks[key];
    buildDict(); rebuild(); save(); drawXp();
  }
  const previousSettings = V.sozlama;
  V.sozlama = () => `<section class="view"><h2>Sozlamalar</h2><p class="lead">Profil, ovoz va ilova ishlash rejimi. AI kalitlari qurilmangizda emas, himoyalangan serverda saqlanadi.</p>
    <div class="panel"><h3>Hisob va progress</h3><p class="muted">${api.user ? escaped(api.user.name) + " — hisobga kirilgan. Natijalar qurilmada va serverda saqlanadi." : "Darslar bepul ochiladi. AI ustoz va cloud progress uchun hisobga kiring."}</p><div class="row"><button class="btn" data-account="${api.user ? "logout" : "login"}">${api.user ? "Hisobdan chiqish" : "Hisobga kirish"}</button><button class="btn ghost" data-cloud-sync ${api.user ? "" : "disabled"}>Progressni sinxronlash</button></div></div>
    ${S.savedPlans?.length ? '<div class="panel"><h3>Saqlangan rejalar</h3><p class="muted">Qurilma va clouddagi turli rejalar yo‘qolmasdan saqlanadi.</p><div class="row">'+S.savedPlans.slice(0,10).map((plan,index)=>'<button class="chip" data-restore-plan="'+index+'">'+escaped(plan.goal==='gap'?'Suhbat':'TOPIK')+' · '+escaped(plan.min)+' daqiqa</button>').join('')+'</div></div>' : ''}
    <div class="panel"><h3>Ovozli AI ustoz</h3><p class="muted">Tabiiy ovoz — ElevenLabs. U band yoki limit tugagan bo‘lsa, matnli AI va qurilma ovozi ishlatiladi. Qurilmada koreyscha ovoz o‘rnatilgan bo‘lishi kerak.</p><p class="note">Joriy tabiiy ovoz hisobining umumiy limiti: ${api.status?.limits?.voiceMonthlyCharacters || 10000} belgi/oy. Bu har bir foydalanuvchiga alohida limit emas.</p></div>
    <div class="panel"><h3>Yengil ishlash rejimi</h3><p class="muted">Eski telefonlarda blur va dekorativ animatsiyalarni cheklaydi. Qurilmangiz reduced-motion sozlamasi ham avtomatik hurmat qilinadi.</p><button class="chip" data-lite aria-pressed="${document.documentElement.dataset.lite === "true"}">${document.documentElement.dataset.lite === "true" ? "Yengil rejim yoqilgan" : "Yengil rejimni yoqish"}</button></div>
    <div class="panel"><h3>Mikrofon va maxfiylik</h3><p class="muted">Mikrofon faqat ovozli suhbatni boshlaganingizda ishlaydi. Brauzer ovozni matnga aylantiradi; transcript Gemini’ga, AI javobi ElevenLabs’ga yuboriladi. Bu versiya raw audio orqali fonema yoki talaffuz ballini o‘lchamaydi. AI ham xato qilishi mumkin.</p></div>
    <div class="panel"><h3>Ilovani o‘rnatish</h3><p class="muted">Chrome → menyu → “Ilovani o‘rnatish”. iPhone: Safari → ulashish → “Bosh ekranga”. Offline darslar oxirgi ochilgan versiyada ishlaydi.</p>${installEv ? '<button class="btn" data-inst>Ilovani o‘rnatish</button>' : ""}</div>
  </section>`;
  /* Levels + weekly league (Duolingo-style tiers, server: /api/league) */
  const TIER_COLORS = ["#d08a4f", "#b9c3d3", "#f2c14e", "#2fd3a0", "#ff5d8f", "#7fd8ff"];
  const TIER_NAMES = ["Bronza", "Kumush", "Oltin", "Zumrad", "Yoqut", "Olmos"];
  const league = { data: null, err: "", loading: false, at: 0 };
  let pushTimer = 0;
  const pushLeague = now => {
    if (!api.user) return Promise.resolve();
    clearTimeout(pushTimer);
    const go = () => api.request("/api/league", { method: "POST", body: JSON.stringify({ xp: Math.min(5000, wk().xp | 0), name: String(S.name || "").slice(0, 24) || undefined }) }).catch(() => {});
    if (now) return go();
    pushTimer = setTimeout(go, 5000); return Promise.resolve();
  };
  async function loadLeague(force) {
    if (!api.user || league.loading || (!force && Date.now() - league.at < 30000)) return;
    league.loading = true;
    try { await pushLeague(true); league.data = await (await api.request("/api/league")).json(); league.err = ""; }
    catch (_) { league.err = "Liga ma’lumotini yuklab bo‘lmadi. Internetni tekshiring."; }
    league.loading = false; league.at = Date.now();
    if (route() === "reyting") render(true);
  }
  const previousGain = window.gain;
  window.gain = function leagueGain(amount) { previousGain(amount); pushLeague(false); };
  const shield = (tier, size = 64) => `<svg class="tier-shield" width="${size}" height="${size}" viewBox="0 0 64 64" aria-hidden="true"><defs><linearGradient id="tg${tier}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset=".35" stop-color="${TIER_COLORS[tier]}"/><stop offset="1" stop-color="${TIER_COLORS[tier]}" stop-opacity=".75"/></linearGradient></defs><path d="M32 4 56 13v17c0 15-10 25-24 30C18 55 8 45 8 30V13z" fill="url(#tg${tier})" stroke="rgba(255,255,255,.7)" stroke-width="2"/><text x="32" y="40" text-anchor="middle" font-size="20" font-weight="800" fill="#1b1f3a">${tier + 1}</text></svg>`;
  const left = ms => { const h = Math.max(0, Math.floor(ms / 3600000)); return h >= 24 ? `${Math.floor(h / 24)} kun ${h % 24} soat` : `${h} soat`; };
  const rewardCard = () => {
    const r = window.GoTopicRewarded; if (!r || (!r.ready && !r.busy && r.left() > 0)) return ""; // video yuklanmagan bo'lsa karta ko'rinmaydi
    const left = r.left();
    return `<div class="panel reward-card"><div class="row"><span class="reward-ico">▶</span><div style="flex:1;min-width:0"><b>Video ko‘ring — +${r.xp} XP</b><div class="muted">${left ? `Bugun yana ${left} ta video mavjud` : "Bugungi videolar tugadi. Ertaga yana keling!"}</div></div><button class="btn" data-reward ${left && !r.busy ? "" : "disabled"}>${r.busy ? "Yuklanmoqda…" : "Ko‘rish"}</button></div></div>`;
  };
  window.GoTopicRewardCard = rewardCard;
  window.addEventListener("gotopic:rewarded", () => { if (["reyting", "bosh", "sozlar", "vazifalar"].includes(route())) render(true); });
  document.addEventListener("click", async event => {
    if (!event.target.closest("[data-reward]") || !window.GoTopicRewarded) return;
    const pending = window.GoTopicRewarded.show(); render(true);
    const res = await pending;
    toast(res.ok ? `+${window.GoTopicRewarded.xp} XP qo‘shildi!` : res.reason === "limit" ? "Bugungi videolar tugadi." : (res.reason === "no_ad" ? "Hozircha video yo‘q. Birozdan keyin qayta urinib ko‘ring." : "Video oxirigacha ko‘rilmadi — XP berilmadi."));
    render(true);
  });
  V.reyting = () => {
    const L = lvlInfo(S.xp), w = wk(), d = league.data;
    if (api.user) loadLeague(false);
    const nodes = Array.from({ length: 8 }, (_, i) => Math.max(1, L.n - 2) + i).map(n => `<li class="lv-node ${n < L.n ? "done" : n === L.n ? "now" : "lock"}"><span>${n < L.n ? "✓" : n}</span><small>${n}-daraja${n === L.n ? " · siz" : ""}</small></li>`).join("");
    const tier = d ? d.tier : 0;
    const rows = d ? d.rows : [{ name: S.name || "Siz", xp: w.xp, me: true }];
    const list = rows.map((r, i) => { const zone = d && i < d.promote ? "up" : d && d.demote && i >= d.total - d.demote ? "down" : ""; return `<li class="${r.me ? "me " : ""}${zone}"><span class="rk">${i + 1}</span><span class="ava sm">${escaped(String(r.name || "?").trim().charAt(0).toUpperCase())}</span><span class="nm">${escaped(r.name || "O‘quvchi")}${r.me ? " (siz)" : ""}</span><b>${r.xp} XP</b></li>`; }).join("");
    return `<section class="view league-view">
      <div class="panel lv-card"><div class="row"><span class="lv-badge">${L.n}</span><div style="flex:1;min-width:0"><b class="lv-title">${L.n}-daraja</b><div class="muted">${lvlTitle(L.n)}</div></div><span class="tag">${S.xp} XP</span></div>
        <div class="bar"><i style="width:${L.cur / L.need * 100}%"></i></div><div class="meta"><span>${L.cur} / ${L.need} XP</span><span>Keyingi darajagacha ${L.need - L.cur} XP</span></div>
        <ol class="lv-path">${nodes}</ol></div>
      ${rewardCard()}
      <div class="panel league-card" style="--tc:${TIER_COLORS[tier]}">
        <div class="league-head">${shield(tier)}<div style="flex:1;min-width:0"><span class="eyebrow">Haftalik liga</span><h2>${TIER_NAMES[tier]} ligasi</h2><p class="muted">${d ? `Tugashiga ${left(d.endsAt - Date.now())} · ${d.total} ishtirokchi` : "Hafta dushanbada yangilanadi"}</p></div></div>
        <div class="tier-strip">${TIER_NAMES.map((n, i) => `<span class="${i === tier ? "on" : i < tier ? "past" : ""}" style="--c:${TIER_COLORS[i]}" title="${n}">${shield(i, 30)}</span>`).join("")}</div>
        ${d ? `<p class="league-rule"><span class="up">▲ Yuqori ${d.promote} kishi</span> keyingi ligaga chiqadi${d.demote ? ` · <span class="down">▼ pastki ${d.demote} kishi</span> tushadi` : ""}.</p>` : ""}
        ${!api.user ? `<div class="note">Liga va boshqa o‘quvchilar bilan bellashish uchun hisobga kiring. Shu hafta: ${w.xp} XP.</div><div class="row"><button class="btn" data-account="login">Hisobga kirish</button></div>` : ""}
        ${league.err ? `<p class="err">${escaped(league.err)}</p>` : ""}
        ${api.user && !d && !league.err ? `<p class="muted">Liga yuklanmoqda…</p>` : ""}
        <ol class="lb">${list}</ol>
        <p class="muted" style="font-size:.85rem">Ball: yangi so‘z 5 XP, to‘g‘ri javob 10 XP, AI suhbatda har javob 5 XP. Haftalik XP har dushanba noldan boshlanadi.</p>
      </div></section>`;
  };
  function sessionBanner() {
    const view = document.querySelector("#app > .view");
    if (!view || view.querySelector(".account-banner")) return;
    if (route() === "suhbat" && !api.user) view.insertAdjacentHTML("afterbegin", '<div class="panel account-banner"><p>Darslarni hisobsiz o‘rganing. AI ustoz uchun hisobga kiring.</p><button class="btn" data-account="login">Hisobga kirish</button></div>');
    const status = document.querySelector(".ai-status"); if (status) status.textContent = api.user ? "Hisob ulangan" : "Hisob bilan";
  }
  function attachLearningRewardCard() {
    if (!window.GoTopicRewarded || !["sozlar", "vazifalar"].includes(route())) return;
    const view = document.querySelector("#app > .view");
    if (view && !view.querySelector(".reward-card")) view.insertAdjacentHTML("afterbegin", rewardCard());
  }
  window.GoTopicAccountRefresh = sessionBanner;
  document.addEventListener("click", event => { if(event.target.closest("[data-scn],[data-lvl]") && C.busy){++turn;textController?.abort();api.cancel();C.busy=false;} },true);
  const previousRender = window.render;
  window.render = function controllerRender(...args) { const value = previousRender(...args); sessionBanner(); attachLearningRewardCard(); return value; };
  window.addEventListener("gotopic:session", () => { if (!CALL.on) render(true); });
  window.addEventListener("gotopic:progress-conflict", () => toast("Cloud progress yangilangan. Sozlamalarda sinxronlang; qurilmadagi natija yo‘qolmaydi."));
  document.addEventListener("click", async event => {
    const action = event.target.closest("[data-account],[data-cloud-sync],[data-lite],[data-restore-plan]"); if (!action) return;
    if(action.hasAttribute("data-restore-plan")){const plan=S.savedPlans?.[Number(action.dataset.restorePlan)];if(plan){S.plan=plan;save();toast("Saqlangan reja tanlandi.");render(true);}}
    if (action.dataset.account === "login") api.login();
    if (action.dataset.account === "logout") { await api.logout().catch(() => toast("Hisobdan chiqib bo‘lmadi.")); render(true); }
    if (action.hasAttribute("data-cloud-sync")) { try { mergeState(await api.loadProgress()); toast("Progress sinxronlandi."); render(true); } catch (_) { toast("Internetni tekshiring; lokal progress saqlangan."); } }
    if (action.hasAttribute("data-lite")) { document.documentElement.dataset.lite = String(document.documentElement.dataset.lite !== "true"); try { localStorage.setItem("gotopic-lite", document.documentElement.dataset.lite); } catch (_) {} render(true); }
  });
  window.addEventListener("hashchange", () => { if (route() === "reyting") loadLeague(true); if (route() !== "suhbat") { ++turn; C.busy = false; textController?.abort(); api.cancel(); } });
  window.addEventListener("pagehide", () => { window.callEnd(); });
  document.addEventListener("visibilitychange", () => { if (document.hidden && CALL.on) { window.callEnd(); render(true); } });
  try { if (localStorage.getItem("gotopic-lite") === "true") document.documentElement.dataset.lite = "true"; } catch (_) {}
  Promise.all([api.init(),api.loadCatalog()]).then(async ([_,catalog]) => {
    if(catalog?.data){
      const targets={CONS,VOWS,TOPICS,PHRASES,GRAM,GCATS,LVMAP,READ,LISTEN,DPOS,DRAW};
      for(const [key,target] of Object.entries(targets)){const incoming=catalog.data[key];if(Array.isArray(target)&&Array.isArray(incoming))target.splice(0,target.length,...incoming,...target.slice(incoming.length));else if(target&&incoming&&typeof target==="object")Object.assign(target,incoming);}
      for(const [key,words] of Object.entries(S.decks||{}))if(!["__proto__","constructor","prototype"].includes(key))TOPICS[key]=words;
      buildDict();rebuild();
    }
    if (api.user) { try { mergeState(await api.loadProgress()); render(true); } catch (_) {} } });
  render(true);
})();
