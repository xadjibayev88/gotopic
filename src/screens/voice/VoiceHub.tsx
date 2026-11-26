import { SuperBanner, SuperOfferModal } from '../../components/SuperOffer';
import { Ic } from '../../components/Icons';
import { RangeValue } from '../../components/Micro';
// Vivi ovozli suhbati: tanishuv → xarakter va rol tanlash → qo'ng'iroq → tahlil.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CHARACTERS, CUSTOM_ROLE_MAX, CUSTOM_ROLE_MIN, EXPLAIN_LANGS, ROLES } from '../../data/characters';
import { applyChatTurn } from '../../engine/game';
import { learnerContext, updateMemory } from '../../engine/tutor';
import type { CallOptions, VoiceCall, VoiceConfig } from '../../engine/voice/call';
import { loadHistory, loadPrefs, restUntil, savePrefs, setRestUntil, type SessionRecord, type VoicePrefs } from '../../engine/voice/prefs';
import { cloudSttSupported } from '../../engine/voice/stt';
import { TtsQueue, browserVoiceAvailable } from '../../engine/voice/tts';
import { useStore } from '../../state/store';
import { KruaLive } from '../../components/KruaLive';
import { RewardedButton } from '../../components/RewardedButton';
import { LiveCallScreen } from './LiveCall';
import { VoiceCallScreen } from './VoiceCall';
import { FeedbackView } from './FeedbackView';
import { MemoryReviewDialog, type MemoryReviewTurn } from '../../components/MemoryReviewDialog';

const FALLBACK_CONFIG: VoiceConfig = { ai: false, stt: false, tts: 'text', ttsTier: 'text', audioTags: false, voices: [], sessionMinutes: 10, cooldownMinutes: 20 };

function useVoiceConfig(refresh = 0): VoiceConfig | null {
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
  }, [refresh]);
  return cfg;
}

