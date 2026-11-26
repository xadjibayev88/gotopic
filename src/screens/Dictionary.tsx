// Lug'at: 30 000 koreyscha so'z (Wiktionary/Kaikki.org, CC BY-SA 4.0). Qidiruv serverda, sahifalab —
// telefon hech qachon butun lug'atni yuklamaydi. So'zni «So'zlarim»ga saqlash mumkin (mashqlarda chiqadi).
import { useEffect, useRef, useState } from 'react';
import { useStore } from '../state/store';
import { speak, ttsSupported } from '../engine/audio';
import { Ic } from '../components/Icons';
import { SaveMark } from '../components/Micro';

interface Entry {
  id: string;
  word: string;
  pos: string;
  uz: string;
  en: string;
  status: string;
  url: string;
}

const POS: { id: string; label: string }[] = [
  { id: '', label: 'Hammasi' },
  { id: 'noun', label: 'Ot' },
  { id: 'verb', label: "Fe'l" },
  { id: 'adj', label: 'Sifat' },
  { id: 'adv', label: 'Ravish' },
  { id: 'pron', label: 'Olmosh' },
  { id: 'num', label: 'Son' },
  { id: 'intj', label: 'Undov' },
];
const POS_LABEL: Record<string, string> = { noun: 'ot', verb: "fe'l", adj: 'sifat', adv: 'ravish', pron: 'olmosh', intj: 'undov', det: 'aniqlovchi', num: 'son', counter: "hisob so'zi" };
const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/[, ]/g, ' ');

export function Dictionary() {
  const { state, update } = useStore();
  const [q, setQ] = useState('');
  const [pos, setPos] = useState('');
  const [items, setItems] = useState<Entry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const [open, setOpen] = useState<string | null>(null);
  const ac = useRef<AbortController | null>(null);

  const load = (query: string, p: number, part: string, append: boolean) => {
    ac.current?.abort();
    const c = new AbortController();
    ac.current = c;
    setBusy(true);
    setError(false);
    fetch(`./api/dict?q=${encodeURIComponent(query)}&page=${p}&pos=${part}`, { signal: c.signal })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((d: { items: Entry[]; total: number; page: number; pages: number }) => {
        setItems((old) => (append ? [...old, ...d.items] : d.items));
        setTotal(d.total);
        setPage(d.page);
        setPages(d.pages);
        setBusy(false);
      })
      .catch((e: Error) => {
        if (e.name === 'AbortError') return;
        setBusy(false);
        setError(true);
      });
  };

  // Yozish to'xtagach 250 ms — qidiruv.
  useEffect(() => {
    const t = window.setTimeout(() => load(q, 1, pos, false), q ? 250 : 0);
    return () => clearTimeout(t);
  }, [q, pos]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => ac.current?.abort(), []);

  const mine = new Set(state.customWords.map((w) => w.fr));
  const toggle = (e: Entry) => {
    const meaning = (e.uz || e.en).split(/[;]/)[0].trim().slice(0, 80);
    update((s) =>
      s.customWords.some((w) => w.fr === e.word)
        ? { ...s, customWords: s.customWords.filter((w) => w.fr !== e.word) }
        : { ...s, customWords: [...s.customWords, { fr: e.word, uz: meaning, addedAt: Date.now() }].slice(-300) },
    );
  };

  return (
    <div className="page dict">
      <header className="dict-head">
        <div>
          <h1 className="page-title">Lug'at</h1>
          <p className="muted">{`${fmt(30000)} ta koreyscha so'z · o'zbekcha izohlar bilan`}</p>
        </div>
        <span className="dict-badge" aria-hidden="true">
          한
        </span>
      </header>

      <label className="dict-search">
        <Ic name="book" size={20} />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Qidiring: 사랑, sevgi yoki love"
          aria-label="Lug'atdan qidirish"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        {q && (
          <button type="button" className="dict-clear" onClick={() => setQ('')} aria-label="Tozalash">
            <Ic name="close" size={16} />
          </button>
        )}
      </label>

      <div className="dict-pos" role="tablist" aria-label="So'z turkumi">
        {POS.map((p) => (
          <button key={p.id} type="button" role="tab" aria-selected={pos === p.id} className={pos === p.id ? 'on' : ''} onClick={() => setPos(p.id)}>
            {p.label}
          </button>
        ))}
      </div>

      <p className="dict-count muted" aria-live="polite">
        {busy && !items.length ? 'Qidirilmoqda…' : error ? "Lug'at yuklanmadi — internetni tekshiring." : q ? `${fmt(total)} ta natija` : `${fmt(total)} ta so'z`}
      </p>

      <ul className="dict-list">
        {items.map((e) => {
          const isOpen = open === e.id;
          return (
            <li key={e.id} className={`dict-item ${isOpen ? 'open' : ''}`}>
              <button type="button" className="dict-main" onClick={() => setOpen(isOpen ? null : e.id)} aria-expanded={isOpen}>
                <span className="dict-word" lang="ko">
                  {e.word}
                </span>
                {e.pos && <span className="dict-pos-chip">{POS_LABEL[e.pos] ?? e.pos}</span>}
                <span className="dict-uz">{e.uz || e.en.split(';')[0]}</span>
              </button>
              <div className="dict-actions">
                {ttsSupported() && (
                  <button type="button" className="dict-speak" onClick={() => speak(e.word, state.settings.ttsRate)} aria-label={`${e.word} — tinglash`}>
                    <Ic name="speaker" size={18} />
                  </button>
                )}
              </div>
              {isOpen && (
                <div className="dict-more">
                  {e.uz && (
                    <p>
                      <b>O'zbekcha:</b> {e.uz}
                      {e.status !== 'source_only' && <span className="dict-ai">AI tarjima</span>}
                    </p>
                  )}
                  {e.en && (
                    <p className="muted" data-no-i18n>
                      <b>English:</b> {e.en}
                    </p>
                  )}
                  <div className="dict-more-row">
                    <SaveMark saved={mine.has(e.word)} count={state.customWords.length} onToggle={() => toggle(e)} label="So'zlarimga" />
                    {e.url && (
                      <a href={e.url} target="_blank" rel="noreferrer" className="dict-src">
                        Wiktionary ›
                      </a>
                    )}
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {page < pages && !error && (
        <button type="button" className="btn btn-ghost btn-lg dict-more-btn" disabled={busy} onClick={() => load(q, page + 1, pos, true)}>
          {busy ? 'Yuklanmoqda…' : "Ko'proq ko'rsatish"}
        </button>
      )}

      <p className="dict-license muted">
        Manba: Wiktionary (Kaikki.org), CC BY-SA 4.0. O'zbekcha izohlar — AI tarjima, mutaxassis tekshiruvidan o'tmagan.
      </p>
    </div>
  );
}
