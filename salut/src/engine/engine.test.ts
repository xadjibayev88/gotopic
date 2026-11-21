import { describe, expect, it } from 'vitest';
import { ALL_LESSONS, COURSE } from '../data/course';
import { buildLesson, buildPractice, makeSentenceExercise } from './exercises';
import { evaluate } from './evaluate';
import { checkAnswer, normalize, tokenize } from './text';
import { rng } from './random';
import {
  applySession,
  buyFreeze,
  buyHeartRefill,
  HEART_REGEN_MS,
  initialState,
  leagueStandings,
  loseHeart,
  MAX_HEARTS,
  nodeState,
  buildPath,
  reconcileStreak,
  regenHearts,
  rolloverLeague,
  type SessionResult,
} from './game';
import { weekId } from './time';

const lessonResult = (lessonId: string, mistakes = 0): SessionResult => ({
  kind: 'lesson',
  lessonId,
  total: 12,
  firstTryCorrect: 12 - mistakes,
  mistakesCount: mistakes,
  bestCombo: 12 - mistakes,
  durationMs: 120_000,
  wordResults: [{ fr: 'bonjour', correct: true }],
  mistakeRefs: [],
  fixedRefs: [],
});

describe('text', () => {
  it("normalizes Uzbek apostrophes and punctuation", () => {
    expect(normalize("Yo‘q, rahmat!")).toBe(normalize("yo'q rahmat"));
    expect(normalize('Quel âge as-tu ?')).toBe('quel âge as tu');
  });
  it('accepts accent-less French as accent verdict', () => {
    expect(checkAnswer('je suis etudiant', ['Je suis étudiant.']).verdict).toBe('accent');
  });
  it('accepts single typos in longer answers', () => {
    expect(checkAnswer('Men talabamn', ['Men talabaman.']).verdict).toBe('typo');
    expect(checkAnswer('Men oqituvchi', ['Men talabaman.']).verdict).toBe('wrong');
  });
  it('accepts alternatives', () => {
    expect(checkAnswer('Ismim Ali', ['Mening ismim Ali.', 'Ismim Ali.']).verdict).toBe('correct');
  });
});

describe('course content', () => {
  it('has unique lesson ids and enough material', () => {
    const ids = ALL_LESSONS.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of ALL_LESSONS) {
      expect(l.words.length).toBeGreaterThanOrEqual(4);
      expect(l.sentences.length).toBeGreaterThanOrEqual(4);
    }
  });

  it('every sentence can be built from its word bank in both directions', () => {
    const r = rng(1);
    for (const u of COURSE) {
      const pool = u.lessons.flatMap((l) => l.sentences);
      const vocab = u.lessons.flatMap((l) => l.words);
      for (const s of pool) {
        for (const kind of ['build-fr2uz', 'build-uz2fr', 'listen'] as const) {
          const ex = makeSentenceExercise(kind, s, pool, vocab, r);
          if (ex.kind !== 'build' && ex.kind !== 'listen') throw new Error('kind');
          const target = ex.kind === 'build' && ex.dir === 'fr2uz' ? s.uz : s.fr;
          const needed = tokenize(target);
          const bank = ex.tokens.slice();
          for (const t of needed) {
            const i = bank.indexOf(t);
            expect(i, `${t} missing in bank for "${target}"`).toBeGreaterThanOrEqual(0);
            bank.splice(i, 1);
          }
          expect(evaluate(ex, { kind: 'tokens', text: needed.join(' ') }).correct).toBe(true);
          // Distraktorlar javob so'zlarini takrorlamasligi kerak
          expect(ex.tokens.length).toBeGreaterThan(needed.length);
        }
      }
    }
  });

  it('generates valid lessons for every lesson and level', () => {
    for (const u of COURSE)
      for (const l of u.lessons)
        for (const level of [0, 1, 3]) {
          const exs = buildLesson(l, u, { level, tts: true, rand: rng(level + 7) });
          expect(exs.length).toBeGreaterThanOrEqual(10);
          for (const ex of exs) {
            expect(ex).toBeTruthy();
            if (ex.kind === 'pick') {
              expect(ex.options.map((o) => o.fr)).toContain(ex.word.fr);
              expect(new Set(ex.options.map((o) => o.uz)).size).toBe(ex.options.length);
              expect(evaluate(ex, { kind: 'pick', fr: ex.word.fr }).correct).toBe(true);
            }
            if (ex.kind === 'choose') {
              expect(ex.options).toContain(ex.answer);
              expect(new Set(ex.options.map(normalize)).size).toBe(ex.options.length);
            }
            if (ex.kind === 'match') {
              expect(ex.pairs.length).toBeGreaterThanOrEqual(4);
              expect(new Set(ex.pairs.map((p) => p.uz)).size).toBe(ex.pairs.length);
            }
            if (ex.kind === 'type') expect(evaluate(ex, { kind: 'type', text: ex.accepted[0] }).correct).toBe(true);
          }
        }
  });

  it('builds practice sessions', () => {
    const words = COURSE[0].lessons.flatMap((l) => l.words);
    const sents = COURSE[0].lessons.flatMap((l) => l.sentences);
    const exs = buildPractice(words.slice(0, 5), sents.slice(0, 6), words, sents, { rand: rng(3), tts: false });
    expect(exs.length).toBeGreaterThanOrEqual(10);
    expect(exs.some((e) => e.kind === 'listen')).toBe(false);
  });
});

