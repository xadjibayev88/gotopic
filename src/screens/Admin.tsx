// Admin: karta orqali to'lov cheklarini ko'rib, tasdiqlash yoki rad etish (faqat ADMIN_EMAILS).
import { useCallback, useEffect, useState } from 'react';
import { accountApi, useAccount } from '../state/account';

type Order = { id: number; plan: string; amountUzs: number; status: string; createdAt: number; email: string | null; name: string };
const fmt = (n: number) => n.toLocaleString('ru-RU').replace(/[, ]/g, ' ');

export function Admin() {
  const { me } = useAccount();
  const [status, setStatus] = useState<'review' | 'paid' | 'rejected'>('review');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [busy, setBusy] = useState<number | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const load = useCallback(async () => {
    const r = await accountApi<{ orders?: Order[]; message?: string }>(`admin/orders?status=${status}`);
    if (!r.ok) return setErr(r.body.message ?? 'Yuklab bo\'lmadi');
    setErr(null);
    setOrders(r.body.orders ?? []);
  }, [status]);
  useEffect(() => {
    void load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  if (!me.admin) return <div className="page"><p className="muted">Bu sahifa faqat admin uchun.</p></div>;

  const decide = async (id: number, action: 'approve' | 'reject') => {
    setBusy(id);
    const r = await accountApi<{ message?: string }>('admin/order', { method: 'POST', body: JSON.stringify({ id, action }) });
    setBusy(null);
    if (!r.ok) setErr(r.body.message ?? 'Xato');
    void load();
  };

  return (
    <div className="page admin">
      <h1 className="page-title">🧾 To'lov cheklari</h1>
      <div className="seg">
        {(['review', 'paid', 'rejected'] as const).map((s) => (
          <button key={s} type="button" className={status === s ? 'on' : ''} onClick={() => setStatus(s)}>
            {s === 'review' ? 'Kutilmoqda' : s === 'paid' ? 'Tasdiqlangan' : 'Rad etilgan'}
          </button>
        ))}
      </div>
      {err && <p className="auth-error">{err}</p>}
      {orders && orders.length === 0 && <p className="muted">Hozircha yo'q.</p>}
      <div className="admin-list">
        {orders?.map((o) => (
          <div key={o.id} className="admin-order">
            <a href={`./api/admin/receipt?id=${o.id}`} target="_blank" rel="noreferrer" className="admin-receipt">
              <img src={`./api/admin/receipt?id=${o.id}`} alt={`Chek #${o.id}`} onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')} />
              <span>📎 Chekni ochish</span>
            </a>
            <div className="admin-info">
              <b>
                #{o.id} · {o.plan} · {fmt(o.amountUzs)} so'm
              </b>
              <small>
                {o.name || '—'} · {o.email ?? '—'}
              </small>
              <small className="muted">{new Date(o.createdAt).toLocaleString('uz-UZ')}</small>
              {o.status === 'review' && (
                <div className="admin-actions">
                  <button type="button" className="btn btn-primary" disabled={busy === o.id} onClick={() => decide(o.id, 'approve')}>
                    ✓ Tasdiqlash
                  </button>
                  <button type="button" className="btn btn-text danger" disabled={busy === o.id} onClick={() => decide(o.id, 'reject')}>
                    Rad etish
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <AdminReviews />
    </div>
  );
}

type PendingReview = { id: number; rating: number; text: string; createdAt: number; name: string; email: string | null };
/** Izohlar moderatsiyasi: tasdiqlanmaguncha saytda ko'rinmaydi. */
function AdminReviews() {
  const [list, setList] = useState<PendingReview[] | null>(null);
  const load = useCallback(async () => {
    const r = await accountApi<{ reviews?: PendingReview[] }>('admin/reviews');
    if (r.ok) setList(r.body.reviews ?? []);
  }, []);
  useEffect(() => {
    void load();
  }, [load]);
  const decide = async (id: number, action: 'approve' | 'reject') => {
    await accountApi('admin/review', { method: 'POST', body: JSON.stringify({ id, action }) });
    void load();
  };
  return (
    <section className="admin-reviews">
      <h2 className="section-title">💬 Yangi izohlar</h2>
      {list && list.length === 0 && <p className="muted">Tekshiriladigan izoh yo'q.</p>}
      {list?.map((r) => (
        <div key={r.id} className="admin-order">
          <div className="admin-info">
            <b>
              {'⭐'.repeat(r.rating)} · {r.name || '—'} · {r.email ?? '—'}
            </b>
            <p>«{r.text}»</p>
            <div className="admin-actions">
              <button type="button" className="btn btn-primary" onClick={() => decide(r.id, 'approve')}>
                ✓ Saytga chiqarish
              </button>
              <button type="button" className="btn btn-text danger" onClick={() => decide(r.id, 'reject')}>
                Rad etish
              </button>
            </div>
          </div>
        </div>
      ))}
    </section>
  );
}
