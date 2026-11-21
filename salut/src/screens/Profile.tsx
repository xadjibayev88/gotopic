import { useState } from 'react';
import { ACHIEVEMENTS, LEAGUES } from '../engine/game';
import { addDays, dayKey } from '../engine/time';
import { useStore } from '../state/store';
import { WeekStrip } from './Result';
import { AccountCard } from '../components/AccountCard';

export function Profile() {
  const { state, update, reset } = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [name, setName] = useState(state.name);
  const words = Object.keys(state.words).length;
  const MONTHS = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];
  const c = new Date(state.createdAt);
  const since = `${c.getFullYear()}-yil ${MONTHS[c.getMonth()]}`;

  // So'nggi 14 kun XP grafigi
  const today = dayKey();
  const days = Array.from({ length: 14 }, (_, i) => addDays(today, i - 13));
  const max = Math.max(state.dailyGoal, ...days.map((d) => state.xpByDay[d] ?? 0));

  return (
    <div className="page">
      <AccountCard />
      <div className="profile-head">
        <div className="avatar-big">🥐</div>
        <div>
          <input className="name-input" value={name} placeholder="Ismingiz" onChange={(e) => setName(e.target.value)} onBlur={() => update((s) => ({ ...s, name: name.trim() }))} />
          <p className="muted">{since} dan beri · 🇺🇿 → 🇫🇷</p>
        </div>
      </div>

      <h2 className="section-title">Statistika</h2>
      <div className="stats-grid">
        <div className="scard">
          <span>☀️</span>
          <b>{state.streak}</b>
          <small>Kunlik seriya</small>
        </div>
        <div className="scard">
          <span>⭐</span>
          <b>{state.xp}</b>
          <small>Jami ball</small>
        </div>
        <div className="scard">
          <span>{LEAGUES[state.league.tier].icon}</span>
          <b>{LEAGUES[state.league.tier].name}</b>
          <small>Turnir bosqichi</small>
        </div>
        <div className="scard">
          <span>📚</span>
          <b>{words}</b>
          <small>O'rganilgan so'z</small>
        </div>
        <div className="scard">
          <span>🏅</span>
          <b>{state.longestStreak}</b>
          <small>Eng uzun seriya</small>
        </div>
        <div className="scard">
          <span>💯</span>
          <b>{state.perfectLessons}</b>
          <small>Xatosiz dars</small>
        </div>
      </div>

      <h2 className="section-title">Shu hafta</h2>
      <WeekStrip />
      <div className="xp-chart" aria-label="So'nggi 14 kunlik ball">
        <div className="xp-bars">
          {days.map((d) => {
            const v = state.xpByDay[d] ?? 0;
            return (
              <div key={d} className="xp-col" title={`${d}: ${v} ball`}>
                <div className={`xp-bar ${v >= state.dailyGoal ? 'goal' : ''}`} style={{ height: `${(v / max) * 100}%` }} />
              </div>
            );
          })}
          <div className="xp-goal" style={{ bottom: `${(state.dailyGoal / max) * 100}%` }}>
            <span>maqsad {state.dailyGoal}</span>
          </div>
        </div>
        <div className="xp-labels">
          {days.map((d) => (
            <small key={d}>{Number(d.slice(8))}</small>
          ))}
        </div>
      </div>

      <h2 className="section-title">Yutuqlar</h2>
      <div className="ach-list">
        {ACHIEVEMENTS.map((a) => {
          const p = Math.min(a.goal, a.progress(state));
          const done = !!state.achievements[a.id];
          return (
            <div key={a.id} className={`ach ${done ? 'done' : ''}`}>
              <div className="ach-icon">{a.icon}</div>
              <div className="ach-body">
                <b>{a.title}</b>
                <small>{a.desc}</small>
                <div className="ach-bar">
                  <i style={{ width: `${(p / a.goal) * 100}%` }} />
                </div>
              </div>
              <span className="ach-count">
                {p}/{a.goal}
              </span>
            </div>
          );
        })}
      </div>

      <h2 className="section-title">Sozlamalar</h2>
      <div className="settings">
        <label className="setting">
          <span>⚡ Yengil rejim (sekin telefonlar uchun)</span>
          <input
            type="checkbox"
            defaultChecked={document.documentElement.classList.contains('lite')}
            onChange={(e) => {
              document.documentElement.classList.toggle('lite', e.target.checked);
              try {
                localStorage.setItem('salut.lite', e.target.checked ? '1' : '0');
              } catch {
                /* e'tiborsiz */
              }
            }}
          />
        </label>
        <label className="setting">
          <span>🔈 Ovoz effektlari</span>
          <input type="checkbox" checked={state.settings.sound} onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, sound: e.target.checked } }))} />
        </label>
        <label className="setting">
          <span>🎧 Tinglash mashqlari</span>
          <input type="checkbox" checked={state.settings.listening} onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, listening: e.target.checked } }))} />
        </label>
        <label className="setting">
          <span>🗣️ Talaffuz tezligi</span>
          <input
            type="range"
            min={0.5}
            max={1.2}
            step={0.05}
            value={state.settings.ttsRate}
            onChange={(e) => update((s) => ({ ...s, settings: { ...s.settings, ttsRate: Number(e.target.value) } }))}
          />
        </label>
        <div className="setting">
          <span>🎯 Kunlik maqsad</span>
          <div className="seg">
            {[10, 20, 30, 50].map((g) => (
              <button key={g} type="button" className={state.dailyGoal === g ? 'on' : ''} onClick={() => update((s) => ({ ...s, dailyGoal: g }))}>
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>
      <button type="button" className="btn btn-text danger" onClick={() => setConfirmReset(true)}>
        Progressni o'chirish
      </button>
      {confirmReset && (
        <div className="modal-back" onClick={() => setConfirmReset(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">⚠️</div>
            <h3>Hamma progress o'chiriladi</h3>
            <p className="muted">Ball, seriya, so'zlar va yutuqlar qaytarib bo'lmaydigan tarzda o'chadi.</p>
            <button type="button" className="btn btn-danger btn-lg" onClick={reset}>
              Ha, o'chirish
            </button>
            <button type="button" className="btn btn-text" onClick={() => setConfirmReset(false)}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
