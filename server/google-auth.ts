// Server-only Google Application Default Credentials (ADC) token source, without extra dependencies.
// Order: (1) service-account JSON from GOOGLE_APPLICATION_CREDENTIALS, (2) the GCE/Cloud Run metadata server.
// Tokens are cached until shortly before expiry; concurrent callers share one refresh.
import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import type { GoogleAccessTokenSource } from './google-cloud-provider.ts';

interface ServiceAccountKey {
  readonly client_email: string;
  readonly private_key: string;
  readonly token_uri?: string;
}

const METADATA_TOKEN_URL = 'http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/token';
const DEFAULT_TOKEN_URI = 'https://oauth2.googleapis.com/token';
const REFRESH_MARGIN_MS = 120_000;

function base64url(value: string | Buffer): string {
  return Buffer.from(value).toString('base64url');
}

export function parseServiceAccountKey(raw: string): ServiceAccountKey {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('Invalid service account JSON');
  }
  const key = parsed as Partial<ServiceAccountKey> & { type?: unknown };
  if (
    key.type !== 'service_account' ||
    typeof key.client_email !== 'string' ||
    typeof key.private_key !== 'string' ||
    !key.private_key.includes('PRIVATE KEY')
  ) {
    throw new Error('Unsupported credential file: a service_account key is required');
  }
  const tokenUri = typeof key.token_uri === 'string' && /^https:\/\/oauth2\.googleapis\.com\/token$/.test(key.token_uri)
    ? key.token_uri
    : DEFAULT_TOKEN_URI;
  return { client_email: key.client_email, private_key: key.private_key, token_uri: tokenUri };
}

/** Signed JWT assertion for the OAuth 2.0 JWT bearer grant. */
export function signedAssertion(key: ServiceAccountKey, scope: string, nowSeconds: number): string {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claims = base64url(JSON.stringify({
    iss: key.client_email,
    scope,
    aud: key.token_uri ?? DEFAULT_TOKEN_URI,
    iat: nowSeconds,
    exp: nowSeconds + 3600,
  }));
  const signer = createSign('RSA-SHA256');
  signer.update(`${header}.${claims}`);
  return `${header}.${claims}.${signer.sign(key.private_key).toString('base64url')}`;
}

interface CachedToken {
  readonly token: string;
  readonly expiresAt: number;
}

function tokenFromResponse(body: unknown, now: number): CachedToken {
  const value = body as { access_token?: unknown; expires_in?: unknown } | null;
  if (!value || typeof value.access_token !== 'string' || !value.access_token || /[\r\n]/.test(value.access_token)) {
    throw new Error('Invalid token response');
  }
  const ttl = typeof value.expires_in === 'number' && value.expires_in > 0 ? value.expires_in : 3000;
  return { token: value.access_token, expiresAt: now + ttl * 1000 };
}

export interface GoogleAdcOptions {
  readonly env?: NodeJS.ProcessEnv;
  readonly fetchImpl?: typeof fetch;
  readonly now?: () => number;
  readonly readCredentialFile?: (path: string) => Promise<string>;
}

export function createGoogleAdcTokenSource(options: GoogleAdcOptions = {}): GoogleAccessTokenSource {
  const env = options.env ?? process.env;
  const fetchImpl = options.fetchImpl ?? fetch;
  const now = options.now ?? Date.now;
  const readCredentialFile = options.readCredentialFile ?? ((path: string) => readFile(path, 'utf8'));
  const cache = new Map<string, CachedToken>();
  const inflight = new Map<string, Promise<CachedToken>>();

  const fetchToken = async (scope: string): Promise<CachedToken> => {
    const signal = AbortSignal.timeout(10_000);
    const credentialPath = env.GOOGLE_APPLICATION_CREDENTIALS;
    if (credentialPath) {
      const key = parseServiceAccountKey(await readCredentialFile(credentialPath));
      const assertion = signedAssertion(key, scope, Math.floor(now() / 1000));
      const res = await fetchImpl(key.token_uri ?? DEFAULT_TOKEN_URI, {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion }).toString(),
        signal,
      });
      if (!res.ok) throw new Error(`token exchange failed: ${res.status}`);
      return tokenFromResponse(await res.json(), now());
    }
    const res = await fetchImpl(`${METADATA_TOKEN_URL}?scopes=${encodeURIComponent(scope)}`, {
      headers: { 'metadata-flavor': 'Google' },
      signal,
    });
    if (!res.ok) throw new Error(`metadata token failed: ${res.status}`);
    return tokenFromResponse(await res.json(), now());
  };

  return Object.freeze({
    async getAccessToken(scope: string) {
      const cached = cache.get(scope);
      if (cached && cached.expiresAt - REFRESH_MARGIN_MS > now()) return cached.token;
      let pending = inflight.get(scope);
      if (!pending) {
        pending = fetchToken(scope).finally(() => inflight.delete(scope));
        inflight.set(scope, pending);
      }
      const fresh = await pending;
      cache.set(scope, fresh);
      return fresh.token;
    },
  });
}
