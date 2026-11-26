// To'lov cheki yuklash zonasi — «javob beradigan» yuklash (drag feedback) uslubida:
//  idle      — bulut ikonkasi, «Chekni shu yerga tashlang yoki bosing»
//  over      — fayl ustida turganda: feruza shtrix chegara, ichki yorug'lik, ikonka ko'tariladi
//  preparing — fayl nomi + progress (rasm siqilmoqda)
//  ready     — feruza chegara, belgi, «… tayyor» + «Almashtirish»
//  uploading — haqiqiy yuklash foizi (XHR upload progress)
//  done      — «Chek yuborildi»
import { useRef, useState, type DragEvent } from 'react';

export type ReceiptStage = 'idle' | 'over' | 'preparing' | 'ready' | 'uploading' | 'done' | 'error';

const ACCEPT = /^(image\/(png|jpe?g|webp|heic|heif)|application\/pdf)$/i;
export const MAX_RECEIPT_BYTES = 10 * 1024 * 1024;

export function receiptProblem(f: File): string | null {
  if (!ACCEPT.test(f.type) && !/\.(png|jpe?g|webp|heic|heif|pdf)$/i.test(f.name)) return 'Faqat rasm (PNG, JPG) yoki PDF yuklang';
  if (f.size > MAX_RECEIPT_BYTES) return 'Fayl 10 MB dan katta';
  return null;
}

function sizeText(n: number): string {
  return n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function ReceiptDrop({
  stage,
  file,
  progress,
  error,
  onPick,
  onOver,
}: {
  stage: ReceiptStage;
  file: File | null;
  /** 0..1 — tayyorlash yoki yuklash foizi. */
  progress: number;
  error?: string | null;
  onPick: (f: File) => void;
  onOver: (over: boolean) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const depth = useRef(0);
  const [ripple, setRipple] = useState(0);
  const locked = stage === 'preparing' || stage === 'uploading' || stage === 'done';
  const pct = Math.round(Math.max(0, Math.min(1, progress)) * 100);

  const drop = (e: DragEvent) => {
    e.preventDefault();
    depth.current = 0;
    onOver(false);
    if (locked) return;
    const f = e.dataTransfer.files?.[0];
    if (f) {
      setRipple((n) => n + 1);
      onPick(f);
    }
  };

  return (
    <div
      className={`rdrop rd-${stage}`}
      role="button"
      tabIndex={locked ? -1 : 0}
      aria-label="To'lov chekini yuklash"
      aria-busy={stage === 'preparing' || stage === 'uploading'}
      onClick={() => !locked && input.current?.click()}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && !locked && input.current?.click()}
      onDragEnter={(e) => {
        e.preventDefault();
        if (locked) return;
        depth.current++;
        onOver(true);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={() => {
        depth.current = Math.max(0, depth.current - 1);
        if (depth.current === 0) onOver(false);
      }}
      onDrop={drop}
    >
      <span className="rd-glow" aria-hidden="true" />
      {ripple > 0 && <span key={ripple} className="rd-ripple" aria-hidden="true" />}

      {(stage === 'idle' || stage === 'over' || stage === 'error') && (
        <div className="rd-idle">
          <svg className="rd-cloud" viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M7 18.5a4.5 4.5 0 0 1-.7-8.95A6 6 0 0 1 17.8 8.6 4 4 0 0 1 17 18.5" />
            <path className="rd-arrow" d="M12 20v-7.5M9 15l3-3 3 3" />
          </svg>
          <b>{stage === 'over' ? 'Qo‘yib yuboring — chek qabul qilinadi' : 'Chekni shu yerga tashlang yoki bosing'}</b>
          <small>{stage === 'error' && error ? error : 'PNG, JPG yoki PDF · 10 MB gacha'}</small>
        </div>
      )}

      {(stage === 'preparing' || stage === 'uploading') && file && (
        <div className="rd-progress">
          <div className="rd-row">
            <span className="rd-file">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" /></svg>
              {file.name}
            </span>
            <span className="rd-pct">{pct}%</span>
          </div>
          <span className="rd-bar"><i style={{ width: `${pct}%` }} /></span>
          <small>{stage === 'preparing' ? 'Chek tayyorlanmoqda…' : 'Yuborilmoqda…'} · {sizeText(file.size)}</small>
        </div>
      )}

      {(stage === 'ready' || stage === 'done') && file && (
        <div className="rd-ok">
          <span className="rd-check" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
          </span>
          <b>{stage === 'done' ? 'Chek yuborildi' : `${file.name} tayyor`}</b>
          <small>{stage === 'done' ? 'Tekshiruvdan so‘ng Super yoqiladi' : `${sizeText(file.size)} · almashtirish uchun bosing`}</small>
        </div>
      )}
      {(stage === 'ready' || stage === 'done') && <span className="rd-badge" aria-hidden="true">{stage === 'done' ? 'YUBORILDI' : 'TAYYOR'}</span>}

      <input
        ref={input}
        type="file"
        accept="image/*,application/pdf"
        hidden
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (f) {
            setRipple((n) => n + 1);
            onPick(f);
          }
        }}
      />
    </div>
  );
}

/** Chekni yuborish — XHR orqali, chunki fetch yuklash foizini bermaydi. */
export function postWithProgress<T>(path: string, body: unknown, onProgress: (p: number) => void): Promise<{ ok: boolean; status: number; body: T }> {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `./api/${path}`);
    xhr.withCredentials = true;
    xhr.setRequestHeader('content-type', 'application/json');
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(e.loaded / e.total);
    xhr.onload = () => {
      let parsed = {} as T;
      try {
        parsed = JSON.parse(xhr.responseText) as T;
      } catch {
        /* bo'sh javob */
      }
      onProgress(1);
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, body: parsed });
    };
    xhr.onerror = () => resolve({ ok: false, status: 0, body: {} as T });
    xhr.send(JSON.stringify(body));
  });
}
