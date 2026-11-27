// TOPIK mashqlari: grammatika (96 ta, kategoriyalar bo'yicha), o'qish va tinglash (matn + savollar).
// To'g'ri javob — +2 XP (turnir, seriya va kunlik maqsadga qo'shiladi). Rasmiy TOPIK savollari emas.
import { useMemo, useState } from 'react';
import { GRAM_CATS, GRAMMAR, LISTENING, READING, type GramItem, type TopikText } from '../data/topik';
import { useStore } from '../state/store';
import { grantXp } from '../engine/game';
import { playSfx, speakQueue, ttsSupported } from '../engine/audio';
import { Ic } from '../components/Icons';
import { Mascot } from '../components/Mascot';

type Tab = 'gram' | 'read' | 'listen';
const XP_PER = 2;

function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function readTab(): Tab {
  const t = new URLSearchParams(location.hash.split('?')[1] ?? '').get('tab');
  return t === 'read' || t === 'listen' ? t : 'gram';
}

export function Topik() {
  const [tab, setTab] = useState<Tab>(readTab);
  return (
    <div className="page topik">
      <header className="tp-head">
        <div>
          <h1 className="page-title">TOPIK mashqlari</h1>
          <p className="muted">Grammatika, o'qish va tinglash — har to'g'ri javob +2 XP</p>
        </div>
        <span className="tp-badge" aria-hidden="true">
          T
        </span>
      </header>
      <div className="seg tp-seg" role="tablist">
        {(
          [
            ['gram', 'Grammatika'],
            ['read', "O'qish"],
            ['listen', 'Tinglash'],
          ] as const
        ).map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'gram' && <Grammar />}
      {tab === 'read' && <Texts items={READING} listen={false} />}
      {tab === 'listen' && <Texts items={LISTENING} listen />}
    </div>
  );
}

/** Bitta savol: variantlar aralashtiriladi; javobdan keyin to'g'ri variant yashil, xato — qizil. */
function Question({ prompt, options, answer, why, onDone, index, total }: { prompt: React.ReactNode; options: string[]; answer: string; why?: string; onDone: (ok: boolean) => void; index: number; total: number }) {
  const { state } = useStore();
  const opts = useMemo(() => shuffle(options), [options]);
  const [picked, setPicked] = useState<string | null>(null);
  const ok = picked === answer;
  return (
    <div className="tp-q">
      <div className="tp-progress" aria-label={`${index + 1} / ${total}`}>
        <span style={{ width: `${((index + (picked ? 1 : 0)) / total) * 100}%` }} />
      </div>
      <div className="tp-prompt">{prompt}</div>
      <div className="tp-options">
        {opts.map((o) => (
          <button
            key={o}
            type="button"
            className={`tp-opt ${picked ? (o === answer ? 'right' : o === picked ? 'wrong' : 'dim') : ''}`}
            disabled={!!picked}
            onClick={() => {
              setPicked(o);
              playSfx(o === answer ? 'correct' : 'wrong', state.settings.sound);
            }}
          >
            {o}
          </button>
        ))}
      </div>
      {picked && (
        <div className={`tp-feedback ${ok ? 'ok' : 'bad'}`}>
          <b>{ok ? `To'g'ri! +${XP_PER} XP` : `To'g'ri javob: ${answer}`}</b>
          {why && <p>{why}</p>}
          <button type="button" className="btn btn-primary btn-lg" onClick={() => onDone(ok)}>
            Davom etish
          </button>
        </div>
      )}
    </div>
  );
}

function Summary({ right, total, onAgain, onBack }: { right: number; total: number; onAgain: () => void; onBack: () => void }) {
  return (
    <div className="tp-summary">
      <Mascot mood={right / total >= 0.7 ? 'cheer' : 'happy'} size={120} />
      <h2>{`${right} / ${total} to'g'ri`}</h2>
      <p className="muted">{right / total >= 0.7 ? "Zo'r natija! TOPIKga bir qadam yaqinlashdingiz." : "Yaxshi boshlanish — yana bir marta urinib ko'ring."}</p>
      <b className="tp-xp">{`+${right * XP_PER} XP`}</b>
      <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
        Yana mashq qilish
      </button>
      <button type="button" className="btn btn-text" onClick={onBack}>
        Ro'yxatga qaytish
      </button>
    </div>
  );
}

