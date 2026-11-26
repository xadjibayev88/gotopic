// Saytdagi AdSense bloki (Android ilovada va Super obunachilarida ko'rinmaydi).
import { useEffect, useRef } from 'react';
import { adsenseClient, loadAdsense } from '../engine/ads';
import { useAccount } from '../state/account';

export function AdSlot() {
  const { premium } = useAccount();
  const ref = useRef<HTMLModElement>(null);
  const client = premium ? null : adsenseClient();
  const slot = window.SALUT_ADS?.adsenseSlot?.trim();
  useEffect(() => {
    if (!client || !slot || !/^\d{6,20}$/.test(slot) || !ref.current || ref.current.dataset.done) return;
    loadAdsense();
    ref.current.dataset.done = '1';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* e'tiborsiz */
    }
  }, [client, slot]);
  if (!client || !slot) return null;
  return (
    <div className="ad-box" aria-label="Reklama">
      <span className="ad-label">Reklama</span>
      <ins ref={ref} className="adsbygoogle" style={{ display: 'block' }} data-ad-client={client} data-ad-slot={slot} data-ad-format="auto" data-full-width-responsive="true" />
    </div>
  );
}
