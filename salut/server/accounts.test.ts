import { beforeEach, describe, expect, it } from 'vitest';
import { createHash, generateKeyPairSync, sign as cryptoSign } from 'node:crypto';
process.env.SALUT_DB = ':memory:';
process.env.SESSION_SECRET = 'x'.repeat(40);
import { resetDbForTests } from './db.ts';
import { createSessionToken, getProgress, login, putProgress, register, upsertGoogleUser, verifyGoogleIdToken, verifySessionToken } from './accounts.ts';
import { activePlan, click, createOrder, payme, paymeAuthorized } from './billing.ts';

beforeEach(() => {
  resetDbForTests();
  process.env.PAYME_MERCHANT_ID = 'm1';
  process.env.PAYME_KEY = 'secret-key';
  process.env.CLICK_SERVICE_ID = '11';
  process.env.CLICK_MERCHANT_ID = '22';
  process.env.CLICK_SECRET_KEY = 'click-secret';
});

describe('accounts', () => {
  it('registers, rejects duplicates and logs in with the right password only', () => {
    const r = register('Ali@Example.com', 'parol12345', 'Ali');
    expect(r.ok).toBe(true);
    expect(register('ali@example.com', 'boshqa12345', 'X')).toMatchObject({ ok: false, status: 409 });
    expect(register('yomon', 'parol12345', '')).toMatchObject({ ok: false, status: 400 });
    expect(register('a@b.uz', 'qisqa', '')).toMatchObject({ ok: false, status: 400 });
    expect(login('ali@example.com', 'parol12345')).toMatchObject({ ok: true });
    expect(login('ali@example.com', "noto'g'ri")).toMatchObject({ ok: false, status: 401 });
    expect(login('yoq@example.com', 'parol12345')).toMatchObject({ ok: false, status: 401 });
  });

  it('signs and verifies session tokens; rejects tampering and expiry', () => {
    const t = createSessionToken('user-1');
    expect(verifySessionToken(t)).toBe('user-1');
    expect(verifySessionToken(t.replace(/.$/, (c) => (c === 'A' ? 'B' : 'A')))).toBeNull();
    expect(verifySessionToken(t, Date.now() + 61 * 86_400_000)).toBeNull();
    expect(verifySessionToken(undefined)).toBeNull();
  });

  it('links Google sign-in to an existing email account', () => {
    const r = register('ali@example.com', 'parol12345', 'Ali');
    if (!r.ok) throw new Error();
    const g = upsertGoogleUser('g-123', 'ali@example.com', 'Ali', 'https://x/p.png');
    expect(g.id).toBe(r.user.id);
    expect(g.provider).toBe('google');
    expect(upsertGoogleUser('g-123', 'ali@example.com', 'Ali', null).id).toBe(r.user.id);
  });

  it('verifies a Google ID token signature, issuer, audience and expiry', async () => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
    const jwk = publicKey.export({ format: 'jwk' }) as { n: string; e: string; kty: string };
    const keys = [{ kid: 'k1', kty: jwk.kty, n: jwk.n, e: jwk.e }];
    const make = (payload: Record<string, unknown>) => {
      const h = Buffer.from(JSON.stringify({ alg: 'RS256', kid: 'k1' })).toString('base64url');
      const p = Buffer.from(JSON.stringify(payload)).toString('base64url');
      const s = cryptoSign('RSA-SHA256', Buffer.from(`${h}.${p}`), privateKey).toString('base64url');
      return `${h}.${p}.${s}`;
    };
    const now = Math.floor(Date.now() / 1000);
    const good = { iss: 'https://accounts.google.com', aud: 'client-1', sub: '42', email: 'A@B.UZ', email_verified: true, given_name: 'Ali', exp: now + 600 };
    await expect(verifyGoogleIdToken(make(good), ['client-1'], { keys })).resolves.toMatchObject({ sub: '42', email: 'a@b.uz', name: 'Ali' });
    await expect(verifyGoogleIdToken(make({ ...good, aud: 'other' }), ['client-1'], { keys })).rejects.toThrow('bad aud');
    await expect(verifyGoogleIdToken(make({ ...good, iss: 'evil.com' }), ['client-1'], { keys })).rejects.toThrow('bad iss');
    await expect(verifyGoogleIdToken(make({ ...good, exp: now - 3600 }), ['client-1'], { keys })).rejects.toThrow('expired');
    const forged = make(good).replace(/\.[^.]+$/, '.' + Buffer.from('nope').toString('base64url'));
    await expect(verifyGoogleIdToken(forged, ['client-1'], { keys })).rejects.toThrow('bad signature');
  });

  it('syncs progress with last-write-wins', () => {
    const r = register('s@b.uz', 'parol12345', '');
    if (!r.ok) throw new Error();
    expect(putProgress(r.user.id, { xp: 10 }, 1000)).toMatchObject({ ok: true });
    expect(putProgress(r.user.id, { xp: 5 }, 500)).toMatchObject({ ok: false, status: 409 });
    expect(putProgress(r.user.id, { xp: 20 }, 2000)).toMatchObject({ ok: true });
    expect(getProgress(r.user.id)).toEqual({ state: { xp: 20 }, updatedAt: 2000 });
    expect(putProgress(r.user.id, [1, 2], 3000)).toMatchObject({ ok: false, status: 400 });
  });
});

