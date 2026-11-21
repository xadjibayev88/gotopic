// Krua ovozli suhbati: tanishuv → xarakter va rol tanlash → qo'ng'iroq → tahlil.
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CHARACTERS, CUSTOM_ROLE_MAX, CUSTOM_ROLE_MIN, EXPLAIN_LANGS, ROLES } from '../../data/characters';
import { applyChatTurn } from '../../engine/game';
import { learnerContext } from '../../engine/tutor';
import type { CallOptions, VoiceCall, VoiceConfig } from '../../engine/voice/call';
import { loadHistory, loadPrefs, restUntil, savePrefs, setRestUntil, type SessionRecord, type VoicePrefs } from '../../engine/voice/prefs';
import { browserSttSupported, cloudSttSupported } from '../../engine/voice/stt';
import { TtsQueue, browserVoiceAvailable } from '../../engine/voice/tts';
import { useStore } from '../../state/store';
import { KruaLive } from '../../components/KruaLive';
import { VoiceCallScreen } from './VoiceCall';
import { FeedbackView } from './FeedbackView';

const FALLBACK_CONFIG: VoiceConfig = { ai: false, stt: false, tts: 'browser', audioTags: false, voices: [], sessionMinutes: 10, cooldownMinutes: 20 };

function useVoiceConfig(): VoiceConfig | null {
  const [cfg, setCfg] = useState<VoiceConfig | null>(null);
  useEffect(() => {
    let alive = true;
    fetch('./api/voice/config')
      .then((r) => (r.ok ? r.json() : FALLBACK_CONFIG))
      .catch(() => FALLBACK_CONFIG)
      .then((c: VoiceConfig) => alive && setCfg(c));
    return () => {
      alive = false;
    };
  }, []);
  return cfg;
}

