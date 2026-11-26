// Profil: hisob kartasi (kirish holati, Super, chiqish, hisobni o'chirish).
import { useState } from 'react';
import { Ic } from './Icons';
import { HoldButton } from './Micro';
import { useAccount } from '../state/account';
import { AuthScreen } from '../screens/Auth';

export function AccountCard({ onManageAiConsent }: { onManageAiConsent?: () => void }) {
  const { me, premium, signOut, deleteAccount } = useAccount();
  const [auth, setAuth] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const u = me.user;

  const [menu, setMenu] = useState(false);
  return (
    <>
      {u ? (
        <div className="acc-line">
          <span className="acc-line-ico" aria-hidden="true"><Ic name="user" size={18} /></span>
          <span className="acc-line-text">
            <b>{u.email}</b>
            <small>{u.provider === 'google' ? 'Google' : 'Email'} · progress bulutda saqlanadi</small>
          </span>
          <button type="button" className="acc-more" aria-label="Hisob sozlamalari" onClick={() => setMenu(true)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>
          </button>
        </div>
      ) : (
        <div className="acc-line guest">
          <span className="acc-line-ico" aria-hidden="true"><Ic name="user" size={18} /></span>
          <span className="acc-line-text">
            <b>Mehmon rejimi</b>
            <small>Progress faqat shu qurilmada</small>
          </span>
          <button type="button" className="btn btn-primary small" onClick={() => setAuth(true)}>
            Profil yaratish
          </button>
        </div>
      )}
      {menu && u && (
        <div className="modal-back" onClick={() => setMenu(false)}>
          <div className="sheet acc-sheet" onClick={(e) => e.stopPropagation()}>
            <div className="acc-avatar">{u.avatar ? <img src={u.avatar} alt="" referrerPolicy="no-referrer" /> : (u.name || u.email || '?').slice(0, 1).toUpperCase()}</div>
            <h3>
              {u.name || 'Foydalanuvchi'} {premium && <span className="super-chip">SUPER</span>}
            </h3>
            <p className="muted">{u.email}</p>
            <button type="button" className="btn btn-ghost btn-lg" onClick={() => { setMenu(false); void signOut(); }}>
              Hisobdan chiqish
            </button>
            {onManageAiConsent && (
              <button type="button" className="btn btn-text" onClick={() => { setMenu(false); onManageAiConsent(); }}>
                AI roziliklari
              </button>
            )}
            <button type="button" className="btn btn-text danger" onClick={() => { setMenu(false); setConfirm(true); }}>
              Hisobni o'chirish
            </button>
            <button type="button" className="btn btn-text" onClick={() => setMenu(false)}>
              Yopish
            </button>
          </div>
        </div>
      )}

      {auth && (
        <AuthScreen initial="register" onDone={() => setAuth(false)} onSkip={() => setAuth(false)} />
      )}
      {confirm && (
        <div className="modal-back" onClick={() => setConfirm(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji"><Ic name="warning" size={48} /></div>
            <h3>Hisob butunlay o'chirilsinmi?</h3>
            <p className="muted">Hisob, bulutdagi progress va obuna ma'lumotlari serverdan o'chiriladi. Bu amalni qaytarib bo'lmaydi.</p>
            <HoldButton
              className="btn-lg"
              holdingLabel="O'chirilmoqda — qo'yib yubormang…"
              onDone={async () => {
                await deleteAccount();
                setConfirm(false);
              }}
            >
              Bosib turing — o'chirish
            </HoldButton>
            <button type="button" className="btn btn-text" onClick={() => setConfirm(false)}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </>
  );
}
