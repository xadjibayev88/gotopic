import { beforeEach, describe, expect, it } from 'vitest';
process.env.SALUT_DB = ':memory:';
import { createSessionToken, currentAiSubject } from './accounts.ts';
import { db, resetDbForTests } from './db.ts';
import {
  AI_CONSENT_POLICY_VERSION,
  deleteAiMemory,
  getAiConsent,
  grantAiConsent,
  hasAiConsent,
  revokeAiConsent,
  sanitizeTutorBodyForMemoryConsent,
  type AiGrant,
  type AiSubject,
} from './ai-consent.ts';

const first: AiSubject = { kind: 'account', userId: 'user-one' };
const second: AiSubject = { kind: 'account', userId: 'user-two' };
const tutorGrant: AiGrant = { scope: 'text_tutor', provider: 'google-agent-platform' };
const memoryGrant: AiGrant = { scope: 'memory', provider: 'google-agent-platform' };

function addUser(id: string) {
  db().prepare('INSERT INTO users (id, email, name, created_at) VALUES (?, ?, ?, ?)').run(id, `${id}@example.test`, id, 1);
}

beforeEach(() => {
  resetDbForTests();
  addUser(first.userId);
  addUser(second.userId);
});

describe('signed-account AI consent', () => {
  it('denies a request when no consent exists', () => {
    expect(getAiConsent(first)).toBeNull();
    expect(hasAiConsent(first, 'text_tutor', 'google-agent-platform')).toBe(false);
  });

  it('persists a versioned, scoped grant with its provider and timestamps', () => {
    const granted = grantAiConsent(first, [tutorGrant], AI_CONSENT_POLICY_VERSION, 1234);
    expect(granted).toEqual({
      policyVersion: AI_CONSENT_POLICY_VERSION,
      grants: [{ ...tutorGrant, policyVersion: AI_CONSENT_POLICY_VERSION, grantedAt: 1234, revokedAt: null }],
      grantedAt: 1234,
      revokedAt: null,
    });
    expect(getAiConsent(first)).toEqual(granted);
    expect(hasAiConsent(first, 'text_tutor', 'google-agent-platform')).toBe(true);
  });

  it('denies a grant recorded under an older policy version', () => {
    db().prepare('INSERT INTO ai_consents (user_id, scope, provider, policy_version, granted_at, revoked_at) VALUES (?, ?, ?, ?, ?, NULL)')
      .run(first.userId, tutorGrant.scope, tutorGrant.provider, '2025-01-01-v1', 1234);
    expect(getAiConsent(first)?.policyVersion).toBe('2025-01-01-v1');
    expect(hasAiConsent(first, 'text_tutor', 'google-agent-platform')).toBe(false);
  });

  it('rejects unknown scopes and providers instead of storing them', () => {
    expect(() => grantAiConsent(first, [{ scope: 'admin' as never, provider: 'google-agent-platform' }], AI_CONSENT_POLICY_VERSION)).toThrow();
    expect(() => grantAiConsent(first, [{ scope: 'text_tutor', provider: 'arbitrary-url' as never }], AI_CONSENT_POLICY_VERSION)).toThrow();
    expect(() => grantAiConsent(first, [{ scope: 'text_tutor', provider: 'google-cloud-speech-to-text' }], AI_CONSENT_POLICY_VERSION)).toThrow();
  });

  it('does not allow one account to use another account consent', () => {
    grantAiConsent(first, [tutorGrant], AI_CONSENT_POLICY_VERSION);
    expect(hasAiConsent(second, 'text_tutor', 'google-agent-platform')).toBe(false);
    expect(getAiConsent(second)).toBeNull();
  });

  it('removes saved memory from tutor requests unless the separate memory scope is active', () => {
    const body = { message: 'Bonjour', context: { name: 'Learner', memory: 'Private saved fact', words: ['bonjour'] } };
    grantAiConsent(first, [tutorGrant], AI_CONSENT_POLICY_VERSION, 1000);

    const withoutMemoryConsent = sanitizeTutorBodyForMemoryConsent(first, body) as typeof body;
    expect(withoutMemoryConsent.context).not.toHaveProperty('memory');
    expect(withoutMemoryConsent.context.words).toEqual(['bonjour']);

    grantAiConsent(first, [tutorGrant, memoryGrant], AI_CONSENT_POLICY_VERSION, 2000);
    expect(sanitizeTutorBodyForMemoryConsent(first, body)).toEqual(body);
  });

  it('stops including saved memory immediately after the memory scope is revoked', () => {
    const body = { context: { memory: 'Private saved fact' } };
    grantAiConsent(first, [tutorGrant, memoryGrant], AI_CONSENT_POLICY_VERSION, 1000);
    grantAiConsent(first, [tutorGrant], AI_CONSENT_POLICY_VERSION, 2000);
    const sanitized = sanitizeTutorBodyForMemoryConsent(first, body) as typeof body;
    expect(sanitized.context).not.toHaveProperty('memory');
  });

  it('rejects a consent version submitted by a stale client', () => {
    expect(() => grantAiConsent(first, [tutorGrant], '2024-01-01-v1')).toThrow();
    expect(getAiConsent(first)).toBeNull();
  });

  it('blocks a new request immediately after consent is revoked', () => {
    grantAiConsent(first, [tutorGrant], AI_CONSENT_POLICY_VERSION, 1234);
    expect(revokeAiConsent(first, 2345)).toMatchObject({ revokedAt: 2345 });
    expect(hasAiConsent(first, 'text_tutor', 'google-agent-platform')).toBe(false);
    expect(getAiConsent(first)?.revokedAt).toBe(2345);
    expect(getAiConsent(first)?.grants[0]).toMatchObject({ scope: 'text_tutor', grantedAt: 1234, revokedAt: 2345 });
  });

  it('records a timestamp when one scope is removed while preserving other active scopes', () => {
    const translation: AiGrant = { scope: 'translation', provider: 'google-agent-platform' };
    grantAiConsent(first, [tutorGrant, translation], AI_CONSENT_POLICY_VERSION, 1000);
    const consent = grantAiConsent(first, [translation], AI_CONSENT_POLICY_VERSION, 2000);
    expect(hasAiConsent(first, 'text_tutor', 'google-agent-platform')).toBe(false);
    expect(hasAiConsent(first, 'translation', 'google-agent-platform')).toBe(true);
    expect(consent.revokedAt).toBeNull();
    expect(consent.grants.find((grant) => grant.scope === 'text_tutor')).toMatchObject({ grantedAt: 1000, revokedAt: 2000 });
    expect(consent.grants.find((grant) => grant.scope === 'translation')).toMatchObject({ grantedAt: 2000, revokedAt: null });
  });

  it('deletes only this account\'s saved memory from synced progress', () => {
    db().prepare('INSERT INTO progress (user_id, state, updated_at) VALUES (?, ?, ?)')
      .run(first.userId, JSON.stringify({ memory: '- My memory', xp: 7 }), 10);
    db().prepare('INSERT INTO progress (user_id, state, updated_at) VALUES (?, ?, ?)')
      .run(second.userId, JSON.stringify({ memory: '- Other account memory', xp: 9 }), 10);
    expect(deleteAiMemory(first, 20)).toBe(true);
    const saved = db().prepare('SELECT state FROM progress WHERE user_id = ?').get(first.userId) as { state: string };
    const other = db().prepare('SELECT state FROM progress WHERE user_id = ?').get(second.userId) as { state: string };
    expect(JSON.parse(saved.state)).toEqual({ memory: '', xp: 7 });
    expect(JSON.parse(other.state)).toEqual({ memory: '- Other account memory', xp: 9 });
  });

  it('derives consent subjects only from a valid signed account session, never from IP', () => {
    const token = createSessionToken(first.userId);
    const request = { headers: { cookie: `salut_session=${token}` } } as never;
    expect(currentAiSubject(request)).toEqual(first);
    expect(currentAiSubject({ headers: { 'x-forwarded-for': '198.51.100.8' } } as never)).toBeNull();
    expect(currentAiSubject({ headers: { cookie: 'salut_session=forged' } } as never)).toBeNull();
  });
});
