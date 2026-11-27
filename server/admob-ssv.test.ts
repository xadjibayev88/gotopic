import { describe, expect, it } from 'vitest';
import { generateKeyPairSync, sign } from 'node:crypto';
import { adsConfigScript, appAdsTxt, parseVerifierKeys, verifySsv } from './admob-ssv.ts';

const { privateKey, publicKey } = generateKeyPairSync('ec', { namedCurve: 'prime256v1' });
const pem = publicKey.export({ type: 'spki', format: 'pem' }).toString();
const keys = parseVerifierKeys({ keys: [{ keyId: 3335741209, pem, base64: '' }] });

function signed(msg: string, keyId = '3335741209') {
  const sig = sign('sha256', Buffer.from(msg), privateKey).toString('base64url');
  return `${msg}&signature=${sig}&key_id=${keyId}`;
}

describe('AdMob SSV', () => {
  const msg = 'ad_network=5450213213286189855&ad_unit=1234567890&custom_data=NONCE123&reward_amount=1&reward_item=Reward&timestamp=1507770365237823&transaction_id=18fa792de1bca816048293fc71035638';
  it('accepts a valid Google signature and returns custom_data', () => {
    const r = verifySsv(signed(msg), (id) => keys.get(id));
    expect(r).toMatchObject({ ok: true, customData: 'NONCE123', transactionId: '18fa792de1bca816048293fc71035638' });
  });
  it('rejects tampered payloads, unknown keys and unsigned requests', () => {
    expect(verifySsv(signed(msg).replace('NONCE123', 'NONCE999'), (id) => keys.get(id)).ok).toBe(false);
    expect(verifySsv(signed(msg, '42'), (id) => keys.get(id)).reason).toBe('unknown_key');
    expect(verifySsv(msg, (id) => keys.get(id)).reason).toBe('no_signature');
  });
});

describe('ads config from env', () => {
  it('returns null when nothing is set (static file is served)', () => {
    expect(adsConfigScript({}, 'SALUT_ADS')).toBeNull();
    expect(appAdsTxt({})).toBeNull();
  });
  it('keeps only valid ids', () => {
    const js = adsConfigScript({ ADMOB_REWARDED_ID: 'ca-app-pub-1234567890123456/1234567890', ADMOB_BANNER_ID: 'bad' }, 'SALUT_ADS')!;
    const cfg = JSON.parse(js.replace(/^window\.SALUT_ADS = /, '').replace(/;\s*$/, ''));
    expect(cfg.admobRewarded).toBe('ca-app-pub-1234567890123456/1234567890');
    expect(cfg.admobBanner).toBe('');
    expect(appAdsTxt({ ADMOB_PUBLISHER_ID: 'ca-app-pub-1234567890123456' })).toBe('google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0\n');
  });
});