function Grammar() {
  const { update } = useStore();
  const [cat, setCat] = useState<string | null>(null);
  const [set, setSet] = useState<GramItem[]>([]);
  const [i, setI] = useState(0);
  const [right, setRight] = useState(0);
  const start = (c: string) => {
    setCat(c);
    setSet(shuffle(c === 'Hammasi' ? GRAMMAR : GRAMMAR.filter((g) => g.cat === c)).slice(0, 10));
    setI(0);
    setRight(0);
  };
  if (!cat) {
    return (
      <div className="tp-cats">
        {['Hammasi', ...GRAM_CATS].map((c) => {
          const n = c === 'Hammasi' ? GRAMMAR.length : GRAMMAR.filter((g) => g.cat === c).length;
          return (
            <button key={c} type="button" className="tp-cat" onClick={() => start(c)}>
              <b>{c}</b>
              <small>{`${n} ta savol`}</small>
              <Ic name="arrow" size={18} />
            </button>
          );
        })}
      </div>
    );
  }
  if (i >= set.length) return <Summary right={right} total={set.length} onAgain={() => start(cat)} onBack={() => setCat(null)} />;
  const g = set[i];
  const [before, after] = g.q.split('___');
  return (
    <Question
      key={`${cat}-${i}`}
      index={i}
      total={set.length}
      prompt={
        <p className="tp-sentence" lang="ko">
          {before}
          <span className="tp-blank">{'＿＿'}</span>
          {after}
        </p>
      }
      options={g.options}
      answer={g.a}
      why={g.why}
      onDone={(ok) => {
        if (ok) {
          setRight((r) => r + 1);
          update((s) => grantXp(s, XP_PER));
        }
        setI((x) => x + 1);
      }}
    />
  );
}

function Texts({ items, listen }: { items: TopikText[]; listen: boolean }) {
  const { state, update } = useStore();
  const [open, setOpen] = useState<number | null>(null);
  const [qi, setQi] = useState(-1);
  const [right, setRight] = useState(0);
  const [showText, setShowText] = useState(!listen);
  const [showUz, setShowUz] = useState(false);

  const play = (t: TopikText) => {
    if (!ttsSupported()) return;
    // Dialogda ikki ovoz — tezlik bilan farqlaymiz (brauzerda bitta koreyscha ovoz bo'lishi mumkin).
    const lines = t.lines.map((l) => l.ko);
    // Android ilovada (WebView) speechSynthesis yo'q — telefon TTS ko'prigi orqali ketma-ket o'qiymiz.
    if (!('speechSynthesis' in window)) return speakQueue(lines, 0.9 * state.settings.ttsRate);
    let k = 0;
    const next = () => {
      if (k >= lines.length) return;
      const u = new SpeechSynthesisUtterance(lines[k]);
      u.lang = 'ko-KR';
      u.rate = (t.lines[k].who ? 1.0 : 0.88) * state.settings.ttsRate;
      u.pitch = t.lines[k].who ? 1.15 : 0.95;
      k++;
      u.onend = next;
      speechSynthesis.speak(u);
    };
    speechSynthesis.cancel();
    next();
  };

  if (open === null) {
    return (
      <div className="tp-cats">
        {items.map((t, n) => (
          <button
            key={t.title}
            type="button"
            className="tp-cat"
            onClick={() => {
              setOpen(n);
              setQi(-1);
              setRight(0);
              setShowText(!listen);
              setShowUz(false);
            }}
          >
            <b>{t.title}</b>
            <small>{`${t.qs.length} ta savol · ${listen ? 'dialog' : 'matn'}`}</small>
            <Ic name={listen ? 'headphones' : 'book'} size={18} />
          </button>
        ))}
      </div>
    );
  }
  const t = items[open];
  if (qi >= t.qs.length) return <Summary right={right} total={t.qs.length} onAgain={() => (setQi(-1), setRight(0))} onBack={() => setOpen(null)} />;
  return (
    <div className="tp-text">
      <div className="tp-card">
        <div className="tp-card-head">
          <h3>{t.title}</h3>
          {ttsSupported() && (
            <button type="button" className="tp-play" onClick={() => play(t)} aria-label="Tinglash">
              <Ic name={listen ? 'headphones' : 'speaker'} size={20} /> {listen ? 'Tinglash' : "O'qib berish"}
            </button>
          )}
        </div>
        {showText ? (
          <div className="tp-lines" lang="ko">
            {t.lines.map((l, k) => (
              <p key={k} className={t.lines.length > 1 ? `who-${l.who}` : ''}>
                {t.lines.length > 1 && <span className="tp-who">{l.who ? 'B' : 'A'}</span>}
                {l.ko}
              </p>
            ))}
          </div>
        ) : (
          <button type="button" className="btn btn-ghost" onClick={() => setShowText(true)}>
            Matnni ko'rsatish
          </button>
        )}
        {showText && (
          <button type="button" className="btn btn-text tp-uz-btn" onClick={() => setShowUz((v) => !v)}>
            {showUz ? 'Tarjimani yashirish' : "O'zbekcha tarjima"}
          </button>
        )}
        {showUz && <p className="tp-uz">{t.uz}</p>}
      </div>
      {qi < 0 ? (
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setQi(0)}>
          Savollarga o'tish
        </button>
      ) : (
        <Question
          key={`${open}-${qi}`}
          index={qi}
          total={t.qs.length}
          prompt={<p className="tp-sentence">{t.qs[qi].q}</p>}
          options={t.qs[qi].options}
          answer={t.qs[qi].options[0]}
          onDone={(ok) => {
            if (ok) {
              setRight((r) => r + 1);
              update((s) => grantXp(s, XP_PER));
            }
            setQi((x) => x + 1);
          }}
        />
      )}
      <button type="button" className="btn btn-text" onClick={() => setOpen(null)}>
        Ro'yxatga qaytish
      </button>
    </div>
  );
}