const fmtLeft = (ms: number) => {
  const m = Math.ceil(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)} soat ${m % 60} daqiqa` : `${m} daqiqa`;
};

type View = { kind: 'hub' } | { kind: 'call'; key: number } | { kind: 'feedback'; record: SessionRecord };

export function VoiceHub() {
  const { state, update } = useStore();
  const config = useVoiceConfig();
  const [prefs, setPrefsState] = useState<VoicePrefs>(loadPrefs);
  const [view, setView] = useState<View>({ kind: 'hub' });
  const [history, setHistory] = useState<SessionRecord[]>(loadHistory);
  const [consentFor, setConsentFor] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [now, setNow] = useState(Date.now());
  const rest = restUntil();

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 15_000);
    return () => clearInterval(t);
  }, []);

  const setPrefs = (p: Partial<VoicePrefs>) =>
    setPrefsState((old) => {
      const n = { ...old, ...p };
      savePrefs(n);
      return n;
    });

  const role = ROLES.find((r) => r.id === prefs.role) ?? ROLES[0];
  const ch = CHARACTERS.find((c) => c.id === prefs.character) ?? CHARACTERS[0];
  const micLang = prefs.micLang !== 'auto' ? prefs.micLang : prefs.lang === 'uz' ? role.micLang : role.micLang === 'fr-FR' ? 'fr-FR' : EXPLAIN_LANGS.find((l) => l.id === prefs.lang)!.mic;
  const customOk = prefs.role !== 'custom' || prefs.customRole.trim().length >= CUSTOM_ROLE_MIN;
  const resting = rest > now;
  const canTalk = !!config?.ai && (browserSttSupported() || (config.stt && cloudSttSupported()));

  const options: CallOptions | null = useMemo(
    () =>
      config
        ? {
            character: prefs.character,
            role: prefs.role,
            customRole: prefs.customRole.trim(),
            lang: prefs.lang,
            voiceId: prefs.voiceId,
            inputMode: prefs.inputMode,
            stt: prefs.stt,
            micLang,
            rate: prefs.rate,
            name: state.name,
            context: () => learnerContext(state),
            config,
          }
        : null,
    [config, prefs, micLang, state],
  );

  const onUserTurn = useCallback(() => update((s) => applyChatTurn(s).state), [update]);

  const onEnded = useCallback(
    (c: VoiceCall) => {
      const rec = c.record();
      if (c.snap.endReason === 'limit' && config) setRestUntil(Date.now() + config.cooldownMinutes * 60_000);
      if (c.snap.error || rec.turns.filter((t) => t.role === 'user').length === 0) {
        setView({ kind: 'hub' });
        return;
      }
      setView({ kind: 'feedback', record: rec });
    },
    [config],
  );

  const sample = (text: string) => {
    if (!config) return;
    const q = new TtsQueue(config.tts);
    q.voiceId = prefs.voiceId || config.voices[0]?.id || '';
    q.explainLang = prefs.lang;
    q.unlock();
    q.push(text);
    q.end();
  };

  // ---------- Qo'ng'iroq / tahlil ----------
  if (view.kind === 'call' && options) {
    return (
      <VoiceCallScreen
        key={view.key}
        options={options}
        subtitles={prefs.subtitles}
        fullscreen={prefs.fullscreen}
        onToggleSubtitles={() => setPrefs({ subtitles: !prefs.subtitles })}
        onSwitchMode={() => {
          setPrefs({ inputMode: prefs.inputMode === 'ptt' ? 'handsfree' : 'ptt' });
          setView({ kind: 'call', key: Date.now() });
        }}
        onEnded={onEnded}
        onUserTurn={onUserTurn}
      />
    );
  }
  if (view.kind === 'feedback') {
    return (
      <FeedbackView
        record={view.record}
        lang={prefs.lang}
        onBack={() => {
          setHistory(loadHistory());
          setView({ kind: 'hub' });
        }}
        onAgain={() => {
          setHistory(loadHistory());
          setView(restUntil() > Date.now() ? { kind: 'hub' } : { kind: 'call', key: Date.now() });
        }}
        onExam={() => {
          setPrefs({ role: 'exam' });
          setHistory(loadHistory());
          setView({ kind: 'hub' });
        }}
      />
    );
  }

  // ---------- Tanishuv (birinchi marta) ----------
  if (!prefs.introSeen) {
    return (
      <div className="voice-intro">
        <div className="intro-hero">
          <h1>Yangi Krua bilan tanishing</h1>
          <KruaLive shape="pill" action="wave" actionKey={1} size={220} />
          <ul className="intro-beats">
            <li>🤝 Do'stona</li>
            <li>🧘 Sabrli</li>
            <li>🎯 Kerak bo'lsa — talabchan</li>
            <li>📣 Doim siz tomonda</li>
            <li>🎉 Yutuqlaringizni nishonlaydi</li>
            <li>😏 …va biroz sho'x</li>
          </ul>
        </div>
        <div className="intro-cta">
          <h2>Tayyor bo'lsangiz, boshlaymiz</h2>
          <p className="muted">Xarakterni tanlang va gaplashishni boshlang</p>
          <button type="button" className="btn btn-primary btn-lg" onClick={() => setPrefs({ introSeen: true })}>
            Davom etish
          </button>
        </div>
      </div>
    );
  }

  // ---------- Bosh sahifa ----------
  return (
    <div className="voice-hub">
      <div className="vh-head">
        <div>
          <h1 className="page-title">Krua AI</h1>
          <p className="muted">Jonli AI suhbatdoshingiz. Xarakterni tanlang va gaplashishni boshlang.</p>
        </div>
        <button type="button" className="icon-btn" aria-label="Qanday gaplashish kerak" onClick={() => setShowHelp(true)}>
          ❓
        </button>
      </div>

      <div className="char-carousel" role="list" aria-label="Xarakterni tanlang">
        {CHARACTERS.map((c) => (
          <div
            key={c.id}
            role="listitem"
            className={`char-card ${c.id === prefs.character ? 'on' : ''}`}
            style={{ ['--ch' as string]: c.color }}
            onClick={() => (c.consent && !prefs.strictConsent ? setConsentFor(c.id) : setPrefs({ character: c.id }))}
          >
            <div className="char-top">
              <span className="char-icon">{c.icon}</span>
              {c.id === prefs.character && <span className="char-check">✓</span>}
            </div>
            <b>{c.name}</b>
            <small className="char-tag">{c.tagline}</small>
            <p>{c.description}</p>
            <button
              type="button"
              className="char-sample"
              onClick={(e) => {
                e.stopPropagation();
                sample(c.sample);
              }}
            >
              ▶ «{c.sample}»
            </button>
          </div>
        ))}
      </div>

      <section className="vh-section">
        <h3>Rol — Krua kim bo'ladi</h3>
        <div className="role-grid">
          {ROLES.map((r) => (
            <button key={r.id} type="button" className={`role-chip ${r.id === prefs.role ? 'on' : ''}`} onClick={() => setPrefs({ role: r.id })}>
              <span>{r.icon}</span> {r.title}
            </button>
          ))}
        </div>
        {prefs.role === 'custom' && (
          <div className="custom-role">
            <textarea
              value={prefs.customRole}
              maxLength={CUSTOM_ROLE_MAX}
              placeholder="Masalan: sen Parijdagi taksi haydovchisisan, men turistman. Fransuzcha oddiy gapir, xatolarimni tuzat…"
              onChange={(e) => setPrefs({ customRole: e.target.value })}
            />
            <div className="custom-meta">
              <span className={customOk ? 'muted' : 'warn'}>
                {customOk ? "Matningiz faqat shu qurilmada saqlanadi." : `Kamida ${CUSTOM_ROLE_MIN} ta belgi kerak`}
              </span>
              <span className="muted">
                {prefs.customRole.length} / {CUSTOM_ROLE_MAX}
              </span>
            </div>
            {prefs.customRole && (
              <button type="button" className="btn btn-text" onClick={() => setPrefs({ customRole: '' })}>
                Tozalash
              </button>
            )}
          </div>
        )}
      </section>

      <section className="vh-section two">
        <label className="vh-field">
          <span>Tushuntirish tili</span>
          <select value={prefs.lang} onChange={(e) => setPrefs({ lang: e.target.value as VoicePrefs['lang'] })}>
            {EXPLAIN_LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
          <small className="muted">Krua shu tilda tushuntiradi, mashq — fransuzcha.</small>
        </label>
        {config && config.voices.length > 0 && (
          <label className="vh-field">
            <span>Ovoz</span>
            <select value={prefs.voiceId || config.voices[0].id} onChange={(e) => setPrefs({ voiceId: e.target.value })}>
              {config.voices.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </label>
        )}
        <div className="vh-field">
          <span>Muloqot usuli</span>
          <div className="seg">
            <button type="button" className={prefs.inputMode === 'ptt' ? 'on' : ''} onClick={() => setPrefs({ inputMode: 'ptt' })}>
              Bosib gapirish
            </button>
            <button type="button" className={prefs.inputMode === 'handsfree' ? 'on' : ''} onClick={() => setPrefs({ inputMode: 'handsfree' })}>
              Qo'lsiz rejim
            </button>
          </div>
          <small className="muted">{prefs.inputMode === 'ptt' ? 'Kruani (yoki Space) bosib turib gapirasiz.' : 'Hech narsani bosmasdan gapirasiz — Krua doimo tinglaydi.'}</small>
        </div>
      </section>

      <button type="button" className="vh-adv-toggle" onClick={() => setShowAdvanced(!showAdvanced)}>
        {showAdvanced ? '▾' : '▸'} Qo'shimcha sozlamalar
      </button>
      {showAdvanced && (
        <section className="vh-section two">
          <label className="vh-field">
            <span>Nutqni aniqlash</span>
            <select value={prefs.stt} onChange={(e) => setPrefs({ stt: e.target.value as VoicePrefs['stt'] })}>
              <option value="auto">Avtomatik</option>
              <option value="browser" disabled={!browserSttSupported()}>
                Brauzer (eng tez)
              </option>
              <option value="cloud" disabled={!config?.stt || !cloudSttSupported()}>
                AI (aralash tillar)
              </option>
            </select>
          </label>
          <label className="vh-field">
            <span>Men gapiradigan til</span>
            <select value={prefs.micLang} onChange={(e) => setPrefs({ micLang: e.target.value as VoicePrefs['micLang'] })}>
              <option value="auto">Rolga qarab</option>
              <option value="uz-UZ">O'zbekcha</option>
              <option value="fr-FR">Français</option>
              <option value="ru-RU">Русский</option>
              <option value="en-US">English</option>
            </select>
          </label>
          <label className="vh-field">
            <span>Gapirish tezligi</span>
            <input type="range" min={0.75} max={1.2} step={0.05} value={prefs.rate} onChange={(e) => setPrefs({ rate: Number(e.target.value) })} />
          </label>
          <label className="vh-check">
            <input type="checkbox" checked={prefs.subtitles} onChange={(e) => setPrefs({ subtitles: e.target.checked })} /> Subtitrlar
          </label>
          <label className="vh-check">
            <input type="checkbox" checked={prefs.fullscreen} onChange={(e) => setPrefs({ fullscreen: e.target.checked })} /> Suhbat paytida to'liq ekran
          </label>
        </section>
      )}

      {config && config.tts === 'browser' && !browserVoiceAvailable(prefs.lang) && (
        <p className="vh-note">ℹ️ Qurilmangizda {EXPLAIN_LANGS.find((l) => l.id === prefs.lang)!.label.toLowerCase()} ovoz topilmadi — Krua fransuzcha qismlarni o'qiydi, qolgani subtitrda chiqadi.</p>
      )}

      <div className="vh-start">
        {resting ? (
          <div className="rest-card">
            <KruaLive state="sleeping" shape="pill" size={110} />
            <div>
              <b>Krua dam olyapti</b>
              <p className="muted">Yaxshi suhbatlashdingiz! Keyingi suhbatdan oldin Kruaga dam kerak. Yana tayyor bo'lishiga {fmtLeft(rest - now)} qoldi.</p>
            </div>
          </div>
        ) : !config ? (
          <button type="button" className="btn btn-primary btn-lg" disabled>
            Ulanmoqda…
          </button>
        ) : !canTalk ? (
          <p className="vh-note warn">{!config.ai ? "Ovozli suhbat hozir mavjud emas — AI server sozlanmagan." : "Bu brauzerda ovozli suhbat ishlamaydi. Chrome yoki Edge'da oching yoki «Matn» bo'limidan foydalaning."}</p>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg start-call"
            style={{ ['--ch' as string]: ch.color }}
            disabled={!customOk}
            onClick={() => setView({ kind: 'call', key: Date.now() })}
          >
            🎙️ {ch.name} bilan gaplashish · {config.sessionMinutes} daqiqagacha
          </button>
        )}
        <p className="tutor-note">Krua — bu AI, u xato qilishi yoki kutilmagan tarzda javob berishi mumkin. Muhim qarorlarda unga tayanmang.</p>
      </div>

      <section className="vh-section">
        <h3>So'nggi suhbatlar</h3>
        {history.length === 0 ? (
          <p className="muted">Hozircha suhbatlar yo'q</p>
        ) : (
          <div className="recent-list">
            {history.slice(0, 6).map((h) => {
              const c = CHARACTERS.find((x) => x.id === h.character);
              const r = ROLES.find((x) => x.id === h.role);
              return (
                <button key={h.id} type="button" className="recent" onClick={() => setView({ kind: 'feedback', record: h })}>
                  <span className="recent-icon">{c?.icon}</span>
                  <span className="recent-text">
                    <b>
                      {r?.title} · {c?.name}
                    </b>
                    <small className="muted">
                      {new Date(h.at).toLocaleDateString()} · {h.stats.words} so'z · {Math.round(h.durationMs / 60000)} daq
                    </small>
                  </span>
                  <span className="recent-open">Tahlilni ochish ›</span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {consentFor && (
        <div className="modal-back" onClick={() => setConsentFor(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">🎩</div>
            <h3>Boshlashdan oldin bilib qo'ying</h3>
            <p className="muted">Professor Krua qattiqqo'l: bo'sh maqtov yo'q, javobni qayta-qayta talab qiladi. Bu haqorat emas — talabchan mashq. Agar sizga to'g'ri kelmasa, boshqa xarakterni tanlang.</p>
            <button
              type="button"
              className="btn btn-primary btn-lg"
              onClick={() => {
                setPrefs({ character: consentFor as VoicePrefs['character'], strictConsent: true });
                setConsentFor(null);
              }}
            >
              Tushundim, davom etish
            </button>
            <button type="button" className="btn btn-text" onClick={() => setConsentFor(null)}>
              Orqaga
            </button>
          </div>
        </div>
      )}

      {showHelp && (
        <div className="modal-back" onClick={() => setShowHelp(false)}>
          <div className="sheet help" onClick={(e) => e.stopPropagation()}>
            <h3>Qanday gaplashish kerak</h3>
            <ol>
              <li>«Gaplashish»ni bosing va mikrofonga ruxsat bering.</li>
              <li>
                <b>Kruani (yoki Space) bosib turing</b>, gapiring, so'ng qo'yib yuboring. Qo'lsiz rejimda shunchaki gapiring.
              </li>
              <li>Krua 1–2 soniyada javob bera boshlaydi. Gapini bo'lmoqchi bo'lsangiz — yana bosib turing (yoki gapiring): Krua jim bo'lib tinglaydi.</li>
              <li>Krua oxirgi 10 ta replika almashinuvini eslab qoladi. «Eshitmadim» desa — balandroq va mikrofonga yaqinroq gapiring.</li>
              <li>Suhbat {config?.sessionMinutes ?? 10} daqiqagacha davom etadi; oxirida tahlil va yangi so'zlar chiqadi.</li>
              <li>Fransuzcha iboralar ustiga bossangiz, qayta talaffuz qilinadi.</li>
            </ol>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowHelp(false)}>
              Tushunarli
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
