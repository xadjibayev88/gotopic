// «OTP Verification V7» uslubidagi PIN ekrani:
//  4 ta katak (faol katak qizil nur bilan) → to'g'ri kod kiritilsa kataklar 2×2 to'rga ko'chadi →
//  ular orasida chiziqlar chiziladi → kataklar markazga yig'ilib, yashil zarrachalar portlaydi →
//  «Muvaffaqiyatli» belgisi. Xato kodda kataklar qizarib silkinadi.
import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { createPortal } from 'react-dom';
import { motionAllowed } from '../engine/motion';
import { PIN_LENGTH } from '../engine/applock';
import { Mascot } from './Mascot';

type Stage = 'input' | 'checking' | 'grid' | 'link' | 'collapse' | 'burst' | 'error';

export function PinPad({
  title,
  subtitle,
  successTitle = 'Muvaffaqiyatli tasdiqlandi',
  successNote = 'Himoyalangan',
  onSubmit,
  onSuccess,
  footer,
  resetKey,
  instant = false,
  onResult,
}: {
  title: string;
  subtitle: string;
  successTitle?: string;
  successNote?: string;
  /** true — to'g'ri (animatsiya va onSuccess); string — xato matni. */
  onSubmit: (pin: string) => Promise<true | string>;
  onSuccess: () => void;
  footer?: React.ReactNode;
  /** O'zgarsa — kiritish tozalanadi (masalan «takrorlang» bosqichiga o'tganda). */
  resetKey?: string | number;
  /** Oraliq qadam (masalan, yangi PIN birinchi marta): muvaffaqiyat animatsiyasisiz darhol onSuccess. */
  instant?: boolean;
  /** Natija ma'lum bo'lganda (maskot kayfiyati uchun). */
  onResult?: (ok: boolean) => void;
}) {
  const [pin, setPin] = useState('');
  const [stage, setStage] = useState<Stage>('input');
  const [message, setMessage] = useState('');
  const input = useRef<HTMLInputElement>(null);
  const timers = useRef<number[]>([]);
  const at = (ms: number, fn: () => void) => timers.current.push(window.setTimeout(fn, ms));
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  useEffect(() => {
    setPin('');
    setStage('input');
    setMessage('');
    input.current?.focus();
  }, [resetKey]);

  const particles = useMemo(
    () => Array.from({ length: 26 }, (_, i) => {
      const a = (i / 26) * Math.PI * 2 + Math.random() * 0.4;
      const d = 70 + Math.random() * 90;
      return { x: Math.cos(a) * d, y: Math.sin(a) * d, s: 4 + Math.random() * 7, delay: Math.random() * 120, round: i % 3 === 0 };
    }),
    [],
  );

  const submit = async (value: string) => {
    setStage('checking');
    const res = await onSubmit(value);
    onResult?.(res === true);
    if (res !== true) {
      setMessage(res);
      setStage('error');
      if (navigator.vibrate) navigator.vibrate([20, 40, 20]);
      at(520, () => {
        setPin('');
        setStage('input');
        input.current?.focus();
      });
      return;
    }
    if (navigator.vibrate) navigator.vibrate(12);
    if (instant) {
      onSuccess();
      return;
    }
    if (!motionAllowed()) {
      setStage('burst');
      at(500, onSuccess);
      return;
    }
    setStage('grid');
    at(480, () => setStage('link'));
    at(1020, () => setStage('collapse'));
    at(1320, () => setStage('burst'));
    at(2500, onSuccess);
  };

  // Raqam qo'shish/o'chirish — ekrandagi klaviatura va jismoniy klaviatura uchun umumiy.
  const type = (next: string) => {
    if (stage !== 'input' && stage !== 'error') return;
    const v = next.replace(/\D/g, '').slice(0, PIN_LENGTH);
    setPin(v);
    if (stage === 'error') setStage('input');
    if (v.length > 0) setMessage(''); // eski xato matni yangi urinishda qolmasin
    if (v.length === PIN_LENGTH) void submit(v);
  };
  const press = (k: string) => {
    if (navigator.vibrate) navigator.vibrate(6);
    if (k === 'del') type(pin.slice(0, -1));
    else type(pin + k);
  };

  const done = stage === 'burst';
  const busy = stage !== 'input' && stage !== 'error';
  return (
    <div className={`pin-card pin-st-${stage}`} onClick={() => !busy && input.current?.focus()}>
      <span className="pin-grabber" aria-hidden="true" />
      <h2 className="pin-title">{done ? successTitle : title}</h2>
      <p className="pin-sub">{done ? 'Xush kelibsiz! Ilova ochilmoqda…' : message || subtitle}</p>

      <div className="pin-stage">
        <input
          ref={input}
          className="pin-input"
          value={pin}
          inputMode="none"
          autoComplete="one-time-code"
          pattern="\d*"
          maxLength={PIN_LENGTH}
          aria-label="PIN kod"
          autoFocus
          disabled={busy}
          onChange={(e) => type(e.target.value)}
        />
        <svg className="pin-links" viewBox="-70 -70 140 140" aria-hidden="true">
          <path d="M-40 -40 H40" />
          <path d="M40 -40 V40" />
          <path d="M40 40 H-40" />
          <path d="M-40 40 V-40" />
        </svg>
        {Array.from({ length: PIN_LENGTH }, (_, i) => {
          const active = stage === 'input' && i === Math.min(pin.length, PIN_LENGTH - 1) && pin.length < PIN_LENGTH;
          // To'r tartibi: 0 1 / 3 2 — chiziqlar kvadrat bo'ylab aylanib chiziladi.
          const gx = i === 0 || i === 3 ? -40 : 40;
          const gy = i < 2 ? -40 : 40;
          return (
            <span
              key={i}
              className={`pin-box ${pin[i] ? 'filled' : ''} ${active ? 'active' : ''}`}
              style={{ '--rx': `${(i - (PIN_LENGTH - 1) / 2) * 58}px`, '--gx': `${gx}px`, '--gy': `${gy}px`, '--i': i } as CSSProperties}
            >
              {/* PIN hech qachon ochiq ko'rsatilmaydi (yonidagilar ko'rmasin) — faqat nuqta. */}
              {pin[i] ? <b>•</b> : active ? <i className="pin-caret" /> : null}
            </span>
          );
        })}
        <span className="pin-core" aria-hidden="true" />
        <span className="pin-sparks" aria-hidden="true">
          {particles.map((p, i) => (
            <i
              key={i}
              className={p.round ? 'round' : ''}
              style={{ '--x': `${p.x}px`, '--y': `${p.y}px`, '--s': `${p.s}px`, '--d': `${p.delay}ms` } as CSSProperties}
            />
          ))}
        </span>
        <span className="pin-check" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 12.5l4.5 4.5L19 7.5" />
          </svg>
        </span>
      </div>

      {!done && <Keypad disabled={busy} canDelete={pin.length > 0} onPress={press} />}

      {done ? (
        <p className="pin-secure">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="10.5" width="14" height="10" rx="2.5" /><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" /></svg>
          {successNote}
        </p>
      ) : (
        <div className="pin-foot">{footer}</div>
      )}
    </div>
  );
}

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'] as const;

