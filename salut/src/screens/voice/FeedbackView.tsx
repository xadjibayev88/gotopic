// Suhbat tahlili: hisoblagichlar, rekordlar, kuchli/zaif tomonlar va yangi so'zlarni lug'atga qo'shish.
import { useEffect, useState } from 'react';
import { compareStats, loadHistory, saveSession, type Feedback, type SessionRecord } from '../../engine/voice/prefs';
import { speak } from '../../engine/audio';
import { useStore } from '../../state/store';
import { KruaLive } from '../../components/KruaLive';
import type { ExplainLang } from '../../data/characters';

const mmss = (ms: number) => {
  const s = Math.round(ms / 1000);
  return s < 60 ? `${s} s` : `${Math.floor(s / 60)} daq ${s % 60} s`;
};

export function FeedbackView({ record, lang, onBack, onAgain, onExam }: { record: SessionRecord; lang: ExplainLang; onBack: () => void; onAgain: () => void; onExam: () => void }) {
  const { state, update } = useStore();
  const tooShort = record.turns.filter((t) => t.role === 'user').length < 2 || record.stats.words < 6;
  const [fb, setFb] = useState<Feedback | null | undefined>(record.feedback ?? undefined);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const cmp = compareStats(record, loadHistory(), record.id);

  useEffect(() => {
    if (tooShort || fb) {
      saveSession({ ...record, feedback: fb ?? null });
      return;
    }
    const ac = new AbortController();
    setFailed(false);
    (async () => {
      try {
        const res = await fetch('./api/tutor/feedback', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ turns: record.turns, lang, known: Object.keys(state.words).slice(0, 150) }),
          signal: ac.signal,
        });
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as Feedback;
        setFb(data);
        saveSession({ ...record, feedback: data });
      } catch (e) {
        if ((e as Error).name !== 'AbortError') {
          setFailed(true);
          saveSession({ ...record, feedback: null });
        }
      }
    })();
    return () => ac.abort();
  }, [attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  const added = new Set(state.customWords.map((w) => w.fr.toLowerCase()));
  const addWord = (w: { fr: string; uz: string }) =>
    update((s) => (s.customWords.some((x) => x.fr.toLowerCase() === w.fr.toLowerCase()) ? s : { ...s, customWords: [...s.customWords, { ...w, addedAt: Date.now() }].slice(-300) }));

  const counters = [
    { key: 'words', v: String(record.stats.words), l: "so'z", c: cmp.words },
    { key: 'sentences', v: String(record.stats.sentences), l: 'gap', c: cmp.sentences },
    { key: 'speaking', v: mmss(record.speakingMs), l: 'gapirish vaqti', c: cmp.speaking },
    { key: 'unique', v: String(record.stats.unique), l: "turli so'zlar", c: cmp.unique },
  ];

  return (
    <div className="page feedback-page">
      <div className="fb-hero">
        <KruaLive shape={tooShort ? 'drop' : fb ? 'star' : 'book'} state={fb === undefined && !tooShort && !failed ? 'thinking' : 'idle'} size={130} />
        <div>
          <h1 className="page-title">Suhbat tahlili</h1>
          <p className="muted">Suhbatimizda sezganlarim</p>
        </div>
      </div>

      <div className="fb-counters">
        {counters.map((c) => (
          <div key={c.key} className="fb-counter">
            <b>{c.v}</b>
            <small>{c.l}</small>
            {c.c.record ? <span className="badge gold">Shaxsiy rekord!</span> : c.c.up ? <span className="badge">O'tgan safardan yaxshiroq</span> : null}
          </div>
        ))}
      </div>

      {tooShort ? (
        <div className="fb-card">
          <h3>Keyingi safar ko'proq gapiring!</h3>
          <p className="muted">Suhbat tahlil qilish uchun juda qisqa bo'ldi. Keyingi safar kamida bir nechta gap ayting.</p>
        </div>
      ) : failed ? (
        <div className="fb-card">
          <h3>Tahlil yaratib bo'lmadi</h3>
          <button type="button" className="btn btn-primary" onClick={() => setAttempt((a) => a + 1)}>
            Qayta urinish
          </button>
        </div>
      ) : !fb ? (
        <div className="fb-card loading">
          <span className="dots">
            <i />
            <i />
            <i />
          </span>{' '}
          Tahlil tayyorlanmoqda…
        </div>
      ) : (
        <>
          {fb.summary && <p className="fb-summary">{fb.summary}</p>}
          {fb.strengths.length > 0 && (
            <div className="fb-card good">
              <h3>✅ Yaxshi chiqdi</h3>
              <ul>
                {fb.strengths.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {fb.growth.length > 0 && (
            <div className="fb-card grow">
              <h3>📈 Rivojlantirish kerak</h3>
              <ul>
                {fb.growth.map((g) => (
                  <li key={g.text}>
                    {g.text}
                    {g.example && (
                      <div className="fb-fix">
                        <s>{g.example}</s>
                        {g.better && (
                          <button type="button" className="fr-chip" onClick={() => speak(g.better, state.settings.ttsRate)}>
                            {g.better} <span className="fr-chip-icon">🔊</span>
                          </button>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {fb.words.length > 0 && (
            <div className="fb-card">
              <h3>📝 Suhbatingizdagi so'zlar</h3>
              <div className="fb-words">
                {fb.words.map((w) => (
                  <div key={w.fr} className="fb-word">
                    <button type="button" className="fb-word-fr" onClick={() => speak(w.fr, state.settings.ttsRate)}>
                      🔊 {w.fr}
                    </button>
                    <span className="muted">{w.uz}</span>
                    <button type="button" className={`btn btn-ghost small-btn ${added.has(w.fr.toLowerCase()) ? 'done' : ''}`} disabled={added.has(w.fr.toLowerCase())} onClick={() => addWord(w)}>
                      {added.has(w.fr.toLowerCase()) ? "Qo'shildi ✓" : "Lug'atga qo'shish"}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <button type="button" className="exam-nudge" onClick={onExam}>
        🎓 Aniq bahoni bilmoqchimisiz? DELF A1 og'zaki mashqini sinab ko'ring →
      </button>
      <div className="fb-actions">
        <button type="button" className="btn btn-primary btn-lg" onClick={onAgain}>
          Yana gaplashish
        </button>
        <button type="button" className="btn btn-text" onClick={onBack}>
          Krua sahifasiga qaytish
        </button>
      </div>
    </div>
  );
}
