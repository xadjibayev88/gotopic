/* Android app (Capacitor) bridge. In a normal browser this file does nothing.
   The Android WebView has no Web Speech API, so we provide SpeechRecognition and speechSynthesis
   backed by native plugins; the rest of the site keeps using the standard browser APIs. */
(() => {
  "use strict";
  const cap = window.Capacitor;
  if (!cap || !cap.isNativePlatform || !cap.isNativePlatform()) return;
  document.documentElement.classList.add("native-app");
  const P = cap.Plugins || {};
  const SR = P.SpeechRecognition, TTS = P.TextToSpeech;
  const fire = (fn, value) => { try { fn && fn(value); } catch (_) {} };
  const result = (text, final) => ({ resultIndex: 0, results: [Object.assign([{ transcript: text, confidence: final ? 0.9 : 0 }], { isFinal: final })] });

  if (SR && !window.SpeechRecognition && !window.webkitSpeechRecognition) {
    class NativeSpeechRecognition {
      constructor() { this.lang = "ko-KR"; this.interimResults = true; this.continuous = false; this._last = ""; this._done = false; this._subs = []; }
      start() {
        (async () => {
          let perm = await SR.checkPermissions();
          if (perm.speechRecognition !== "granted") perm = await SR.requestPermissions();
          if (perm.speechRecognition !== "granted") { fire(this.onerror, { error: "not-allowed" }); return this._finish(); }
          const available = await SR.available().catch(() => ({ available: false }));
          if (!available.available) { fire(this.onerror, { error: "service-not-allowed" }); return this._finish(); }
          this._subs.push(await SR.addListener("partialResults", data => { const text = (data.matches || [])[0] || ""; if (!text) return; this._last = text; fire(this.onresult, result(text, false)); }));
          this._subs.push(await SR.addListener("listeningState", data => { if (data.status === "stopped") this._finish(); }));
          fire(this.onstart);
          await SR.start({ language: this.lang || "ko-KR", partialResults: true, popup: false, maxResults: 1 });
        })().catch(() => { fire(this.onerror, { error: "network" }); this._finish(); });
      }
      _finish() {
        if (this._done) return; this._done = true;
        if (this._last) fire(this.onresult, result(this._last, true));
        this._subs.splice(0).forEach(sub => { try { sub.remove(); } catch (_) {} });
        fire(this.onend);
      }
      stop() { SR.stop().catch(() => {}).finally(() => setTimeout(() => this._finish(), 350)); }
      abort() { this._last = ""; this.stop(); }
    }
    window.SpeechRecognition = NativeSpeechRecognition;
  }

  if (TTS) {
    const voices = [{ lang: "ko-KR", name: "Korean", default: true }, { lang: "uz-UZ", name: "Uzbek" }];
    window.SpeechSynthesisUtterance = class { constructor(text) { this.text = text || ""; this.lang = "ko-KR"; this.rate = 1; this.voice = null; } };
    let current = 0;
    const synth = {
      speaking: false, pending: false, paused: false,
      getVoices: () => voices,
      speak(u) {
        const token = ++current; synth.speaking = true;
        TTS.speak({ text: String(u.text || ""), lang: u.lang || "ko-KR", rate: Math.max(0.5, Math.min(1.5, Number(u.rate) || 1)), pitch: 1, volume: 1, category: "playback" })
          .then(() => { if (token === current) { synth.speaking = false; fire(u.onend, {}); } })
          .catch(error => { if (token === current) { synth.speaking = false; fire(u.onerror, { error: String(error && error.message || error) }); } });
      },
      cancel() { current++; synth.speaking = false; TTS.stop().catch(() => {}); },
      pause() {}, resume() {}, addEventListener() {}, removeEventListener() {}, onvoiceschanged: null
    };
    try { Object.defineProperty(window, "speechSynthesis", { value: synth, configurable: true }); } catch (_) { window.speechSynthesis = synth; }
  }
})();