describe('game', () => {
  it('hearts regenerate over time', () => {
    let s = initialState(0);
    s = loseHeart(loseHeart(s, 0), 0);
    expect(s.hearts).toBe(MAX_HEARTS - 2);
    s = regenHearts(s, HEART_REGEN_MS + 10);
    expect(s.hearts).toBe(MAX_HEARTS - 1);
    s = regenHearts(s, HEART_REGEN_MS * 5);
    expect(s.hearts).toBe(MAX_HEARTS);
  });

  it('streak continues on consecutive days and resets after a gap', () => {
    let s = initialState();
    s = applySession(s, lessonResult('u1l1'), new Date(2026, 10, 2, 10)).state;
    expect(s.streak).toBe(1);
    s = applySession(s, lessonResult('u1l2'), new Date(2026, 10, 2, 18)).state;
    expect(s.streak).toBe(1);
    s = applySession(s, lessonResult('u1l3'), new Date(2026, 10, 3, 9)).state;
    expect(s.streak).toBe(2);
    expect(reconcileStreak(s, new Date(2026, 10, 6)).streak).toBe(0);
  });

  it('streak freeze covers a missed day', () => {
    let s = initialState();
    s = applySession(s, lessonResult('u1l1'), new Date(2026, 10, 2, 10)).state;
    s = { ...s, gems: 1000 };
    s = buyFreeze(s)!;
    const r = reconcileStreak(s, new Date(2026, 10, 4, 8));
    expect(r.streak).toBe(1);
    expect(r.streakFreezes).toBe(0);
    expect(applySession(r, lessonResult('u1l2'), new Date(2026, 10, 4, 9)).state.streak).toBe(2);
  });

  it('rewards perfect lessons and tracks daily goal', () => {
    const s = initialState();
    const { state, reward } = applySession({ ...s, dailyGoal: 10 }, lessonResult('u1l1'), new Date(2026, 10, 2));
    expect(reward.perfect).toBe(true);
    expect(reward.xp).toBeGreaterThanOrEqual(15);
    expect(reward.goalReachedNow).toBe(true);
    expect(state.lessonsDone.u1l1).toBe(1);
    expect(reward.newAchievements).toContain('first');
  });

  it('unlocks the path sequentially', () => {
    let s = initialState();
    const path = buildPath(0);
    expect(nodeState(s, path[0])).toBe('active');
    expect(nodeState(s, path[1])).toBe('locked');
    s = applySession(s, lessonResult('u1l1')).state;
    expect(nodeState(s, path[0])).toBe('done');
    expect(nodeState(s, path[1])).toBe('active');
  });

  it('league promotes winners at week rollover', () => {
    const mon = new Date(2026, 10, 2, 12);
    let s = initialState(mon.getTime());
    s = { ...s, league: { tier: 0, weekId: weekId(mon), weeklyXp: 100000 } };
    const next = rolloverLeague(s, new Date(2026, 10, 10, 12));
    expect(next.league.tier).toBe(1);
    expect(next.league.lastResult?.rank).toBe(1);
    expect(next.league.weeklyXp).toBe(0);
    expect(leagueStandings(next.league, new Date(2026, 10, 10, 12))).toHaveLength(30);
  });

  it('shop purchases spend gems', () => {
    const s = loseHeart(initialState());
    const r = buyHeartRefill({ ...s, gems: 400 })!;
    expect(r.hearts).toBe(MAX_HEARTS);
    expect(r.gems).toBe(50);
    expect(buyHeartRefill({ ...s, gems: 10 })).toBeNull();
  });
});
