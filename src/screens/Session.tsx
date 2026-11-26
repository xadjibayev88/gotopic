import { FishIcon } from '../components/TopBarIcons';
import { Ic } from '../components/Icons';
import { CoinIcon } from '../components/TopBarIcons';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ALL_LESSONS, CEFR, COURSE, findLesson, type Cefr, type Sentence, type Word } from '../data/course';
import { buildLesson, buildPractice, type Exercise } from '../engine/exercises';
import { evaluate, type Answer, type Evaluation } from '../engine/evaluate';
import {
  applySession,
  buyHeartRefill,
  HEART_REFILL_COST,
  loseHeart,
  wordRecall,
  type Reward,
  type SessionResult,
} from '../engine/game';
import { playSfx, speak, ttsSupported, vibrate } from '../engine/audio';
import { sample, shuffle } from '../engine/random';
import { useStore } from '../state/store';
import { useAccount } from '../state/account';
import { BuildView, ChooseView, MatchView, PickView, TypeView } from '../components/exercises';
import { Mascot } from '../components/Mascot';
import { Result } from './Result';

export type SessionConfig =
  | { kind: 'lesson'; lessonId: string }
  | { kind: 'review'; unitIndex: number }
  /** Darajadan sakrash testi: oldingi daraja materialidan, ko'pi bilan 3 xato. */
  | { kind: 'jump'; level: Cefr }
  | { kind: 'practice'; mode: 'smart' | 'mistakes' | 'listening' };

const PRAISE = ['Voilà !', 'Voilà !', 'Ajoyib!', "Zo'r!", 'Barakalla!', 'Juda yaxshi!', 'Très bien !', 'Parfait !', 'Qoyil!', 'Super!'];

function generate(cfg: SessionConfig, state: ReturnType<typeof useStore>['state']): Exercise[] {
  const tts = ttsSupported() && state.settings.listening;
  if (cfg.kind === 'lesson') {
    const f = findLesson(cfg.lessonId)!;
    return buildLesson(f.lesson, f.unit, { tts, level: state.lessonsDone[cfg.lessonId] ?? 0 });
  }
  if (cfg.kind === 'jump') {
    const prev = CEFR[CEFR.indexOf(cfg.level) - 1] ?? 'A1';
    const units = COURSE.filter((u) => (u.level ?? 'A1') === prev);
    const words = units.flatMap((u) => u.lessons.flatMap((l) => l.words));
    const sents = units.flatMap((u) => u.lessons.flatMap((l) => l.sentences));
    return buildPractice(sample(words, 6), sample(sents, 10), words, sents, { tts }).slice(0, 15);
  }
  if (cfg.kind === 'review') {
    const u = COURSE[cfg.unitIndex];
    const words = u.lessons.flatMap((l) => l.words);
    const sents = u.lessons.flatMap((l) => l.sentences);
    return buildPractice(sample(words, 6), sample(sents, 8), words, sents, { tts }).slice(0, 14);
  }
  // Amaliyot: faqat o'tilgan darslar materialidan.
  const done = ALL_LESSONS.filter((l) => state.lessonsDone[l.id]);
  const lessons = done.length ? done : ALL_LESSONS.slice(0, 1);
  const custom = state.customWords.map((w) => ({ fr: w.fr, uz: w.uz, emoji: '📝' }));
  const vocab = [...lessons.flatMap((l) => l.words), ...custom];
  const sents = lessons.flatMap((l) => l.sentences);
  const now = Date.now();
  if (cfg.mode === 'mistakes') {
    const refs = Object.keys(state.mistakes);
    const mw = vocab.filter((w) => refs.includes(`w:${w.fr}`));
    const ms = sents.filter((s) => refs.includes(`s:${s.fr}`));
    const words = mw.length >= 2 ? mw : weakest(vocab, state, now).slice(0, 4);
    return buildPractice(words, ms.length ? ms : sample(sents, 5), vocab, sents, { tts });
  }
  if (cfg.mode === 'listening') {
    return buildPractice([], sample(sents, 8), vocab, sents, { tts }).map((e) => e);
  }
  return buildPractice(weakest(vocab, state, now).slice(0, 5), weakestSentences(sents, vocab, state, now).slice(0, 7), vocab, sents, { tts });
}

