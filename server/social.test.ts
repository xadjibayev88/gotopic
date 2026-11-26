import { beforeEach, describe, expect, it } from 'vitest';
process.env.SALUT_DB = ':memory:';
process.env.SESSION_SECRET = 'x'.repeat(40);
import { db, resetDbForTests } from './db.ts';
import { register } from './accounts.ts';
import { decideReview, publicReviews, recentPurchases, shortName, stats, submitReview } from './social.ts';

beforeEach(() => resetDbForTests());

describe('social proof (real data only)', () => {
  it('shows only approved reviews, short names, and marks paying users as verified', () => {
    const a = register('a@x.uz', 'parol12345', 'Islomjon Xojibayev');
    const b = register('b@x.uz', 'parol12345', 'Shahnoza');
    if (!a.ok || !b.ok) throw new Error('reg');
    const ra = submitReview(a.user.id, 5, 'Vivi bilan har kuni gaplashaman, zo\'r!');
    const rb = submitReview(b.user.id, 4, 'Juda foydali ilova ekan, rahmat.');
    if (!ra.ok || !rb.ok) throw new Error('submit');
    expect(publicReviews().count).toBe(0); // tasdiqlanmaguncha ko'rinmaydi
    db().prepare("INSERT INTO orders (user_id, plan, provider, amount_uzs, status, created_at, paid_at) VALUES (?, 'month', 'card', 49000, 'paid', ?, ?)").run(a.user.id, Date.now(), Date.now());
    decideReview(ra.id, true);
    decideReview(rb.id, false);
    const p = publicReviews();
    expect(p.count).toBe(1);
    expect(p.avg).toBe(5);
    expect(p.reviews[0].name).toBe('Islomjon X.');
    expect(p.reviews[0].verified).toBe(true);
    expect(recentPurchases()[0]).toMatchObject({ name: 'Islomjon X.', plan: '1 oy' });
    expect(stats().users).toBe(2);
  });

  it('rejects bad ratings, too short text and links', () => {
    const a = register('c@x.uz', 'parol12345', 'C');
    if (!a.ok) throw new Error('reg');
    expect(submitReview(a.user.id, 7, 'Juda yaxshi ilova').ok).toBe(false);
    expect(submitReview(a.user.id, 5, 'qisqa').ok).toBe(false);
    expect(submitReview(a.user.id, 5, 'Zo\'r, mening kanalim t.me/spam ga keling').ok).toBe(false);
    expect(shortName('')).toBe('Foydalanuvchi');
  });
});
