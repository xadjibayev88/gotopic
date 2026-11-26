import { accountApi } from './account';

export const AI_CONSENT_POLICY_VERSION = '2026-11-24-v1';

export type AiScope =
  | 'text_tutor'
  | 'text_feedback'
  | 'live_session'
  | 'translation'
  | 'memory'
  | 'microphone_stt'
  | 'text_tts';
export type AiProviderName = 'google-agent-platform' | 'google-cloud-speech-to-text' | 'google-gemini-api';
export interface AiGrant {
  scope: AiScope;
  provider: AiProviderName;
}
export interface AiGrantRecord extends AiGrant {
  policyVersion: string;
  grantedAt: number;
  revokedAt: number | null;
}
export interface AiConsent {
  policyVersion: string;
  grants: AiGrantRecord[];
  grantedAt: number;
  revokedAt: number | null;
}
export interface AiConsentResponse {
  policyVersion: string;
  /** Scope → provider pairs the server enforces right now. */
  requirements?: AiGrant[];
  consent: AiConsent | null;
}

export const AI_PROVIDER_LABELS: Record<AiProviderName, string> = {
  'google-agent-platform': 'Google Cloud Agent Platform (Gemini)',
  'google-cloud-speech-to-text': 'Google Cloud Speech-to-Text',
  'google-gemini-api': 'Google Gemini API (AI Studio, bepul tarif)',
};

/** Free-tier notice shown whenever any scope is served by the Gemini Developer API. */
export const GEMINI_API_FREE_TIER_NOTICE =
  'Bepul tarifda Google yuborilgan matn va audiodan o‘z mahsulotlarini yaxshilash uchun foydalanishi va ularni odamlar ko‘rib chiqishi mumkin. Maxfiy ma’lumot (parol, karta, manzil) yubormang.';

/** Apply the server's provider for each scope; scopes the server does not list keep their defaults. */
export function scopeOptionsFor(requirements: readonly AiGrant[] | undefined) {
  return AI_SCOPE_OPTIONS.map((option) => {
    const provider = requirements?.find((r) => r.scope === option.scope)?.provider;
    if (!provider || !(provider in AI_PROVIDER_LABELS)) return option;
    const detail = provider === 'google-gemini-api' && option.scope === 'microphone_stt'
      ? 'Yozib olingan asl audio matnga aylantirish uchun Gemini API’ga yuboriladi.'
      : option.detail;
    return { ...option, provider, providerLabel: AI_PROVIDER_LABELS[provider], detail };
  });
}

export const AI_SCOPE_OPTIONS: readonly {
  scope: AiScope;
  provider: AiProviderName;
  label: string;
  detail: string;
  providerLabel: string;
}[] = [
  {
    scope: 'text_tutor',
    provider: 'google-agent-platform',
    label: 'Vivi bilan matnli fransuz tili mashqi',
    detail: 'Yozgan xabaringiz va kerakli A1–C2 mashq konteksti yuboriladi.',
    providerLabel: 'Google Cloud Agent Platform (Gemini)',
  },
  {
    scope: 'text_feedback',
    provider: 'google-agent-platform',
    label: 'Javob va mashq bo‘yicha fikr-mulohaza',
    detail: 'Siz tasdiqlagan javob va unga tegishli mashq konteksti yuboriladi.',
    providerLabel: 'Google Cloud Agent Platform (Gemini)',
  },
  {
    scope: 'live_session',
    provider: 'google-agent-platform',
    label: 'Jonli AI suhbat sessiyasi',
    detail: 'Jonli (real vaqtli) ovozli suhbat: mikrofon ovozi va Vivi javoblari suhbat davomida to‘g‘ridan-to‘g‘ri Gemini Live’ga uzatiladi.',
    providerLabel: 'Google Cloud Agent Platform',
  },
  {
    scope: 'translation',
    provider: 'google-agent-platform',
    label: 'Fransuzcha matn tarjimasi',
    detail: 'Faqat tarjima uchun zarur bo‘lgan matn yuboriladi.',
    providerLabel: 'Google Cloud Agent Platform (Gemini)',
  },
  {
    scope: 'memory',
    provider: 'google-agent-platform',
    label: 'Vivi xotirasini yaratish yoki yangilash',
    detail: 'Faqat siz ko‘rib, saqlashni tasdiqlagan o‘quvchi konteksti yuboriladi.',
    providerLabel: 'Google Cloud Agent Platform (Gemini)',
  },
  {
    scope: 'microphone_stt',
    provider: 'google-cloud-speech-to-text',
    label: 'Mikrofon yozuvini matnga aylantirish',
    detail: 'Yozib olingan asl audio Cloud Speech-to-Text xizmatiga yuboriladi.',
    providerLabel: 'Google Cloud Speech-to-Text',
  },
  {
    scope: 'text_tts',
    provider: 'google-agent-platform',
    label: 'Vivi javobini ovozlashtirish',
    detail: 'Vivi javobining matni ovoz yaratish uchun yuboriladi.',
    providerLabel: 'Google Cloud Agent Platform (Gemini TTS)',
  },
];

export async function loadAiConsent(): Promise<{ ok: boolean; status: number; body: AiConsentResponse }> {
  return accountApi<AiConsentResponse>('ai/consent');
}

export async function saveAiConsent(policyVersion: string, grants: AiGrant[]) {
  return accountApi<AiConsentResponse>('ai/consent', {
    method: 'PUT',
    body: JSON.stringify({ policyVersion, grants }),
  });
}

export async function revokeAiConsentRequest() {
  return accountApi<{ consent: AiConsent | null }>('ai/consent', { method: 'DELETE' });
}

export async function deleteAiMemoryRequest() {
  return accountApi<{ deleted: boolean }>('ai/memory', { method: 'DELETE' });
}

/** Ro'yxatdan o'tishda bitta toggle bilan berilgan rozilik: serverdagi barcha AI vazifalariga ruxsat yoziladi. */
export async function grantAllAiConsent(): Promise<boolean> {
  const r = await loadAiConsent();
  if (!r.ok) return false;
  const grants = scopeOptionsFor(r.body.requirements).map(({ scope, provider }) => ({ scope, provider }));
  const w = await saveAiConsent(r.body.policyVersion, grants);
  return w.ok;
}
