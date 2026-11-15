import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import fs from "node:fs";

const source = fs.readFileSync(new URL("../public/runtime-client.js", import.meta.url), "utf8");
const sse = (events: Array<[string, unknown]>) => {
  const text = events.map(([type, value]) => `event: ${type}\ndata: ${JSON.stringify(value)}\n\n`).join("");
  return new Response(new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode(text)); controller.close(); } }), { headers: { "content-type": "text/event-stream" } });
};
function client(events: Array<[string, unknown]>) {
  let calls = 0;
  const context: any = {
    console, HM_BACKEND: { enabled: true, baseUrl: "" }, fetch: async (_url: string, _options: unknown) => { calls++; return sse(events); },
    AbortController, AbortSignal, DOMException, TextEncoder, TextDecoder, Response, ReadableStream,
    CustomEvent, setTimeout, clearTimeout, atob, AudioContext: undefined,
  };
  context.window = context; context.document = { createElement: () => ({ dataset: {}, appendChild() {} }) };
  vm.runInNewContext(source, context, { filename: "runtime-client.js" });
  return { api: context.GoTopicAPI, calls: () => calls };
}

test("tutor emits Uzbek partial before done and makes one voice request", async () => {
  const c = client([
    ["meta", { voiceMode: "text", requestId: "r1", sampleRate: 24000, encoding: "pcm_s16le" }],
    ["reply_partial", { ko: "안녕하세요", uz: "Assalomu alaykum" }],
    ["done", { value: { ko: "안녕하세요", uz: "Assalomu alaykum", fixes: [] }, voiceMode: "text", timings: { firstTextMs: 80, totalMs: 120 } }],
  ]);
  const partials: any[] = [];
  const result = await c.api.tutor({ text: "salom", history: [] }, (value: unknown) => partials.push(value));
  assert.equal(c.calls(), 1);
  assert.equal(partials[0].ko, "안녕하세요");
  assert.equal(partials[0].uz, "Assalomu alaykum");
  assert.equal(result.uz, "Assalomu alaykum");
});

test("natural voice failure mode never retries Gemini or provider", async () => {
  const c = client([
    ["meta", { voiceMode: "natural", requestId: "r2" }],
    ["mode", { voiceMode: "device", reason: "provider_unavailable" }],
    ["reply_partial", { ko: "괜찮아요", uz: "Yaxshi" }],
    ["done", { value: { ko: "괜찮아요", uz: "Yaxshi", fixes: [] }, voiceMode: "device", reason: "provider_unavailable" }],
  ]);
  const modes: string[] = [];
  const value = await c.api.voice({ text: "hi" }, () => {}, () => {}, { onMode: (mode: string) => modes.push(mode) });
  assert.equal(c.calls(), 1);
  assert.deepEqual(modes, ["natural", "device", "device"]);
  assert.equal(value.ko, "괜찮아요");
});

test("cancelling an in-flight voice turn aborts the old turn", async () => {
  let release!: () => void;
  const context: any = {
    console, HM_BACKEND: { enabled: true, baseUrl: "" }, AbortController, AbortSignal, DOMException, TextEncoder, TextDecoder, Response, ReadableStream,
    fetch: (_url: string, options: any) => new Promise((_resolve, reject) => { release = () => reject(new DOMException("Aborted", "AbortError")); options.signal.addEventListener("abort", release, { once: true }); }),
    CustomEvent, setTimeout, clearTimeout, atob, AudioContext: undefined,
  };
  context.window = context; context.document = {}; vm.runInNewContext(source, context, { filename: "runtime-client.js" });
  const pending = context.GoTopicAPI.voice({ text: "old" }, () => {}, () => {});
  await new Promise(resolve => setTimeout(resolve, 0));
  context.GoTopicAPI.cancel();
  await assert.rejects(pending, (error: any) => error?.name === "AbortError" || error?.code === "network");
});