/** Ekrandagi raqamli klaviatura: telefon klaviaturasi ochilishini kutmasdan bir bosishda kiritiladi. */
function Keypad({ onPress, disabled, canDelete }: { onPress: (k: string) => void; disabled: boolean; canDelete: boolean }) {
  const [hit, setHit] = useState<{ k: string; n: number } | null>(null);
  return (
    <div className="pin-pad" role="group" aria-label="Raqamlar">
      {KEYS.map((k, i) =>
        k === '' ? (
          <span key={i} aria-hidden="true" />
        ) : (
          <button
            key={k}
            type="button"
            className={`pin-key ${k === 'del' ? 'del' : ''} ${hit?.k === k ? 'hit' : ''}`}
            disabled={disabled || (k === 'del' && !canDelete)}
            aria-label={k === 'del' ? "O'chirish" : k}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              e.preventDefault(); // fokus yashirin inputdan ketmasin
              setHit((h) => ({ k, n: (h?.n ?? 0) + 1 }));
              onPress(k);
            }}
            onClick={(e) => {
              if (e.detail === 0) onPress(k); // klaviatura (Enter/Space) bilan bosilganda
            }}
          >
            {hit?.k === k && <span key={hit.n} className="pin-ripple" aria-hidden="true" />}
            {k === 'del' ? (
              <svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 5H9l-6 7 6 7h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1z" />
                <path d="M17 9.5l-5 5M12 9.5l5 5" />
              </svg>
            ) : (
              <b>{k}</b>
            )}
          </button>
        ),
      )}
    </div>
  );
}

