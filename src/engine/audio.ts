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

/** Bir nechta fransuzcha iborani ketma-ket o'qiydi. */
export function speakQueue(parts: string[], rate = 0.9): void {
  if (!ttsSupported() || !parts.length) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  for (const p of parts) {
    const u = new SpeechSynthesisUtterance(p);
    u.lang = 'fr-FR';
    if (frVoice) u.voice = frVoice;
    u.rate = rate;
    synth.speak(u);
  }
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
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

/** Chastotasi siljiydigan ohang (kulgi, nafas). */
function sweep(f0: number, f1: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.12) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + start;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(f0, t0);
  o.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g).connect(c.destination);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
}

/** Qisqa shovqin (zarba, portlash) — filtrlangan oq shovqin. */
function noise(start: number, dur: number, freq = 900, gain = 0.3) {
  const c = ac();
  if (!c) return;
  const len = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len) ** 2;
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = 'lowpass';
  f.frequency.value = freq;
  const g = c.createGain();
  g.gain.value = gain;
  src.connect(f).connect(g).connect(c.destination);
  src.start(c.currentTime + start);
}

export type Sfx = 'correct' | 'wrong' | 'complete' | 'tap' | 'chest' | 'match' | 'hit' | 'whack' | 'shot' | 'boom' | 'pop' | 'squeak' | 'fart' | 'sneeze' | 'spit' | 'punch' | 'slap' | 'drama' | 'laugh' | 'kiss';

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
    case 'hit':
      tone(110, 0, 0.18, 'sine', 0.35);
      noise(0, 0.12, 1400, 0.35);
      break;
    case 'whack':
      tone(160, 0, 0.12, 'square', 0.12);
      noise(0, 0.09, 3000, 0.3);
      break;
    case 'shot':
      noise(0, 0.16, 5000, 0.45);
      tone(70, 0, 0.15, 'sine', 0.3);
      break;
    case 'boom':
      noise(0, 0.9, 500, 0.6);
      tone(50, 0, 0.7, 'sine', 0.45);
      break;
    case 'pop':
      tone(500, 0, 0.06, 'sine', 0.2);
      tone(900, 0.03, 0.06, 'sine', 0.12);
      break;
    case 'squeak':
      tone(1200, 0, 0.08, 'triangle', 0.12);
      tone(1600, 0.06, 0.1, 'triangle', 0.1);
      break;
    case 'sneeze':
      // «Aaa… apchxi!» — ko'tariluvchi nafas, so'ng keskin shovqin portlashi.
      sweep(320, 620, 0, 0.45, 'triangle', 0.08);
      noise(0.5, 0.35, 4200, 0.55);
      noise(0.52, 0.2, 1200, 0.4);
      break;
    case 'spit':
      noise(0, 0.08, 2600, 0.25);
      noise(0.1, 0.22, 5200, 0.45);
      tone(1400, 0.12, 0.05, 'square', 0.05);
      break;
    case 'punch':
      noise(0, 0.12, 900, 0.7);
      tone(70, 0, 0.25, 'sine', 0.5);
      break;
    case 'slap':
      noise(0, 0.07, 6000, 0.6);
      noise(0.01, 0.12, 2400, 0.35);
      break;
    case 'drama':
      // «Dan-dan-daaan!»
      tone(196, 0, 0.22, 'sawtooth', 0.12);
      tone(185, 0.26, 0.22, 'sawtooth', 0.12);
      tone(146.8, 0.52, 1.1, 'sawtooth', 0.14);
      tone(73.4, 0.52, 1.1, 'sine', 0.2);
      break;
    case 'laugh':
      for (let i = 0; i < 5; i++) sweep(520 - i * 18, 380 - i * 18, i * 0.13, 0.1, 'triangle', 0.1);
      break;
    case 'kiss':
      sweep(900, 2200, 0, 0.09, 'sine', 0.12);
      noise(0.08, 0.04, 3000, 0.2);
      break;
    case 'fart':
      tone(90, 0, 0.45, 'sawtooth', 0.12);
      noise(0, 0.4, 300, 0.25);
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
