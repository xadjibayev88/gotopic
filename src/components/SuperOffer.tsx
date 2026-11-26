// Super taklifi: Vivi ustozga kirganda (bepul foydalanuvchilar) va bepul ovozli suhbat tugaganda.
import { createPortal } from 'react-dom';
import { Ic } from './Icons';
import { FishIcon } from './TopBarIcons';
import { Mascot } from './Mascot';

const PERKS: [React.ReactNode, string, string][] = [
  [<Ic key="a" name="mic" size={20} />, 'Vivi bilan cheksiz ovozli suhbat', "30 daqiqalik sessiyalar, kunlik limit yo'q"],
  [<Ic key="b" name="chat" size={20} />, 'Cheksiz xabarlar', "Kuniga 30 ta emas — xohlagancha"],
  [<Ic key="c" name="shield" size={20} />, 'Reklamasiz', "Darslar va suhbat orasida reklama yo'q"],
  [<FishIcon key="d" />, 'Cheksiz baliqcha', "Xato qilsangiz ham darsdan chiqmaysiz"],
];

export function SuperBanner({ onOpen }: { onOpen: () => void }) {
  return (
    <button type="button" className="super-banner" onClick={onOpen}>
      <span className="sb-badge">SUPER</span>
      <span className="sb-text">
        <b>Vivi bilan cheksiz gaplashing</b>
        <small>Bepul: kuniga 5 daqiqa ovoz va 30 ta xabar</small>
      </span>
      <span className="sb-go">›</span>
    </button>
  );
}

export function SuperOfferModal({ reason = 'enter', onClose }: { reason?: 'enter' | 'limit'; onClose: () => void }) {
  return createPortal(
    <div className="modal-back" onClick={onClose}>
      <div className="sheet super-offer" onClick={(e) => e.stopPropagation()}>
        <Mascot mood={reason === 'limit' ? 'sad' : 'cheer'} size={96} />
        <div className="super-badge">SUPER</div>
        <h3>{reason === 'limit' ? "Bugungi 5 daqiqa tugadi, jonim 😿" : 'Vivi bilan cheklovsiz gaplashing'}</h3>
        <p className="muted">
          {reason === 'limit' ? "Suhbatni hoziroq davom ettirmoqchimisiz? Super bilan Vivi siz bilan istalgancha gaplashadi." : 'Tezroq o\'rganing — Super bilan hech qanday limit yo\'q.'}
        </p>
        <ul className="super-perks">
          {PERKS.map(([i, t, d]) => (
            <li key={t}>
              <span>{i}</span>
              <div>
                <b>{t}</b>
                <small>{d}</small>
              </div>
            </li>
          ))}
        </ul>
        <button
          type="button"
          className="btn btn-primary btn-lg"
          onClick={() => {
            onClose();
            location.hash = '#/shop';
          }}
        >
          ⭐ Super olish — 49 000 so'mdan
        </button>
        <button type="button" className="btn btn-text" onClick={onClose}>
          {reason === 'limit' ? 'Ertaga davom etaman' : 'Keyinroq'}
        </button>
      </div>
    </div>,
    document.body,
  );
}
