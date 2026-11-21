import type { Exercise } from './exercises';
import { checkAnswer, normalize, type CheckVerdict } from './text';

export type Answer =
  | { kind: 'pick'; fr: string }
  | { kind: 'tokens'; text: string }
  | { kind: 'choose'; text: string }
  | { kind: 'type'; text: string }
  | { kind: 'match'; mistakes: string[] };

export interface Evaluation {
  correct: boolean;
  verdict: CheckVerdict;
  /** Ko'rsatiladigan to'g'ri javob. */
  solution: string;
  /** Qo'shimcha izoh (masalan, urg'u xatosi). */
  note?: string;
}

export function evaluate(ex: Exercise, a: Answer): Evaluation {
  switch (ex.kind) {
    case 'pick': {
      const ok = a.kind === 'pick' && a.fr === ex.word.fr;
      return { correct: ok, verdict: ok ? 'correct' : 'wrong', solution: `${ex.word.fr} — ${ex.word.uz}` };
    }
    case 'match':
      return { correct: true, verdict: 'correct', solution: '' };
    case 'choose': {
      const ok = a.kind === 'choose' && normalize(a.text) === normalize(ex.answer);
      return { correct: ok, verdict: ok ? 'correct' : 'wrong', solution: ex.answer };
    }
    case 'build':
    case 'listen':
    case 'type': {
      const text = a.kind === 'tokens' || a.kind === 'type' ? a.text : '';
      const r = checkAnswer(text, ex.accepted);
      // So'z bankida harf xatosi bo'lishi mumkin emas — faqat aniq moslik.
      const strict = ex.kind !== 'type';
      const ok = r.verdict === 'correct' || (!strict && (r.verdict === 'accent' || r.verdict === 'typo'));
      let note: string | undefined;
      if (ok && r.verdict === 'accent') note = "Urg'u belgilariga e'tibor bering:";
      if (ok && r.verdict === 'typo') note = 'Kichik xato bor:';
      return { correct: ok, verdict: ok ? r.verdict : 'wrong', solution: r.best, note };
    }
  }
}