describe('billing', () => {
  const user = () => {
    const r = register(`u${Math.random()}@b.uz`, 'parol12345', '');
    if (!r.ok) throw new Error();
    return r.user.id;
  };

  it('runs a full Payme transaction and grants Super', () => {
    const uid = user();
    const o = createOrder(uid, 'month', 'payme', 'https://salut.uz');
    if ('error' in o) throw new Error();
    expect(o.payUrl).toMatch(/^https:\/\/checkout\.paycom\.uz\//);
    expect(Buffer.from(o.payUrl.split('/').pop()!, 'base64').toString()).toContain(`ac.order_id=${o.id};a=${o.amountUzs * 100}`);
    expect(payme('CheckPerformTransaction', { amount: o.amountUzs * 100, account: { order_id: o.id } })).toEqual({ result: { allow: true } });
    expect(payme('CheckPerformTransaction', { amount: 1, account: { order_id: o.id } }).error).toMatchObject({ code: -31001 });
    const created = payme('CreateTransaction', { id: 'tx-1', time: Date.now(), amount: o.amountUzs * 100, account: { order_id: o.id } });
    expect(created.result).toMatchObject({ state: 1, transaction: String(o.id) });
    expect(payme('CreateTransaction', { id: 'tx-1', time: Date.now(), amount: o.amountUzs * 100, account: { order_id: o.id } }).result).toMatchObject({ state: 1 });
    expect(activePlan(uid).plan).toBe('free');
    expect(payme('PerformTransaction', { id: 'tx-1' }).result).toMatchObject({ state: 2 });
    expect(payme('PerformTransaction', { id: 'tx-1' }).result).toMatchObject({ state: 2 }); // idempotent
    expect(activePlan(uid).plan).toBe('month');
    expect(payme('CancelTransaction', { id: 'tx-1', reason: 5 }).error).toMatchObject({ code: -31007 });
    expect(payme('CheckTransaction', { id: 'tx-1' }).result).toMatchObject({ state: 2 });
    expect(payme('Nope', {}).error).toMatchObject({ code: -32601 });
  });

  it('checks Payme Basic auth', () => {
    expect(paymeAuthorized(`Basic ${Buffer.from('Paycom:secret-key').toString('base64')}`)).toBe(true);
    expect(paymeAuthorized(`Basic ${Buffer.from('Paycom:wrong').toString('base64')}`)).toBe(false);
    expect(paymeAuthorized(undefined)).toBe(false);
  });

  it('runs Click prepare/complete with signature checks', () => {
    const uid = user();
    const o = createOrder(uid, 'year', 'click', 'https://salut.uz');
    if ('error' in o) throw new Error();
    const md5 = (v: string) => createHash('md5').update(v).digest('hex');
    const base = { click_trans_id: '777', service_id: '11', merchant_trans_id: String(o.id), amount: String(o.amountUzs), sign_time: '2026-11-22 10:00:00', error: '0' };
    const prep = { ...base, action: '0', sign_string: md5(`777` + `11` + 'click-secret' + o.id + o.amountUzs + '0' + base.sign_time) };
    expect(click({ ...prep, sign_string: 'bad' }, 0)).toMatchObject({ error: -1 });
    expect(click(prep, 0)).toMatchObject({ error: 0, merchant_prepare_id: o.id });
    const comp = { ...base, action: '1', merchant_prepare_id: String(o.id), sign_string: md5(`777` + `11` + 'click-secret' + o.id + o.id + o.amountUzs + '1' + base.sign_time) };
    expect(click(comp, 1)).toMatchObject({ error: 0, merchant_confirm_id: o.id });
    expect(activePlan(uid).plan).toBe('year');
    expect(click(comp, 1)).toMatchObject({ error: -4 }); // allaqachon to'langan
  });

  it('refuses disabled providers', () => {
    delete process.env.CLICK_SECRET_KEY;
    expect(createOrder(user(), 'month', 'click', 'https://x')).toMatchObject({ status: 400 });
  });
});