/** Ilova ochilganda PIN so'raydigan to'liq ekran. */
export function LockScreen({
  onUnlock,
  verify,
  onForgot,
}: {
  onUnlock: () => void;
  verify: (pin: string) => Promise<true | string>;
  onForgot: () => void;
}) {
  const [mood, setMood] = useState<'think' | 'sad' | 'cheer'>('think');
  const moodTimer = useRef(0);
  useEffect(() => () => clearTimeout(moodTimer.current), []);
  return (
    <div className="lock-screen" role="dialog" aria-modal="true" aria-label="Ilova qulfi">
      <span className="lock-aurora a1" aria-hidden="true" />
      <span className="lock-aurora a2" aria-hidden="true" />
      <div className={`lock-vivi m-${mood}`} aria-hidden="true">
        <Mascot mood={mood} size={92} />
        <span className="lock-badge">
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            {mood === 'cheer' ? <path d="M7 10.5V8a5 5 0 0 1 9.6-2" /> : <path d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5" />}
            <rect x="5" y="10.5" width="14" height="10" rx="2.5" fill="currentColor" stroke="none" />
          </svg>
        </span>
      </div>
      <PinPad
        title="PIN kodni kiriting"
        subtitle="Voilà! shaxsiy PIN bilan himoyalangan."
        onSubmit={verify}
        onSuccess={onUnlock}
        onResult={(ok) => {
          clearTimeout(moodTimer.current);
          setMood(ok ? 'cheer' : 'sad');
          if (!ok) moodTimer.current = window.setTimeout(() => setMood('think'), 1400);
        }}
        footer={
          <button type="button" className="pin-forgot" onClick={onForgot}>
            PINni unutdingizmi?
          </button>
        }
      />
    </div>
  );
}

type SetupStep = 'current' | 'new' | 'confirm';

/** PIN o'rnatish / o'zgartirish / o'chirish oynasi. */
export function PinSetupSheet({
  mode,
  onClose,
  verifyCurrent,
  save,
  remove,
}: {
  mode: 'set' | 'change' | 'off';
  onClose: (changed: boolean) => void;
  verifyCurrent: (pin: string) => Promise<true | string>;
  save: (pin: string) => Promise<void>;
  remove: () => void;
}) {
  const [step, setStep] = useState<SetupStep>(mode === 'set' ? 'new' : 'current');
  const [first, setFirst] = useState('');
  const [round, setRound] = useState(0);
  const go = (s: SetupStep) => {
    setStep(s);
    setRound((r) => r + 1);
  };

  const pad =
    step === 'current' ? (
      <PinPad
        key="current"
        title="Joriy PIN kod"
        subtitle={mode === 'off' ? "PINni o'chirish uchun joriy kodni kiriting." : 'Avval joriy PIN kodni kiriting.'}
        successTitle={mode === 'off' ? "PIN o'chirildi" : 'Tasdiqlandi'}
        successNote={mode === 'off' ? 'Ilova endi PIN so‘ramaydi' : 'Himoyalangan'}
        instant={mode !== 'off'}
        onSubmit={async (pin) => {
          const r = await verifyCurrent(pin);
          if (r === true && mode === 'off') remove();
          return r;
        }}
        onSuccess={() => (mode === 'off' ? onClose(true) : go('new'))}
      />
    ) : step === 'new' ? (
      <PinPad
        key={`new-${round}`}
        title="Yangi PIN o'ylab toping"
        subtitle="4 ta raqam. Uni faqat siz bilasiz — ilova ochilganda so'raladi."
        instant
        onSubmit={async (pin) => {
          if (/^(\d)\1{3}$/.test(pin) || pin === '1234' || pin === '4321') return "Juda oson PIN — boshqasini tanlang.";
          setFirst(pin);
          return true;
        }}
        onSuccess={() => go('confirm')}
      />
    ) : (
      <PinPad
        key={`confirm-${round}`}
        title="PINni takrorlang"
        subtitle="Tasdiqlash uchun shu PINni yana bir marta kiriting."
        successTitle="PIN o'rnatildi"
        successNote="Ilova endi PIN bilan himoyalangan"
        onSubmit={async (pin) => {
          if (pin !== first) {
            window.setTimeout(() => go('new'), 900);
            return "PINlar mos kelmadi — qaytadan boshlaymiz.";
          }
          await save(pin);
          return true;
        }}
        onSuccess={() => onClose(true)}
      />
    );

  // Portal: oyna profil sozlamalari ichida chizilsa, ota blokning backdrop-filter'i position:fixed'ni
  // o'sha blokka qamab, kartani qirqib qo'yardi. body'ga chizilganda har doim to'liq ekran.
  return createPortal(
    <div className="lock-screen sheet-mode" role="dialog" aria-modal="true" aria-label="PIN sozlamasi">
      {pad}
      <button type="button" className="pin-close" onClick={() => onClose(false)}>
        Bekor qilish
      </button>
    </div>,
    document.body,
  );
}
