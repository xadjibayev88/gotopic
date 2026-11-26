import { useEffect, useMemo, useRef, useState } from 'react';
import { ViviPeek } from './ViviPeek';
import { COURSE, type Word } from '../data/course';
import type { Exercise } from '../engine/exercises';
import type { Answer } from '../engine/evaluate';
import { playSfx, speak, ttsSupported } from '../engine/audio';
import { normalize } from '../engine/text';
import { shuffle } from '../engine/random';
import { useStore } from '../state/store';
import { Mascot } from './Mascot';

interface ViewProps<E extends Exercise['kind']> {
  ex: Extract<Exercise, { kind: E }>;
  locked: boolean;
  onAnswer: (a: Answer | null) => void;
}

// ---------- Lug'at izohlari (so'z ustiga bosilganda) ----------

const HINTS: Map<string, string> = (() => {
  const m = new Map<string, string>();
  for (const u of COURSE)
    for (const l of u.lessons)
      for (const w of l.words)
        for (const part of w.fr.split('/')) {
          const p = normalize(part);
          m.set(p, w.uz);
          const core = p.replace(/^(le|la|l'|un|une)\s*/, '');
          if (core && core !== p && !m.has(core)) m.set(core, w.uz);
        }
  return m;
})();

function hintFor(tokens: string[], i: number): { text: string; span: number } | null {
  for (let span = Math.min(3, tokens.length - i); span >= 1; span--) {
    const key = normalize(tokens.slice(i, i + span).join(' '));
    const h = HINTS.get(key);
    if (h) return { text: h, span };
  }
  return null;
}

export function HintSentence({ text, speakable = true }: { text: string; speakable?: boolean }) {
  const { state } = useStore();
  const tokens = useMemo(() => text.split(/\s+/), [text]);
  const [open, setOpen] = useState<number | null>(null);
  const groups: { start: number; span: number; hint: string | null }[] = [];
  for (let i = 0; i < tokens.length; ) {
    const clean = tokens.map((t) => t.replace(/[.,!?;:«»]/g, ''));
    const h = hintFor(clean, i);
    groups.push({ start: i, span: h?.span ?? 1, hint: h?.text ?? null });
    i += h?.span ?? 1;
  }
  return (
    <span className="hint-sentence">
      {groups.map((g, gi) => {
        const words = tokens.slice(g.start, g.start + g.span).join(' ');
        return (
          <span key={gi} className="hint-wrap">
            <button
              type="button"
              className={`hint-word ${g.hint ? 'has-hint' : ''}`}
              onClick={() => {
                if (speakable) speak(words.replace(/[.,!?;:«»]/g, ''), state.settings.ttsRate);
                setOpen(open === gi ? null : gi);
              }}
              onBlur={() => setOpen(null)}
            >
              {words}
            </button>
            {open === gi && g.hint && <span className="hint-pop">{g.hint}</span>}{' '}
          </span>
        );
      })}
    </span>
  );
}

function SpeakerButton({ text, slow = false, big = false }: { text: string; slow?: boolean; big?: boolean }) {
  const { state } = useStore();
  if (!ttsSupported()) return null;
  return (
    <button
      type="button"
      className={`speaker ${big ? 'speaker-big' : ''} ${slow ? 'speaker-slow' : ''}`}
      aria-label={slow ? 'Sekin tinglash' : 'Tinglash'}
      onClick={() => speak(text, slow ? 0.55 : state.settings.ttsRate)}
    >
      {slow ? '🐢' : '🔊'}
    </button>
  );
}

// ---------- 1. Rasm/so'z tanlash ----------

export function PickView({ ex, locked, onAnswer }: ViewProps<'pick'>) {
  const { state } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => setSel(null), [ex.id]);
  const choose = (w: Word) => {
    if (locked) return;
    setSel(w.fr);
    speak(w.fr, state.settings.ttsRate);
    playSfx('tap', state.settings.sound);
    onAnswer({ kind: 'pick', fr: w.fr });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length && !(e.target instanceof HTMLTextAreaElement)) choose(ex.options[n - 1]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  return (
    <div className="ex">
      <div className="ex-badge">✨ Yangi so'z</div>
      <h2 className="ex-title">
        Qaysi biri <span className="accent">«{ex.word.uz}»</span>?
      </h2>
      <div className="pick-grid">
        {ex.options.map((w, i) => (
          <button key={w.fr} type="button" className={`pick-card ${sel === w.fr ? 'selected' : ''}`} onClick={() => choose(w)} disabled={locked}>
            <span className="pick-emoji">{w.emoji ?? '🔤'}</span>
            <span className="pick-fr">{w.fr}</span>
            <span className="kbd">{i + 1}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- 2. So'z banki (tarjima / tinglash) ----------

export function BuildView({ ex, locked, onAnswer }: ViewProps<'build'> | ViewProps<'listen'>) {
  const { state } = useStore();
  const [picked, setPicked] = useState<number[]>([]);
  useEffect(() => setPicked([]), [ex.id]);
  useEffect(() => {
    if (ex.kind === 'listen') {
      const t = setTimeout(() => speak(ex.sentence.fr, state.settings.ttsRate), 300);
      return () => clearTimeout(t);
    }
    if (ex.kind === 'build' && ex.dir === 'fr2uz') {
      const t = setTimeout(() => speak(ex.sentence.fr, state.settings.ttsRate), 300);
      return () => clearTimeout(t);
    }
  }, [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (next: number[]) => {
    setPicked(next);
    onAnswer(next.length ? { kind: 'tokens', text: next.map((i) => ex.tokens[i]).join(' ') } : null);
  };
  const add = (i: number) => {
    if (locked || picked.includes(i)) return;
    playSfx('tap', state.settings.sound);
    if (ex.kind === 'listen' || (ex.kind === 'build' && ex.dir === 'uz2fr')) speak(ex.tokens[i], state.settings.ttsRate);
    set([...picked, i]);
  };
  const remove = (i: number) => {
    if (locked) return;
    set(picked.filter((p) => p !== i));
  };

  const isListen = ex.kind === 'listen';
  return (
    <div className="ex">
      <h2 className="ex-title">{isListen ? 'Eshitganingizni yozing' : 'Gapni tarjima qiling'}</h2>
      {isListen ? (
        <div className="listen-row">
          <SpeakerButton text={ex.sentence.fr} big />
          <SpeakerButton text={ex.sentence.fr} slow />
        </div>
      ) : (
        <div className="prompt-row">
          <div className="prompt-mascot"><Mascot size={78} /></div>
          <div className="bubble">
            {ex.dir === 'fr2uz' && <SpeakerButton text={ex.sentence.fr} />}
            {ex.dir === 'fr2uz' ? <HintSentence text={ex.prompt} /> : <span>{ex.prompt}</span>}
          </div>
        </div>
      )}
      <div className="answer-lines">
        {picked.map((i) => (
          <button key={i} type="button" className="token in-answer" onClick={() => remove(i)} disabled={locked}>
            {ex.tokens[i]}
          </button>
        ))}
      </div>
      <div className="bank">
        {ex.tokens.map((t, i) => (
          <span key={i} className="token-slot">
            <button type="button" className={`token ${picked.includes(i) ? 'used' : ''}`} onClick={() => add(i)} disabled={locked || picked.includes(i)}>
              {t}
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------- 3. To'g'ri tarjimani tanlash ----------

export function ChooseView({ ex, locked, onAnswer }: ViewProps<'choose'>) {
  const { state } = useStore();
  const [sel, setSel] = useState<string | null>(null);
  useEffect(() => {
    setSel(null);
    const t = setTimeout(() => speak(ex.sentence.fr, state.settings.ttsRate), 300);
    return () => clearTimeout(t);
  }, [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const choose = (o: string) => {
    if (locked) return;
    setSel(o);
    playSfx('tap', state.settings.sound);
    onAnswer({ kind: 'choose', text: o });
  };
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length) choose(ex.options[n - 1]);
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  });
  return (
    <div className="ex">
      <h2 className="ex-title">Ma'nosini tanlang</h2>
      <div className="prompt-row">
        <div className="prompt-mascot"><Mascot size={78} /></div>
        <div className="bubble">
          <SpeakerButton text={ex.sentence.fr} />
          <HintSentence text={ex.prompt} />
        </div>
      </div>
      <div className="choices">
        {ex.options.map((o, i) => (
          <button key={o} type="button" className={`choice ${sel === o ? 'selected' : ''}`} onClick={() => choose(o)} disabled={locked}>
            <span className="kbd">{i + 1}</span>
            {o}
          </button>
        ))}
      </div>
    </div>
  );
}

// ---------- 4. Yozib tarjima qilish ----------

const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ô', 'î', 'û', 'ù', 'ë', 'ï', 'œ'];

export function TypeView({ ex, locked, onAnswer }: ViewProps<'type'>) {
  const [text, setText] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setText('');
    ref.current?.focus();
    if (ex.dir === 'fr2uz' || ex.mode === 'dictation') {
      const t = setTimeout(() => speak(ex.sentence.fr), 300);
      return () => clearTimeout(t);
    }
  }, [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const mode = ex.mode ?? 'translate';
  const change = (v: string) => {
    setText(v);
    onAnswer(v.trim() ? { kind: 'type', text: v } : null);
  };
  const insert = (ch: string) => {
    const el = ref.current;
    if (!el) return change(text + ch);
    const s = el.selectionStart ?? text.length;
    const e = el.selectionEnd ?? text.length;
    const v = text.slice(0, s) + ch + text.slice(e);
    change(v);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(s + ch.length, s + ch.length);
    });
  };
  return (
    <div className="ex">
      <h2 className="ex-title">
        {mode === 'cloze' ? "Bo'sh joyni to'ldiring" : mode === 'dictation' ? 'Eshitganingizni to\'liq yozing (diktant)' : ex.dir === 'fr2uz' ? "O'zbek tiliga tarjima qiling" : 'Fransuz tiliga tarjima qiling'}
      </h2>
      {mode === 'dictation' ? (
        <div className="listen-row">
          <SpeakerButton text={ex.sentence.fr} big />
          <SpeakerButton text={ex.sentence.fr} slow />
        </div>
      ) : (
        <div className="prompt-row">
          <div className="prompt-mascot"><Mascot size={78} /></div>
          <div className="bubble">
            {ex.dir === 'fr2uz' && <SpeakerButton text={ex.sentence.fr} />}
            {mode === 'cloze' ? (
              <span className="cloze">
                <b className="cloze-fr">{ex.display}</b>
                <small className="cloze-uz">{ex.prompt}</small>
              </span>
            ) : ex.dir === 'fr2uz' ? (
              <HintSentence text={ex.prompt} />
            ) : (
              <span>{ex.prompt}</span>
            )}
          </div>
        </div>
      )}
      <div className="type-wrap">
      <ViviPeek mode={locked ? 'happy' : text ? 'typing' : 'idle'} className="type-peek" />
      <textarea
        ref={ref}
        className="type-input"
        value={text}
        disabled={locked}
        placeholder={mode === 'cloze' ? "Tushib qolgan so'zni yozing" : mode === 'dictation' ? 'Eshitgan gapingizni fransuzcha yozing' : ex.dir === 'fr2uz' ? "O'zbekcha yozing" : 'Fransuzcha yozing'}
        rows={mode === 'cloze' ? 1 : undefined}
        lang={ex.dir === 'fr2uz' ? 'uz' : 'fr'}
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        onChange={(e) => change(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') e.preventDefault();
        }}
      />
      </div>
      {ex.dir === 'uz2fr' && (
        <div className="accent-row">
          {ACCENTS.map((a) => (
            <button key={a} type="button" className="accent-key" onClick={() => insert(a)} disabled={locked}>
              {a}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ---------- 5. Juftliklarni topish ----------

export function MatchView({ ex, locked, onAnswer, onComplete }: ViewProps<'match'> & { onComplete: (mistakes: string[]) => void }) {
  const { state } = useStore();
  const left = useMemo(() => shuffle(ex.pairs), [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const right = useMemo(() => shuffle(ex.pairs), [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [selL, setSelL] = useState<string | null>(null);
  const [selR, setSelR] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [bad, setBad] = useState<string[]>([]);
  const mistakes = useRef<Set<string>>(new Set());

  useEffect(() => {
    setSelL(null);
    setSelR(null);
    setDone([]);
    setBad([]);
    mistakes.current = new Set();
    onAnswer(null);
  }, [ex.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!selL || !selR) return;
    if (selL === selR) {
      playSfx('match', state.settings.sound);
      const next = [...done, selL];
      setDone(next);
      setSelL(null);
      setSelR(null);
      if (next.length === ex.pairs.length) {
        const m = [...mistakes.current];
        onAnswer({ kind: 'match', mistakes: m });
        setTimeout(() => onComplete(m), 350);
      }
    } else {
      playSfx('wrong', state.settings.sound);
      mistakes.current.add(selL);
      mistakes.current.add(selR);
      setBad([selL, selR]);
      const t = setTimeout(() => {
        setBad([]);
        setSelL(null);
        setSelR(null);
      }, 500);
      return () => clearTimeout(t);
    }
  }, [selL, selR]); // eslint-disable-line react-hooks/exhaustive-deps

  const cls = (fr: string, sel: string | null) =>
    `match-card ${done.includes(fr) ? 'matched' : ''} ${sel === fr ? 'selected' : ''} ${bad.includes(fr) && sel === fr ? 'bad' : ''}`;
  return (
    <div className="ex">
      <h2 className="ex-title">Juftliklarni toping</h2>
      <div className="match-grid">
        <div className="match-col">
          {left.map((w) => (
            <button
              key={w.fr}
              type="button"
              className={cls(w.fr, selL)}
              disabled={locked || done.includes(w.fr)}
              onClick={() => {
                speak(w.fr, state.settings.ttsRate);
                setSelL(w.fr);
              }}
            >
              {w.fr}
            </button>
          ))}
        </div>
        <div className="match-col">
          {right.map((w) => (
            <button key={w.fr} type="button" className={cls(w.fr, selR)} disabled={locked || done.includes(w.fr)} onClick={() => setSelR(w.fr)}>
              {w.uz}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

