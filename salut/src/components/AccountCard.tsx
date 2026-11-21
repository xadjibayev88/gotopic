// Profil: hisob kartasi (kirish holati, Super, chiqish, hisobni o'chirish).
import { useState } from 'react';
import { useAccount } from '../state/account';
import { AuthScreen } from '../screens/Auth';

export function AccountCard() {
  const { me, premium, signOut, deleteAccount } = useAccount();
  const [auth, setAuth] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const u = me.user;

  return (
    <>
      <div className="account-card">
        {u ? (
          <>
            <div className="acc-avatar">{u.avatar ? <img src={u.avatar} alt="" referrerPolicy="no-referrer" /> : (u.name || u.email || '?').slice(0, 1).toUpperCase()}</div>
            <div className="acc-body">
              <b>
                {u.name || 'Foydalanuvchi'} {premium && <span className="super-chip">SUPER</span>}
              </b>
              <small className="muted">
                {u.email} · {u.provider === 'google' ? 'Google' : 'Email'}
              </small>
              <small className="acc-sync">☁️ Progress bulutda saqlanadi</small>
            </div>
            <button type="button" className="btn btn-ghost" onClick={() => void signOut()}>
              Chiqish
            </button>
          </>
        ) : (
          <>
            <div className="acc-avatar guest">👤</div>
            <div className="acc-body">
              <b>Mehmon rejimi</b>
              <small className="muted">Progress faqat shu qurilmada. Profil yarating — yo'qolib qolmaydi.</small>
            </div>
            <button type="button" className="btn btn-primary" onClick={() => setAuth(true)}>
              Profil yaratish
            </button>
          </>
        )}
      </div>
      {u && (
        <button type="button" className="btn btn-text danger small-link" onClick={() => setConfirm(true)}>
          Hisobni o'chirish
        </button>
      )}

      {auth && (
        <div className="modal-back" onClick={() => setAuth(false)}>
          <div className="sheet auth-sheet" onClick={(e) => e.stopPropagation()}>
            <AuthScreen initial="register" onDone={() => setAuth(false)} onSkip={() => setAuth(false)} />
          </div>
        </div>
      )}
      {confirm && (
        <div className="modal-back" onClick={() => setConfirm(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <div className="big-emoji">⚠️</div>
            <h3>Hisob butunlay o'chirilsinmi?</h3>
            <p className="muted">Hisob, bulutdagi progress va obuna ma'lumotlari serverdan o'chiriladi. Bu amalni qaytarib bo'lmaydi.</p>
            <button
              type="button"
              className="btn btn-danger btn-lg"
              onClick={async () => {
                await deleteAccount();
                setConfirm(false);
              }}
            >
              Ha, o'chirish
            </button>
            <button type="button" className="btn btn-text" onClick={() => setConfirm(false)}>
              Bekor qilish
            </button>
          </div>
        </div>
      )}
    </>
  );
}
