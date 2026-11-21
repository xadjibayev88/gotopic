// Fransuzcha talaffuz (Web Speech API) va ovoz effektlari (WebAudio sintez).

let frVoice: SpeechSynthesisVoice | null = null;

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof SpeechSynthesisUtterance !== 'undefined';
}

function pickVoice() {
  if (!ttsSupported()) return;
  const voices = window.speechSynthesis.getVoices();
  const fr = voices.filter((v) => v.lang?.toLowerCase().startsWith('fr'));
  // Yuqori sifatli (Google / Enhanced / Natural) ovozlarni afzal ko'ramiz.
  frVoice =
    fr.find((v) => /natural|enhanced|premium|google/i.test(v.name) && /fr-FR/i.test(v.lang)) ??
    fr.find((v) => /fr-FR/i.test(v.lang)) ??
    fr[0] ??
    null;
}

if (ttsSupported()) {
  pickVoice();
  window.speechSynthesis.addEventListener?.('voiceschanged', pickVoice);
}

export function hasFrenchVoice(): boolean {
  return !!frVoice;
}

export function speak(text: string, rate = 0.9): void {
  if (!ttsSupported()) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'fr-FR';
  if (frVoice) u.voice = frVoice;
  u.rate = rate;
  u.pitch = 1;
  synth.speak(u);
}

// ---------- Effektlar ----------

let ctx: AudioContext | null = null;
function ac(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const C = window.AudioContext ?? (window as any).webkitAudioContext;
  if (!C) return null;
  ctx ??= new C();
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.015);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

export type Sfx = 'correct' | 'wrong' | 'complete' | 'tap' | 'chest' | 'match';

export function playSfx(kind: Sfx, enabled = true): void {
  if (!enabled) return;
  switch (kind) {
    case 'correct':
      tone(880, 0, 0.12, 'triangle');
      tone(1318.5, 0.09, 0.22, 'triangle');
      break;
    case 'match':
      tone(1046.5, 0, 0.1, 'triangle', 0.12);
      break;
    case 'wrong':
      tone(220, 0, 0.18, 'sawtooth', 0.08);
      tone(174.6, 0.12, 0.28, 'sawtooth', 0.08);
      break;
    case 'tap':
      tone(600, 0, 0.05, 'sine', 0.06);
      break;
    case 'chest':
    case 'complete':
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => tone(f, i * 0.11, 0.3, 'triangle', 0.14));
      break;
  }
}

export function vibrate(pattern: number | number[]): void {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* qo'llab-quvvatlanmaydi */
  }
}
