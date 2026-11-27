// Vivi AI ovozi (server TTS, Gemini) — matnli suhbat, so'z chiplari va tahlil uchun.
// Telefon (brauzer) ovozi ishlatilmaydi: ovoz limiti tugasa — jim qoladi, matn ko'rinishida davom etadi.
import { TtsQueue } from './tts';

let current: TtsQueue | null = null;

export function stopAiSpeak(): void {
  current?.dispose();
  current = null;
}

/** Bir nechta bo'lakni bitta navbatda o'qiydi (oldingi ovozni to'xtatadi). */
export function aiSpeak(parts: string[], onQuota?: () => void): void {
  stopAiSpeak();
  const list = parts.map((p) => p.trim()).filter(Boolean);
  if (!list.length) return;
  const q = new TtsQueue('elevenlabs');
  q.merge = true; // bepul tarifda so'rovlar sonini tejaydi
  q.onFail = (code) => code === 'tts_quota' && onQuota?.();
  current = q;
  q.unlock();
  for (const p of list) q.push(p);
  q.end();
}
