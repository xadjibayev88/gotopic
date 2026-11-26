import { useEffect, useState } from 'react';
import { useAccount } from '../state/account';
import { Ic } from './Icons';
import { useStore } from '../state/store';
import {
  AI_CONSENT_POLICY_VERSION,
  AI_SCOPE_OPTIONS,
  GEMINI_API_FREE_TIER_NOTICE,
  scopeOptionsFor,
  deleteAiMemoryRequest,
  loadAiConsent,
  revokeAiConsentRequest,
  saveAiConsent,
  type AiConsent,
  type AiScope,
} from '../state/ai-consent';

export function AiConsentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { me } = useAccount();
  const { state, update } = useStore();
  const [policyVersion, setPolicyVersion] = useState(AI_CONSENT_POLICY_VERSION);
  const [consent, setConsent] = useState<AiConsent | null>(null);
  const [options, setOptions] = useState(() => [...AI_SCOPE_OPTIONS]);
  const [selected, setSelected] = useState<AiScope[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deletingMemory, setDeletingMemory] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    let alive = true;
    setLoading(true);
    setMessage('');
    setError('');
    setSelected([]);
    void loadAiConsent().then((r) => {
      if (!alive) return;
      if (!r.ok) {
        setError(r.status === 401 ? 'AI rozilik sozlamalarini boshqarish uchun hisobga kiring.' : 'Rozilik holatini yuklab bo‘lmadi.');
        setConsent(null);
        setSelected([]);
        return;
      }
      setPolicyVersion(r.body.policyVersion);
      setOptions(scopeOptionsFor(r.body.requirements));
      setConsent(r.body.consent);
      const validCurrent = r.body.consent?.policyVersion === r.body.policyVersion;
      setSelected(validCurrent ? r.body.consent!.grants.filter((g) => g.policyVersion === r.body.policyVersion && g.revokedAt === null).map((g) => g.scope) : []);
    }).catch(() => {
      if (alive) setError('Rozilik holatini yuklab bo‘lmadi.');
    }).finally(() => {
      if (alive) setLoading(false);
    });
    return () => { alive = false; };
  }, [open, me.user?.id]);

  if (!open) return null;

  // Serverdagi amaldagi roziliklar — toggle holati undan farq qilsa, «saqlanmagan» deb ko'rsatamiz.
  const active = !!consent && consent.revokedAt === null && consent.policyVersion === policyVersion;
  const saved = active ? consent!.grants.filter((g) => g.policyVersion === policyVersion && g.revokedAt === null).map((g) => g.scope) : [];
  const dirty = !loading && (saved.length !== selected.length || saved.some((s) => !selected.includes(s)));

  const toggle = (scope: AiScope, checked: boolean) => {
    setSelected((current) => checked
      ? current.includes(scope) ? current : [...current, scope]
      : current.filter((x) => x !== scope));
    setMessage('');
  };

  const save = async () => {
    if (!policyVersion || !selected.length) return;
    setSaving(true);
    setError('');
    const grants = options.filter((option) => selected.includes(option.scope))
      .map(({ scope, provider }) => ({ scope, provider }));
    const r = await saveAiConsent(policyVersion, grants);
    setSaving(false);
    if (!r.ok) {
      setError(r.status === 401 ? 'Rozilik berish uchun hisobga kiring.' : r.status === 409 ? 'Siyosat yangilangan. Oynani qayta ochib, yangi matnni ko‘rib chiqing.' : 'Rozilik saqlanmadi. Qayta urinib ko‘ring.');
      return;
    }
    setConsent(r.body.consent);
    setMessage('Tanlangan roziliklar serverda saqlandi. Provider yo‘llari alohida server sozlamasisiz yoqilmaydi.');
  };

  const revoke = async () => {
    setSaving(true);
    setError('');
    const r = await revokeAiConsentRequest();
    setSaving(false);
    if (!r.ok) {
      setError(r.status === 401 ? 'Rozilikni bekor qilish uchun hisobga kiring.' : 'Rozilik bekor qilinmadi. Qayta urinib ko‘ring.');
      return;
    }
    setConsent(r.body.consent);
    setSelected([]);
    setMessage('Barcha AI roziliklari bekor qilindi. Yangi AI so‘rovlari consent gate’dan o‘tmaydi.');
  };

  const clearMemory = async () => {
    setDeletingMemory(true);
    setError('');
    if (me.user) {
      const r = await deleteAiMemoryRequest();
      if (!r.ok) {
        setDeletingMemory(false);
        setError(r.status === 401 ? 'Xotirani serverdan o‘chirish uchun hisobga kiring.' : 'Xotirani serverdan o‘chirib bo‘lmadi.');
        return;
      }
    }
    update((s) => ({ ...s, memory: '' }));
    setDeletingMemory(false);
    setMessage('Vivi xotirasi ushbu qurilmadan va hisob sinxronizatsiyasidan o‘chirildi.');
  };

  const memoryExists = !!state.memory?.trim();
  const oldVersion = !!consent && consent.policyVersion !== policyVersion;

  return (
    <div className="modal-back" onClick={onClose}>
      <div className="sheet ai-consent-sheet" style={{ overflowY: 'auto', alignItems: 'stretch' }} role="dialog" aria-modal="true" aria-labelledby="ai-consent-title" onClick={(e) => e.stopPropagation()}>
        <div className="big-emoji" aria-hidden="true"><Ic name="shield" size={48} /></div>
        <h3 id="ai-consent-title">Vivi AI — rozilik va maxfiylik</h3>
        <p className="muted">Har bir tur alohida ixtiyoriy. Belgilar sukut bo‘yicha tanlanmaydi. Rozilik serverda hisobingizga bog‘lanadi va istalgan payt bekor qilinadi.</p>
        {policyVersion && <p><b>Siyosat versiyasi:</b> {policyVersion}</p>}
        {loading ? <p className="muted">Rozilik holati yuklanmoqda…</p> : (
          <div className="ai-consent-options">
            {options.some((o) => o.provider === 'google-gemini-api') && (
              <p className="muted small" role="note"><Ic name="warning" size={16} /> {GEMINI_API_FREE_TIER_NOTICE}</p>
            )}
            {options.map((option) => (
              <label className="setting" key={option.scope}>
                <span>
                  <b>{option.label}</b><br />
                  <small>{option.detail}</small><br />
                  <small>Provayder: {option.providerLabel}</small>
                </span>
                <input
                  type="checkbox"
                  checked={selected.includes(option.scope)}
                  disabled={saving || !me.user}
                  onChange={(e) => toggle(option.scope, e.target.checked)}
                />
              </label>
            ))}
          </div>
        )}
        {oldVersion && <p className="muted">Avvalgi rozilik siyosati eskirgan; u avtomatik yangilanmadi. Yangi versiya uchun scope’larni qaytadan tanlang.</p>}
        {!me.user && <p className="muted">Rozilikni serverda saqlash uchun hisobga kiring.</p>}
        <p className="muted">Provider sozlamalari, model va region keyin alohida tekshirilib yoqiladi. Provider’larning o‘zida saqlash muddati haqida bu yerda kafolat berilmaydi.</p>
        {error && <p className="danger" role="alert">{error}</p>}
        {message && <p className="muted" role="status">{message}</p>}
        {dirty && !saving && <p className="consent-dirty" role="status">Saqlanmagan o‘zgarish bor — pastdagi tugmani bosing.</p>}
        <button
          type="button"
          className={`btn btn-primary btn-lg ${dirty ? 'consent-save-dirty' : ''}`}
          disabled={loading || saving || !me.user || (!selected.length && !active)}
          onClick={() => void (selected.length ? save() : revoke())}
        >
          {saving ? 'Saqlanmoqda…' : selected.length ? 'Tanlangan roziliklarni saqlash' : 'Hammasini o‘chirib saqlash'}
        </button>
        <button type="button" className="btn btn-text danger" disabled={loading || saving || !me.user || !consent || consent.revokedAt !== null} onClick={() => void revoke()}>
          Barcha AI roziligini bekor qilish
        </button>
        <div className="panel" aria-label="Vivi xotirasi">
          <b>Vivi xotirasi</b>
          <p className="muted small">Bu amal profilingizdagi Vivi xotirasini va server bilan sinxronlangan progressdagi shu xotira maydonini o‘chiradi. Oxirgi suhbat transkripti, asl audio yoki providerda bo‘lishi mumkin bo‘lgan ma’lumotni o‘chirmaydi.</p>
          <button type="button" className="btn btn-text danger" disabled={!memoryExists || deletingMemory} onClick={() => void clearMemory()}>
            {deletingMemory ? 'O‘chirilmoqda…' : 'Saqlangan Vivi xotirasini o‘chirish'}
          </button>
        </div>
        <button type="button" className="btn btn-text" onClick={onClose}>Yopish</button>
      </div>
    </div>
  );
}
