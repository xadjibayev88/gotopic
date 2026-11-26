// Avatar: emoji yoki rasm (galereyadan yuklangan yoki Google profil rasmi).
import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';

export const isImageAvatar = (v?: string | null) => !!v && /^(data:image\/|https:\/\/)/.test(v);

export function Avatar({ value, size = 40, className = '' }: { value?: string | null; size?: number; className?: string }) {
  const v = value || '🐱';
  if (isImageAvatar(v)) return <img className={`avatar-img ${className}`} src={v} alt="" width={size} height={size} referrerPolicy="no-referrer" />;
  return (
    <span className={`avatar-emoji ${className}`} style={{ fontSize: Math.round(size * 0.72) }}>
      {v}
    </span>
  );
}

const PRESETS = ['🐱', '😺', '😸', '😻', '😼', '🙀', '🦊', '🐼', '🐨', '🐯', '🦁', '🐰', '🐻', '🐸', '🦄', '🐧', '🐵', '🐶', '🦉', '🐙', '👩‍🎓', '👨‍🎓', '🧑‍🎨', '🧑‍💻', '👸', '🤴', '🥷', '🧙', '🥐', '🗼', '🇫🇷', '🇺🇿'];

/** Rasmni kvadrat qilib qirqib, 192×192 JPEG ga kichraytiradi (~15 KB) — sinxronlash uchun yengil. */
async function toAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((ok, fail) => {
      const i = new Image();
      i.onload = () => ok(i);
      i.onerror = () => fail(new Error('img'));
      i.src = url;
    });
    const side = Math.min(img.naturalWidth, img.naturalHeight);
    const c = document.createElement('canvas');
    c.width = c.height = 192;
    c.getContext('2d')!.drawImage(img, (img.naturalWidth - side) / 2, (img.naturalHeight - side) / 2, side, side, 0, 0, 192, 192);
    return c.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export function AvatarPicker({ value, googlePhoto, onPick, onClose }: { value?: string; googlePhoto?: string | null; onPick: (v: string) => void; onClose: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState<string | null>(null);
  const pick = (v: string) => {
    onPick(v);
    onClose();
  };
  // Portal: oyna sahifadagi shisha kartochkalar ostida qolib ketmasligi uchun body ga chiqariladi.
  return createPortal(
    <div className="modal-back" onClick={onClose}>
      <div className="sheet avatar-sheet" onClick={(e) => e.stopPropagation()}>
        <h3>Avatarni tanlang</h3>
        <div className="avatar-actions">
          <button type="button" className="btn btn-primary" onClick={() => fileRef.current?.click()}>
            📷 Galereyadan rasm
          </button>
          {googlePhoto && (
            <button type="button" className="btn btn-ghost" onClick={() => pick(googlePhoto)}>
              <Avatar value={googlePhoto} size={22} /> Google rasmi
            </button>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = '';
            if (!f) return;
            if (f.size > 15 * 1024 * 1024) return setErr('Rasm juda katta (15 MB dan kichik bo\'lsin)');
            try {
              pick(await toAvatar(f));
            } catch {
              setErr("Rasmni ochib bo'lmadi — boshqa rasm tanlang");
            }
          }}
        />
        {err && <p className="auth-error">{err}</p>}
        <div className="avatar-grid">
          {PRESETS.map((p) => (
            <button key={p} type="button" className={`avatar-opt ${p === value ? 'on' : ''}`} onClick={() => pick(p)} aria-label={`Avatar ${p}`}>
              {p}
            </button>
          ))}
        </div>
        <button type="button" className="btn btn-text" onClick={onClose}>
          Bekor qilish
        </button>
      </div>
    </div>,
    document.body,
  );
}
