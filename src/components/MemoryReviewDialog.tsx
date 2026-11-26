export interface MemoryReviewTurn {
  role: 'user' | 'tutor';
  text: string;
}

interface MemoryReviewDialogProps {
  turns: MemoryReviewTurn[];
  busy?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MemoryReviewDialog({ turns, busy = false, onConfirm, onCancel }: MemoryReviewDialogProps) {
  return (
    <div className="modal-back memory-review-back" onClick={busy ? undefined : onCancel}>
      <section
        className="sheet memory-review"
        role="dialog"
        aria-modal="true"
        aria-labelledby="memory-review-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h3 id="memory-review-title">Vivi xotirasini yangilash</h3>
        <p className="muted small">
          Quyidagi suhbat qismlarini ko'rib chiqing. Tasdiqlasangiz, aynan shu matnlar xotira yangilash so'roviga yuboriladi va keyingi darslarda ishlatilishi mumkin.
        </p>
        <div className="memory-review-turns" aria-label="Xotirani yangilashga yuboriladigan suhbat qismlari">
          {turns.map((turn, index) => (
            <article className={`memory-review-turn memory-review-${turn.role}`} key={`${index}-${turn.role}`}>
              <b>{turn.role === 'user' ? 'Siz' : 'Vivi'}</b>
              <p>{turn.text}</p>
            </article>
          ))}
        </div>
        <button type="button" className="btn btn-primary btn-lg" disabled={busy || !turns.some((turn) => turn.role === 'user')} onClick={onConfirm}>
          {busy ? 'Yuborilmoqda…' : 'Tasdiqlash va xotirani yangilash'}
        </button>
        <button type="button" className="btn btn-text" disabled={busy} onClick={onCancel}>
          Hozircha yubormaslik
        </button>
      </section>
    </div>
  );
}
