// Vivi «mo'ralovchi»: matn maydoni chetidan boshchasini chiqarib turgan Vivi (asl mushukcha rasmi).
// idle — xotirjam; typing — siz yozayotganda sekin bosh irg'ab «kuzatadi» (har harfda sakramaydi);
// thinking — javob tayyorlayotganda yengil chayqaladi, yonida «…» pufakchasi. Faqat transform/opacity.
import { Mascot } from './Mascot';

export type PeekMode = 'idle' | 'typing' | 'thinking' | 'happy';

export function ViviPeek({ mode, className = '' }: { mode: PeekMode; len?: number; className?: string }) {
  const mood = mode === 'happy' ? 'cheer' : mode === 'idle' ? 'happy' : 'think';
  return (
    <span className={`vpeek vp-${mode} ${className}`} aria-hidden="true">
      <span className="vpeek-clip">
        <span className="vpeek-cat">
          <Mascot mood={mood} size={50} />
        </span>
      </span>
      <span className="vpeek-dots">
        <i />
        <i />
        <i />
      </span>
    </span>
  );
}
