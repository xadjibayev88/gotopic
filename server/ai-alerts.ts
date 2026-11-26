// Operator alerts for the AI key: Telegram message when the free-tier limit is reached or the key stops working.
// Throttled per problem kind so a burst of failing requests sends one message, not hundreds.

export type AiKeyProblem = 'quota' | 'invalid_key';

export interface AiKeyProblemDetail {
  readonly kind: AiKeyProblem;
  readonly model: string;
  /** True when Google said the per-day quota is exhausted (not just a per-minute burst). */
  readonly daily?: boolean;
}

const THROTTLE_MS: Record<AiKeyProblem, number> = { quota: 3 * 60 * 60 * 1000, invalid_key: 60 * 60 * 1000 };

export function aiKeyAlertText(problem: AiKeyProblemDetail): string {
  if (problem.kind === 'invalid_key') {
    return '🔑 <b>Vivi AI kaliti ishlamayapti</b>\n'
      + `Google kalitni rad etdi (model: <code>${problem.model}</code>). Kalit o‘chirilgan yoki noto‘g‘ri bo‘lishi mumkin.\n\n`
      + 'Yangi kalit: aistudio.google.com/apikey → serverdagi <code>GEMINI_API_KEY</code> ni almashtiring va serverni qayta ishga tushiring.';
  }
  return `⚠️ <b>Vivi AI ${problem.daily ? 'kunlik' : 'bepul'} limiti tugadi</b>\n`
    + `Google so‘rovlarni rad etyapti (model: <code>${problem.model}</code>). Foydalanuvchilar hozir Vivi javobini olmaydi.\n\n`
    + (problem.daily
      ? 'Kunlik limit AQSh Tinch okeani vaqti bilan yarim tunda (Toshkentda taxminan 12:00–13:00) yangilanadi. '
      : 'Daqiqalik limit odatda bir daqiqada tiklanadi; xabar takrorlansa, kunlik limit tugagan. ')
    + 'Yangi kalit qo‘shish: <code>GEMINI_API_KEY</code> ni almashtiring va serverni qayta ishga tushiring.';
}

/** Returns a reporter that forwards at most one alert per kind per throttle window. */
export function createAiKeyAlerter(send: (html: string) => Promise<unknown> | unknown, now: () => number = Date.now) {
  const last = new Map<AiKeyProblem, number>();
  return (problem: AiKeyProblemDetail): boolean => {
    const t = now();
    const prev = last.get(problem.kind);
    if (prev !== undefined && t - prev < THROTTLE_MS[problem.kind]) return false;
    last.set(problem.kind, t);
    try {
      void Promise.resolve(send(aiKeyAlertText(problem))).catch((e) => console.error('ai-alert:', (e as Error).message));
    } catch (e) {
      console.error('ai-alert:', (e as Error).message);
    }
    return true;
  };
}