const fmtLeft = (ms: number) => {
  const m = Math.ceil(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)} soat ${m % 60} daqiqa` : `${m} daqiqa`;
};

type View = { kind: 'hub' } | { kind: 'call'; key: number } | { kind: 'live'; key: number } | { kind: 'feedback'; record: SessionRecord };

export function VoiceHub() {
  const { state, update } = useStore();
  const [cfgRefresh, setCfgRefresh] = useState(0);
  const config = useVoiceConfig(cfgRefresh);
  const [prefs, setPrefsState] = useState<VoicePrefs>(loadPrefs);
  const [view, setView] = useState<View>({ kind: 'hub' });
  const [history, setHistory] = useState<SessionRecord[]>(loadHistory);
  const [memoryReview, setMemoryReview] = useState<{ memory: string; turns: MemoryReviewTurn[]; name: string } | null>(null);
  const [memoryUpdating, setMemoryUpdating] = useState(false);
  const [consentFor, setConsentFor] = useState<string | null>(null);
  // Super taklifi: bepul foydalanuvchilarga kuniga bir marta kirganda, va bepul suhbat tugaganda.
  const [offer, setOffer] = useState<null | 'enter' | 'limit'>(null);
  const isFree = !!config && config.premium === false;
  useEffect(() => {
    if (!isFree) return;
    const key = 'voila.superOffer.day';
    const today = new Date().toISOString().slice(0, 10);
    try {
      if (localStorage.getItem(key) === today) return;
      localStorage.setItem(key, today);
    } catch {
      /* xotira yopiq */
    }
    const t = setTimeout(() => setOffer('enter'), 700);
    return () => clearTimeout(t);
  }, [isFree]);
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
  // Super (yoki admin) — dam olish kutilmaydi, hatto oldin bepul rejimda belgilangan bo'lsa ham.
  const liveMode = !!(prefs.live && config?.live);
  // Jonli rejimda dam olish taymeri emas, jonli daqiqalar qoldig'i hal qiladi.
  const resting = rest > now && !config?.premium && !liveMode;
  const liveOut = liveMode && !config?.premium && (config?.liveMinutes ?? 0) < 1;
  const canTalk = !!config?.ai && !!config.stt && cloudSttSupported();

  const options: CallOptions | null = useMemo(
    () =>
      config
        ? {
            character: prefs.character,
            role: prefs.role,
            customRole: prefs.customRole.trim(),
            explicit: prefs.explicit && prefs.adultConfirmed,
            lang: prefs.lang,
            voiceId: prefs.voiceId,
            inputMode: prefs.inputMode,
            stt: prefs.stt,
            micLang,
            autoMic: prefs.micLang === 'auto',
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
    (c: { snap: { endReason: VoiceCall['snap']['endReason']; error: unknown }; record: () => SessionRecord }) => {
      const rec = c.record();
      const talked = rec.turns.filter((t) => t.role === 'user').length > 0;
      const wasLive = rec.id.startsWith('live-');
      // Bepul: kunlik sessiya ishlatildi — qanday tugaganidan qat'i nazar (keyingisi ertaga). Super: faqat limitda.
      // Jonli rejimning o'z daqiqalari bor (server hisoblaydi) — u oddiy rejimni bloklamaydi.
      if (!wasLive && config && config.cooldownMinutes > 0 && (c.snap.endReason === 'limit' || (talked && !config.premium))) setRestUntil(Date.now() + config.cooldownMinutes * 60_000);
      if (wasLive) setCfgRefresh((n) => n + 1);
      if (config && !config.premium && (c.snap.endReason === 'limit' || talked)) setTimeout(() => setOffer('limit'), 900);
      // Xotiraga yuborishdan oldin foydalanuvchi aynan shu turnlarni ko'rib tasdiqlaydi.
      if (talked) setMemoryReview({ memory: state.memory ?? '', turns: rec.turns.map((t) => ({ role: t.role, text: t.text })).slice(-40), name: state.name });
      if (c.snap.error || rec.turns.filter((t) => t.role === 'user').length === 0) {
        setView({ kind: 'hub' });
        return;
      }
      setView({ kind: 'feedback', record: rec });
    },
    [config, state.memory, state.name],
  );

  async function confirmMemoryUpdate() {
    const review = memoryReview;
    if (!review || memoryUpdating) return;
    setMemoryUpdating(true);
    try {
      const memory = await updateMemory(review.memory, review.turns, review.name, true);
      if (memory) update((s) => ({ ...s, memory }));
    } finally {
      setMemoryReview(null);
      setMemoryUpdating(false);
    }
  }

  const [sampleSt, setSampleSt] = useState<'idle' | 'loading' | 'playing' | 'error'>('idle');
  const sampleQ = useRef<TtsQueue | null>(null);
  useEffect(() => () => sampleQ.current?.dispose(), []);
  const sample = (text: string) => {
    if (!config) return;
    if (sampleSt === 'loading' || sampleSt === 'playing') {
      sampleQ.current?.stop();
      setSampleSt('idle');
      return;
    }
    sampleQ.current?.dispose();
    // Ovoz sozlanmagan bo'lsa — brauzer ovozi bilan bo'lsa ham eshittiramiz.
    const q = new TtsQueue(config.tts === 'text' ? 'browser' : config.tts);
    sampleQ.current = q;
    q.voiceId = prefs.voiceId || config.voices[0]?.id || '';
    q.explainLang = prefs.lang;
    q.onSentence = () => setSampleSt('playing');
    q.onDrain = () => setSampleSt((s) => (s === 'error' ? s : 'idle'));
    q.onFail = () => {
      setSampleSt('error');
      window.setTimeout(() => setSampleSt('idle'), 2500);
    };
    q.unlock();
    setSampleSt('loading');
    q.push(text);
    q.end();
  };

  // ---------- Qo'ng'iroq / tahlil ----------
  if (view.kind === 'live' && options) {
    return (
      <LiveCallScreen
        key={view.key}
        options={{ character: options.character, role: options.role, customRole: options.customRole, explicit: !!options.explicit, lang: options.lang, inputMode: options.inputMode, context: options.context }}
        subtitles={prefs.subtitles}
        onEnded={onEnded}
      />
    );
  }
  if (view.kind === 'call' && options) {
    return (
      <VoiceCallScreen
        key={view.key}
        options={options}
        subtitles={prefs.subtitles}
        fullscreen={prefs.fullscreen}
        game={prefs.game}
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
      <>
      {offer && !memoryReview && <SuperOfferModal reason={offer} onClose={() => setOffer(null)} />}
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
      {memoryReview && (
        <MemoryReviewDialog
          turns={memoryReview.turns}
          busy={memoryUpdating}
          onConfirm={() => void confirmMemoryUpdate()}
          onCancel={() => setMemoryReview(null)}
        />
      )}
      </>
    );
  }

  // ---------- Tanishuv (birinchi marta) ----------
  if (!prefs.introSeen) {
    return (
      <div className="voice-intro">
        <div className="intro-hero">
          <h1>Yangi Vivi bilan tanishing</h1>
          <KruaLive cue={{ state: 'idle', face: 'happy', action: 'wave' }} size={220} />
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

  // ---------- Bosh sahifa (ixcham) ----------
  const voiceName = config?.voices.find((v) => v.id === prefs.voiceId)?.name ?? config?.voices[0]?.name;
  const langLabel = EXPLAIN_LANGS.find((l) => l.id === prefs.lang)?.label;
  const memLines = (state.memory ?? '').split('\n').map((l) => l.replace(/^-\s*/, '').trim()).filter(Boolean);
  const pickChar = (c: (typeof CHARACTERS)[number]) =>
    c.adult ? (prefs.adultConfirmed ? setPrefs({ character: c.id }) : setConsentFor(c.id)) : c.consent && !prefs.strictConsent ? setConsentFor(c.id) : setPrefs({ character: c.id });
  return (
    <div className="voice-hub vh2">
      {offer && !memoryReview && <SuperOfferModal reason={offer} onClose={() => setOffer(null)} />}

      <section className="vh2-hero" style={{ ['--ch' as string]: ch.color }}>
        <div className="vh2-top">
          <span className="vh2-badge">✦ Vivi AI</span>
          <button type="button" className="vh2-icon" aria-label="Qanday gaplashish kerak" onClick={() => setShowHelp(true)}>
            <Ic name="help" size={20} />
          </button>
          <button type="button" className="vh2-icon" aria-label="Sozlamalar" onClick={() => setShowAdvanced(true)}>
            <Ic name="gear" size={20} />
          </button>
        </div>
        <div className="vh2-stage">
          <span className="vh2-avatar">{ch.icon}</span>
          <div className="vh2-who">
            <b>{ch.name}</b>
            <small>{ch.tagline}</small>
            <button type="button" className="vh2-sample" onClick={() => sample(ch.sample)}>
              {sampleSt === 'loading' ? (
                <>
                  <span className="vh2-spin" /> Yuklanmoqda…
                </>
              ) : sampleSt === 'playing' ? (
                <>
                  <span className="vh2-eq"><i /><i /><i /></span> To'xtatish
                </>
              ) : sampleSt === 'error' ? (
                "Ovoz hozir mavjud emas"
              ) : (
                <>
                  <Ic name="play" size={13} /> Ovozini eshitish
                </>
              )}
            </button>
          </div>
        </div>
        <div className="vh2-chars" role="list" aria-label="Xarakterni tanlang">
          {CHARACTERS.map((c) => (
            <button key={c.id} type="button" role="listitem" className={`vh2-char ${c.id === prefs.character ? 'on' : ''}`} style={{ ['--ch' as string]: c.color }} onClick={() => pickChar(c)} aria-pressed={c.id === prefs.character}>
              <span>{c.icon}</span>
              <small>{c.name.replace(/ Vivi$/, '')}</small>
            </button>
          ))}
        </div>
        {config?.live && (
          <button type="button" className={`vh2-live ${prefs.live ? 'on' : ''}`} onClick={() => setPrefs({ live: !prefs.live })} aria-pressed={prefs.live}>
            <span className="vh2-live-ic"><Ic name="bolt" size={18} /></span>
            <span className="vh2-live-t">
              <b>Jonli rejim</b>
              <small>Gemini Live · emotsiyali ovoz</small>
            </span>
            <span className="sw" />
          </button>
        )}
      </section>

      <section className="vh2-card">
        <div className="vh2-row-h">
          <b>Mavzu</b>
          <button type="button" className="vh2-settings" onClick={() => setShowAdvanced(true)}>
            {langLabel}
            {voiceName ? ` · ${voiceName}` : ''} · {prefs.inputMode === 'ptt' ? 'Bosib gapirish' : "Qo'lsiz"} ›
          </button>
        </div>
        <div className="vh2-roles">
          {ROLES.map((r) => (
            <button key={r.id} type="button" className={`vh2-role ${r.id === prefs.role ? 'on' : ''}`} onClick={() => setPrefs({ role: r.id })}>
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

      {config && config.tts === 'browser' && !browserVoiceAvailable(prefs.lang) && (
        <p className="vh-note"><Ic name="info" size={16} /> Qurilmangizda {EXPLAIN_LANGS.find((l) => l.id === prefs.lang)!.label.toLowerCase()} ovoz topilmadi — Vivi fransuzcha qismlarni o'qiydi, qolgani subtitrda chiqadi.</p>
      )}

      {config && config.messagesLeft != null && (
        <p className="vh-quota">
          {`🎁 Bugun ${config.messagesLeft} / ${config.messagesPerDay} ta bepul xabar va ${config.sessionMinutes} daqiqalik ovozli suhbat.`}{' '}
          <a href="#/shop">Super — cheksiz va Dilzoda ovozi</a>
        </p>
      )}
      {isFree && <SuperBanner onOpen={() => setOffer('enter')} />}
      <div className="vh-start">
        {liveOut ? (
          <div className="rest-card">
            <KruaLive cue={{ state: 'idle', face: 'neutral' }} size={110} />
            <div>
              <b>Bugungi jonli suhbat tugadi</b>
              <p className="muted">Kuniga {10} daqiqa jonli suhbat bepul. Ertaga yana — yoki Super bilan cheklovsiz gaplashing.</p>
              <button type="button" className="btn btn-primary" onClick={() => setOffer('limit')}>
                ⭐ Hoziroq davom etish — Super
              </button>
              <RewardedButton
                kind="vivi"
                compact
                viviLeft={config?.rewardsLeft ?? 0}
                onGranted={() => {
                  setRestUntil(0);
                  setCfgRefresh((n) => n + 1);
                  setNow(Date.now());
                }}
              />
            </div>
          </div>
        ) : resting ? (
          <div className="rest-card">
            <KruaLive cue={{ state: 'idle', face: 'neutral' }} size={110} />
            <div>
              <b>Vivi dam olyapti</b>
              <p className="muted">Yaxshi suhbatlashdingiz! Keyingi suhbatdan oldin Viviga dam kerak. Yana tayyor bo'lishiga {fmtLeft(rest - now)} qoldi.</p>
              {isFree && (
                <button type="button" className="btn btn-primary" onClick={() => setOffer('limit')}>
                  ⭐ Hoziroq davom etish — Super
                </button>
              )}
              <RewardedButton
                kind="vivi"
                compact
                viviLeft={config?.rewardsLeft ?? 0}
                onGranted={() => {
                  setRestUntil(0);
                  setCfgRefresh((n) => n + 1);
                  setNow(Date.now());
                }}
              />
            </div>
          </div>
        ) : !config ? (
          <button type="button" className="btn btn-primary btn-lg" disabled>
            Ulanmoqda…
          </button>
        ) : !canTalk ? (
          <p className="vh-note warn">{!config.ai ? "Ovozli suhbat hozir mavjud emas — AI server sozlanmagan." : "Cloud nutqni aniqlash hozir mavjud emas yoki brauzer audio yozishni qo'llamaydi — «Matn» bo'limidan foydalaning."}</p>
        ) : (
          <button
            type="button"
            className="btn btn-primary btn-lg start-call"
            style={{ ['--ch' as string]: ch.color }}
            disabled={!customOk}
            onClick={() => setView({ kind: prefs.live && config.live ? 'live' : 'call', key: Date.now() })}
          >
            <Ic name={prefs.live && config.live ? 'bolt' : 'mic'} size={20} /> Gaplashishni boshlash
            <small className="start-sub">{`${prefs.live && config.live ? config.liveMinutes ?? config.sessionMinutes : config.sessionMinutes} daqiqagacha`}</small>
          </button>
        )}
      </div>

      <div className="vh2-mini">
        <details className="vh2-mem">
          <summary>
            <Ic name="brain" size={20} />
            <b>Vivi eslaydi</b>
            <small>{memLines.length ? `${memLines.length} ta narsa` : "hali bo'sh"}</small>
          </summary>
          {memLines.length ? (
            <>
              <ul className="memory-list">
                {memLines.slice(0, 8).map((l, i) => (
                  <li key={i}>{l}</li>
                ))}
              </ul>
              <button type="button" className="btn btn-text danger" onClick={() => update((s) => ({ ...s, memory: '' }))}>
                Unutish
              </button>
            </>
          ) : (
            <p className="muted small">Suhbatlashganingiz sari Vivi qiziqishlaringiz va maqsadingizni eslab qoladi.</p>
          )}
        </details>
        {history.length > 0 && (
          <details className="vh2-mem">
            <summary>
              <Ic name="history" size={20} />
              <b>So'nggi suhbatlar</b>
              <small>{history.length}</small>
            </summary>
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
                    <span className="recent-open">›</span>
                  </button>
                );
              })}
            </div>
          </details>
        )}
      </div>
      <p className="tutor-note vh-note-ai">Vivi — bu AI, u xato qilishi mumkin. Muhim qarorlarda unga tayanmang.</p>

      {showAdvanced && (
        <div className="modal-back" onClick={() => setShowAdvanced(false)}>
          <div className="sheet vh2-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="vh2-sheet-h">
              <h3>Sozlamalar</h3>
              <button type="button" className="icon-btn" onClick={() => setShowAdvanced(false)} aria-label="Yopish">
                ✕
              </button>
            </div>
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
                <small className="muted">Vivi shu tilda tushuntiradi, mashq — fransuzcha.</small>
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
                <small className="muted">{prefs.inputMode === 'ptt' ? 'Vivini (yoki Space) bosib turib gapirasiz.' : 'Hech narsani bosmasdan gapirasiz — Vivi doimo tinglaydi.'}</small>
              </div>
            </section>

            <h4 className="vh-sub">Qo'shimcha</h4>
            {(
              <section className="vh-section two">
                <label className="vh-field">
                  <span>Men gapiradigan til</span>
                  <select value={prefs.micLang} onChange={(e) => setPrefs({ micLang: e.target.value as VoicePrefs['micLang'] })}>
                    <option value="auto">Avtomatik (Vivi javobiga qarab)</option>
                    <option value="uz-UZ">O'zbekcha</option>
                    <option value="fr-FR">Français</option>
                    <option value="ru-RU">Русский</option>
                    <option value="en-US">English</option>
                  </select>
                </label>
                <label className="vh-field">
                  <span>Gapirish tezligi</span>
                  <RangeValue min={0.75} max={1.2} step={0.05} value={prefs.rate} ariaLabel="Gapirish tezligi" onChange={(v) => setPrefs({ rate: v })} />
                </label>
                <label className="vh-check">
                  <input type="checkbox" checked={prefs.subtitles} onChange={(e) => setPrefs({ subtitles: e.target.checked })} /> Subtitrlar
                </label>
                <label className="vh-check">
                  <input type="checkbox" checked={prefs.fullscreen} onChange={(e) => setPrefs({ fullscreen: e.target.checked })} /> Suhbat paytida to'liq ekran
                </label>
                <label className="vh-check explicit-check">
                  <input type="checkbox" checked={prefs.game} onChange={(e) => setPrefs({ game: e.target.checked })} /> 💥 Qasos rejimi <span className="badge-new">Yangi</span>
                  <small>Kechki ko'chada Vivi, qurollar g'ildiragi va sog'liq chizig'i. Aytgan hamma gaplari uchun o'ch oling (multfilm uslubida).</small>
                </label>
                <label className="vh-check explicit-check">
                  <input
                    type="checkbox"
                    checked={prefs.explicit && prefs.adultConfirmed}
                    onChange={(e) => (e.target.checked && !prefs.adultConfirmed ? setConsentFor('explicit') : setPrefs({ explicit: e.target.checked }))}
                  />{' '}
                  🔞 Senzurasiz rejim (18+)
                  <small>Har qanday xarakter keskinroq, filtrlanmagan iboralar bilan gapiradi. 18 yoshga to'lgan bo'lishingiz kerak.</small>
                </label>
              </section>
            )}

          </div>
        </div>
      )}

      {(consentFor === 'adult' || consentFor === 'explicit') && (
        <div className="modal-back" onClick={() => setConsentFor(null)}>
          <div className="sheet adult-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">🔞</div>
            <h3>{consentFor === 'explicit' ? 'Senzurasiz rejim — faqat 18 yoshdan kattalar uchun' : 'Bezori Vivi — faqat 18 yoshdan kattalar uchun'}</h3>
            <p className="muted">
              Bu xarakter so'kinadi, qo'pol hazil qiladi, sizni «qovuradi» va kattalar mavzularida (tanishuv, bar, ziyofat, ko'cha jargoni) gaplashadi.
              Haqoratli kamsitish va shahvoniy tasvirlar yo'q — lekin ohang qattiq. Istalgan vaqtda boshqa xarakterga o'tishingiz mumkin.
            </p>
            <button
              type="button"
              className="btn btn-danger btn-lg"
              onClick={() => {
                setPrefs(consentFor === 'explicit' ? { explicit: true, adultConfirmed: true } : { character: 'adult', adultConfirmed: true });
                setConsentFor(null);
              }}
            >
              Menga 18 yosh to'lgan — davom etish
            </button>
            <button type="button" className="btn btn-text" onClick={() => setConsentFor(null)}>
              Yo'q, orqaga
            </button>
          </div>
        </div>
      )}

      {consentFor && consentFor !== 'adult' && consentFor !== 'explicit' && (
        <div className="modal-back" onClick={() => setConsentFor(null)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">🎩</div>
            <h3>Boshlashdan oldin bilib qo'ying</h3>
            <p className="muted">Professor Vivi qattiqqo'l: bo'sh maqtov yo'q, javobni qayta-qayta talab qiladi. Bu haqorat emas — talabchan mashq. Agar sizga to'g'ri kelmasa, boshqa xarakterni tanlang.</p>
            <label className="vh-check explicit-check">
              <input type="checkbox" checked={prefs.explicit && prefs.adultConfirmed} onChange={(e) => setPrefs({ explicit: e.target.checked, adultConfirmed: e.target.checked || prefs.adultConfirmed })} /> 🔞 Senzurasiz rejim (18+)
              <small>Keskinroq, filtrlanmagan iboralarga ruxsat beradi. 18 yoshga to'lgan bo'lishingiz kerak.</small>
            </label>
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
                <b>Vivini (yoki Space) bosib turing</b>, gapiring, so'ng qo'yib yuboring. Qo'lsiz rejimda shunchaki gapiring.
              </li>
              <li>Vivi 1–2 soniyada javob bera boshlaydi. Gapini bo'lmoqchi bo'lsangiz — yana bosib turing (yoki gapiring): Vivi jim bo'lib tinglaydi.</li>
              <li>Vivi oxirgi 10 ta replika almashinuvini eslab qoladi. «Eshitmadim» desa — balandroq va mikrofonga yaqinroq gapiring.</li>
              <li>Suhbat {config?.sessionMinutes ?? 10} daqiqagacha davom etadi; oxirida tahlil va yangi so'zlar chiqadi.</li>
              <li>Fransuzcha iboralar ustiga bossangiz, qayta talaffuz qilinadi.</li>
              <li>Suhbatni ekranni yozib olish funksiyasi bilan videoga oling — «To'liq ekran» sozlamasi bunga qulay.</li>
            </ol>
            <h4>Vivining tanasi va yuzi</h4>
            <p className="muted small">
              Javob davomida Vivi o'zi shaklini o'zgartiradi: maqtaganda yulduz, yoqqanda yurak, xafa bo'lsa erib ketadi, yangi so'zda kitob yoki karta, jahli chiqqanda boshi alangalanadi. Gapida taniqli odam yoki joy tilga olinsa — uning rasmi chiqadi.
            </p>
            <h4>Ovoz teglari</h4>
            <p className="muted small">
              «O'z rolingiz» matniga kvadrat qavsdagi teglarni yozish mumkin, masalan: «har bir gapdan keyin <code>[burps]</code> qiladi, jahli chiqqanda <code>[whispers]</code>ga o'tadi».
              Teglar Vivining tanasini ham harakatlantiradi: <code>[laughs]</code> — sakraydi va qiqirlaydi, <code>[crying]</code> — cho'kadi, <code>[burps]</code> — pufak puflaydi,
              <code>[fart]</code> — yashil bulut chiqaradi, <code>[boundaries]</code> — qo'li bilan ko'rsatib qattiq qaraydi. Senzurasiz rejimda <code>[fuck]</code> — o'rta barmog'ini ko'rsatib alangalanadi (ovozda aytilmaydi).
            </p>
            <h4>Qasos rejimi</h4>
            <p className="muted small">Sozlamalarda yoqing: Vivini bosing yoki <kbd>F</kbd> — urish, <kbd>Q</kbd> — qurollar g'ildiragi, <kbd>1</kbd>–<kbd>6</kbd> — qurol tanlash, gapirish uchun 🎤 tugma yoki <kbd>Space</kbd>.</p>
            <button type="button" className="btn btn-primary btn-lg" onClick={() => setShowHelp(false)}>
              Tushunarli
            </button>
          </div>
        </div>
      )}
      {memoryReview && (
        <MemoryReviewDialog
          turns={memoryReview.turns}
          busy={memoryUpdating}
          onConfirm={() => void confirmMemoryUpdate()}
          onCancel={() => setMemoryReview(null)}
        />
      )}
    </div>
  );
}