function weakest(vocab: Word[], state: ReturnType<typeof useStore>['state'], now: number): Word[] {
  return shuffle(vocab).sort((a, b) => score(a.fr) - score(b.fr));
  function score(fr: string) {
    const st = state.words[fr];
    return st ? wordRecall(st, now) : 0.5;
  }
}

function weakestSentences(sents: Sentence[], vocab: Word[], state: ReturnType<typeof useStore>['state'], now: number): Sentence[] {
  const weak = new Set(weakest(vocab, state, now).slice(0, 8).map((w) => w.fr.split(' ').pop()!.toLowerCase()));
  return shuffle(sents).sort((a, b) => hits(b) - hits(a));
  function hits(s: Sentence) {
    return s.fr
      .toLowerCase()
      .split(/[\s']+/)
      .filter((t) => weak.has(t)).length;
  }
}

export function Session({ config, onExit }: { config: SessionConfig; onExit: (completed?: boolean) => void }) {
  const { state, update } = useStore();
  const { premium } = useAccount();
  const initial = useMemo(() => generate(config, state), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [queue, setQueue] = useState<Exercise[]>(initial);
  const [pos, setPos] = useState(0);
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [evaluation, setEvaluation] = useState<Evaluation | null>(null);
  const [solved, setSolved] = useState(0);
  const [combo, setCombo] = useState(0);
  const [showQuit, setShowQuit] = useState(false);
  const [outOfHearts, setOutOfHearts] = useState(false);
  const [finished, setFinished] = useState<Reward | null>(null);
  const [praise, setPraise] = useState(PRAISE[0]);
  const stats = useRef({ firstTry: 0, mistakes: 0, bestCombo: 0, start: Date.now(), words: [] as { fr: string; correct: boolean }[], mistakeRefs: new Set<string>(), fixed: new Set<string>() });

  const [total, setTotal] = useState(initial.length);
  const ex = queue[pos];
  const usesHearts = config.kind !== 'practice' && config.kind !== 'jump' && !state.unlimitedHearts && !premium;
  const [jumpFailed, setJumpFailed] = useState(false);
  const JUMP_MAX_MISTAKES = 3;
  const accent = config.kind === 'lesson' ? findLesson(config.lessonId)!.unit.color : config.kind === 'review' ? COURSE[config.unitIndex].color : config.kind === 'jump' ? '#F59E0B' : '#8B5CF6';

  const finish = useCallback(() => {
    const st = stats.current;
    const result: SessionResult = {
      kind: config.kind === 'jump' ? 'practice' : config.kind,
      lessonId: config.kind === 'lesson' ? config.lessonId : config.kind === 'review' ? `${COURSE[config.unitIndex].id}-review` : undefined,
      total,
      firstTryCorrect: st.firstTry,
      mistakesCount: st.mistakes,
      bestCombo: st.bestCombo,
      durationMs: Date.now() - st.start,
      wordResults: st.words,
      mistakeRefs: [...st.mistakeRefs].filter((r) => !st.fixed.has(r) || config.kind === 'lesson'),
      fixedRefs: config.kind === 'practice' ? [...st.fixed] : [],
    };
    let r = applySession(state, result);
    if (config.kind === 'jump') {
      // Test topshirildi: shu darajagacha bo'lgan barcha darslar ochiladi.
      const first = COURSE.find((u) => (u.level ?? 'A1') === config.level)?.lessons[0].id;
      const upto = ALL_LESSONS.findIndex((l) => l.id === first);
      const lessonsDone = { ...r.state.lessonsDone };
      ALL_LESSONS.slice(0, Math.max(0, upto)).forEach((l) => (lessonsDone[l.id] = Math.max(1, lessonsDone[l.id] ?? 0)));
      r = { ...r, state: { ...r.state, lessonsDone } };
    }
    update(() => r.state);
    playSfx('complete', state.settings.sound);
    setFinished(r.reward);
  }, [config, total, update, state]);

  const check = useCallback(
    (forced?: Answer) => {
      const a = forced ?? answer;
      if (!ex || evaluation || !a) return;
      const ev = evaluate(ex, a);
      const st = stats.current;
      if (ex.kind === 'match' && a.kind === 'match') {
        for (const w of ex.pairs) st.words.push({ fr: w.fr, correct: !a.mistakes.includes(w.fr) });
      } else {
        for (const fr of ex.wordRefs) st.words.push({ fr, correct: ev.correct });
      }
      if (ev.correct) {
        const isRetry = ex.retry;
        if (!isRetry) st.firstTry++;
        st.fixed.add(ex.ref);
        const c = combo + 1;
        setCombo(c);
        st.bestCombo = Math.max(st.bestCombo, c);
        setSolved((n) => n + 1);
        setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
        if (ex.kind !== 'match') playSfx('correct', state.settings.sound);
      } else {
        st.mistakes++;
        st.mistakeRefs.add(ex.ref);
        st.fixed.delete(ex.ref);
        setCombo(0);
        playSfx('wrong', state.settings.sound);
        vibrate(120);
        if (config.kind === 'jump') {
          if (st.mistakes > JUMP_MAX_MISTAKES) setJumpFailed(true);
        } else {
          // Xato mashq oxirida qayta beriladi.
          setQueue((q) => [...q, { ...ex, id: ex.id + 'r', retry: true }]);
        }
        if (usesHearts) update((s) => loseHeart(s));
      }
      setEvaluation(ev);
      if (ex.kind === 'type' || ex.kind === 'build' || ex.kind === 'listen') {
        if (!(ex.kind === 'build' && ex.dir === 'fr2uz' && ev.correct)) speak(ex.sentence.fr, state.settings.ttsRate);
      }
    },
    [answer, ex, evaluation, combo, usesHearts, update, state.settings],
  );

  const next = useCallback(() => {
    if (!evaluation) return;
    if (usesHearts && state.hearts <= 0) {
      setOutOfHearts(true);
      return;
    }
    setEvaluation(null);
    setAnswer(null);
    if (pos + 1 >= queue.length) finish();
    else setPos(pos + 1);
  }, [evaluation, usesHearts, state.hearts, pos, queue.length, finish]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || showQuit || outOfHearts || finished) return;
      e.preventDefault();
      if (evaluation) next();
      else check();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [evaluation, next, check, showQuit, outOfHearts, finished]);

  if (finished) return <Result reward={finished} config={config} onDone={() => onExit(true)} />;
  if (!ex) return null;

  const progress = Math.min(1, solved / total);
  const skip = () => {
    // "Hozir tinglay olmayman" — qolgan tinglash mashqlarini olib tashlaymiz.
    update((s) => ({ ...s, settings: { ...s.settings, listening: false } }));
    const rest = queue.slice(pos);
    const kept = rest.filter((e) => e.kind !== 'listen');
    const removedOriginals = rest.filter((e) => e.kind === 'listen' && !e.retry).length;
    setTotal((t) => Math.max(1, t - removedOriginals));
    setAnswer(null);
    if (!kept.length) finish();
    else setQueue([...queue.slice(0, pos), ...kept]);
  };

  return (
    <div className="session" style={{ ['--accent' as string]: accent }}>
      <header className="session-top">
        <button type="button" className="icon-btn" aria-label="Chiqish" onClick={() => setShowQuit(true)}>
          <Ic name="close" size={20} />
        </button>
        <div className="progress" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
          <div className="progress-fill" style={{ width: `${Math.max(3, progress * 100)}%` }}>
            <div className="progress-shine" />
          </div>
          {combo >= 3 && <span className="combo"><Ic name="bolt" size={14} /> {combo}x</span>}
        </div>
        {usesHearts ? (
          <div className="stat heart">
            <FishIcon full={state.hearts > 0} /> <b>{state.hearts}</b>
          </div>
        ) : (
          <div className="stat heart"><FishIcon full /> ∞</div>
        )}
      </header>

      <main className="session-body" key={ex.id}>
        {ex.retry && <div className="retry-tag">↺ Oldingi xato</div>}
        {ex.kind === 'pick' && <PickView ex={ex} locked={!!evaluation} onAnswer={setAnswer} />}
        {(ex.kind === 'build' || ex.kind === 'listen') && <BuildView ex={ex as never} locked={!!evaluation} onAnswer={setAnswer} />}
        {ex.kind === 'choose' && <ChooseView ex={ex} locked={!!evaluation} onAnswer={setAnswer} />}
        {ex.kind === 'type' && <TypeView ex={ex} locked={!!evaluation} onAnswer={setAnswer} />}
        {ex.kind === 'match' && <MatchView ex={ex} locked={!!evaluation} onAnswer={setAnswer} onComplete={(m) => check({ kind: 'match', mistakes: m })} />}
      </main>

      <footer className={`session-foot ${evaluation ? (evaluation.correct ? 'ok' : 'bad') : ''}`}>
        {evaluation?.correct && (
          // Vivi sehr ko'rsatadi: har to'g'ri javobda «Voilà !»
          <div className="voila-burst" key={`v-${pos}-${solved}`} aria-hidden="true">
            <Mascot mood="cheer" size={72} />
            <b>Voilà !</b>
            <i className="spark s1">✦</i>
            <i className="spark s2">✧</i>
            <i className="spark s3">✦</i>
            <i className="spark s4">✧</i>
            <i className="spark s5">✦</i>
          </div>
        )}
        <div className="foot-inner">
          {evaluation ? (
            <div className="feedback">
              <div className="fb-icon"><Ic name={evaluation.correct ? 'check' : 'close'} size={22} /></div>
              <div className="fb-text">
                <div className="fb-title">{evaluation.correct ? praise : "Noto'g'ri"}</div>
                {!evaluation.correct && evaluation.solution && (
                  <div className="fb-sol">
                    <span>To'g'ri javob:</span> {evaluation.solution}
                  </div>
                )}
                {evaluation.correct && evaluation.note && (
                  <div className="fb-sol">
                    <span>{evaluation.note}</span> {evaluation.solution}
                  </div>
                )}
                {evaluation.correct && !evaluation.note && ex.kind === 'listen' && <div className="fb-sol muted">{ex.sentence.uz}</div>}
              </div>
            </div>
          ) : (
            ex.kind === 'listen' && (
              <button type="button" className="btn btn-ghost" onClick={skip}>
                Hozir tinglay olmayman
              </button>
            )
          )}
          {ex.kind !== 'match' || evaluation ? (
            <button
              type="button"
              className={`btn btn-lg ${evaluation ? (evaluation.correct ? 'btn-success' : 'btn-danger') : 'btn-success'}`}
              disabled={!evaluation && !answer}
              onClick={() => (evaluation ? next() : check())}
            >
              {evaluation ? 'Davom etish' : 'Tekshirish'}
            </button>
          ) : null}
        </div>
      </footer>

      {showQuit && (
        <div className="modal-back" onClick={() => setShowQuit(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <Mascot mood="sad" size={110} />
            <h3>Rostdan chiqmoqchimisiz?</h3>
            <p className="muted">Chiqsangiz, bu darsdagi natijalar saqlanmaydi.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowQuit(false)}>
              Davom etaman
            </button>
            <button type="button" className="btn btn-text danger" onClick={() => onExit()}>
              Darsni tugatish
            </button>
          </div>
        </div>
      )}

      {jumpFailed && evaluation && (
        <div className="modal-back">
          <div className="sheet">
            <Mascot mood="sad" size={96} />
            <h3>Hozircha yetmadi</h3>
            <p className="muted">{`Testda ${JUMP_MAX_MISTAKES} tadan ko'p xato bo'ldi. Darslarni ketma-ket o'tib, keyinroq yana urinib ko'ring — Vivi sizga ishonadi!`}</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => onExit()}>
              Tushunarli
            </button>
          </div>
        </div>
      )}
      {outOfHearts && (
        <div className="modal-back">
          <div className="sheet">
            <div className="big-emoji">💔</div>
            <h3>Baliqchalar tugadi!</h3>
            <p className="muted">Har 30 daqiqada bitta baliqcha qaytadi. Yoki mashq qilib baliqcha ishlab oling — Vivi och qolmasin!</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              disabled={state.gems < HEART_REFILL_COST}
              onClick={() => {
                update((s) => buyHeartRefill(s) ?? s);
                setOutOfHearts(false);
                setEvaluation(null);
                setAnswer(null);
                if (pos + 1 >= queue.length) finish();
                else setPos(pos + 1);
              }}
            >
              Akvariumni to'ldirish — <CoinIcon /> {HEART_REFILL_COST}
            </button>
            <button type="button" className="btn btn-text" onClick={() => onExit()}>
              Chiqish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
