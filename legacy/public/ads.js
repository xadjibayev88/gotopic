/* Ads: AdMob banner inside the Android app, AdSense on the website. Nothing loads until ads-config.js is filled. */
(() => {
  "use strict";
  const cfg = window.HM_ADS || {};
  const cap = window.Capacitor;
  const nativeCap = !!(cap && cap.isNativePlatform && cap.isNativePlatform());
  const androidBridge = window.AndroidAdMob;
  const native = nativeCap || !!androidBridge;

  const androidAdMob = androidBridge ? (() => {
    let sequence = 0;
    const pending = new Map();
    const rewardListeners = new Set();
    const call = (method, args) => new Promise((resolve, reject) => {
      const id = String(++sequence);
      pending.set(id, { resolve, reject });
      try { androidBridge[method](id, ...args); } catch (error) { pending.delete(id); reject(error); }
    });
    window.__gtAdResolve = (id, value) => { const job = pending.get(String(id)); if (!job) return; pending.delete(String(id)); job.resolve(value); };
    window.__gtAdReject = (id, message) => { const job = pending.get(String(id)); if (!job) return; pending.delete(String(id)); job.reject(new Error(String(message || "AdMob request failed"))); };
    window.__gtAdReward = () => rewardListeners.forEach(listener => { try { listener({ amount: 20, type: "xp" }); } catch (_) {} });
    return {
      initialize: options => call("initialize", [!!options?.initializeForTesting]),
      requestConsentInfo: async () => ({ isConsentFormAvailable: false, status: "NOT_REQUIRED" }),
      showConsentForm: async () => {},
      showBanner: options => call("showBanner", [String(options?.adId || ""), !!options?.isTesting]),
      hideBanner: () => call("hideBanner", []),
      resumeBanner: () => call("resumeBanner", []),
      prepareRewardVideoAd: options => call("prepareRewardVideoAd", [String(options?.adId || ""), !!options?.isTesting]),
      showRewardVideoAd: () => call("showRewardVideoAd", []),
      addListener: async (event, listener) => {
        if (event === "onRewardedVideoAdReward") rewardListeners.add(listener);
        return { remove: () => rewardListeners.delete(listener) };
      }
    };
  })() : null;

  if (native) {
    const AdMob = androidAdMob || (cap.Plugins && cap.Plugins.AdMob);
    if (!AdMob) return;
    const unit = String(cfg.admobBanner || "").trim();
    const testing = !/^ca-app-pub-\d{10,20}\/\d{6,20}$/.test(unit);
    const adId = testing ? "ca-app-pub-3940256099942544/6300978111" : unit; // Google's public test banner until a real unit is set
    const root = document.documentElement;
    let shown = false, hidden = false;
    const setHeight = px => root.style.setProperty("--ad-h", Math.max(0, Math.round(px || 0)) + "px");
    // Pro/Topic obunachilarida reklama yo'q: billing.js tarif aniqlangach GoTopicAds.off() chaqiradi.
    window.GoTopicAds = { off: () => { hidden = true; shown = false; setHeight(0); AdMob.hideBanner().catch(() => {}); } };
    (async () => {
      if (window.GoTopicPaid) return;
      await AdMob.initialize({ initializeForTesting: testing });
      if (window.GoTopicPaid) return;
      try { const info = await AdMob.requestConsentInfo(); if (info.isConsentFormAvailable && info.status === "REQUIRED") await AdMob.showConsentForm(); } catch (_) {}
      AdMob.addListener("bannerAdSizeChanged", size => setHeight(size && size.height));
      await AdMob.showBanner({ adId, adSize: "ADAPTIVE_BANNER", position: "BOTTOM_CENTER", margin: 0, isTesting: testing });
      shown = true;
    })().catch(() => setHeight(0));
    // No ads over the full-screen voice call: hide while it is open, bring back afterwards.
    new MutationObserver(() => {
      if (!shown) return;
      const inCall = document.body.classList.contains("incall");
      if (inCall && !hidden) { hidden = true; setHeight(0); AdMob.hideBanner().catch(() => {}); }
      if (!inCall && hidden) { hidden = false; AdMob.resumeBanner().catch(() => {}); }
    }).observe(document.body, { attributes: true, attributeFilter: ["class"] });
    // Rewarded video: +20 XP, at most 5 per day. UI calls window.GoTopicRewarded.show().
    const rUnit = String(cfg.admobRewarded || "").trim();
    const rTesting = !/^ca-app-pub-\d{10,20}\/\d{6,20}$/.test(rUnit);
    const rId = rTesting ? "ca-app-pub-3940256099942544/5224354917" : rUnit;
    const LIMIT = 5, XP = 20;
    const dayKey = () => "gt-rv-" + new Date(Date.now() + 5 * 3600e3).toISOString().slice(0, 10);
    const used = () => { try { return Number(localStorage.getItem(dayKey())) || 0; } catch (_) { return 0; } };
    const rewarded = { ready: false, busy: false, xp: XP, limit: LIMIT, left: () => Math.max(0, LIMIT - used()) };
    const prepare = async () => {
      if (rewarded.left() <= 0) return;
      try { await AdMob.prepareRewardVideoAd({ adId: rId, isTesting: rTesting }); rewarded.ready = true; }
      catch (_) { rewarded.ready = false; }
      window.dispatchEvent(new CustomEvent("gotopic:rewarded"));
    };
    rewarded.show = async () => {
      if (rewarded.busy || rewarded.left() <= 0) return { ok: false, reason: "limit" };
      rewarded.busy = true;
      let granted = false;
      const grant = () => {
        if (granted) return; granted = true;
        try { localStorage.setItem(dayKey(), String(used() + 1)); } catch (_) {}
        try { window.gain(XP); } catch (_) {}
      };
      let noAd = false, shownOk = false;
      const sub = await AdMob.addListener("onRewardedVideoAdReward", grant);
      try {
        if (!rewarded.ready) await AdMob.prepareRewardVideoAd({ adId: rId, isTesting: rTesting });
        rewarded.ready = false;
        shownOk = true;
        const item = await AdMob.showRewardVideoAd();
        if (item && Number(item.amount) > 0) grant();
      } catch (_) { noAd = !shownOk; }
      finally { try { sub.remove(); } catch (_) {} rewarded.busy = false; prepare(); window.dispatchEvent(new CustomEvent("gotopic:rewarded")); }
      return { ok: granted, reason: granted ? "" : noAd ? "no_ad" : "not_finished" };
    };
    window.GoTopicRewarded = rewarded;
    AdMob.initialize && setTimeout(prepare, 4000);
    return; // AdSense must not run inside the app
  }

  const client = String(cfg.client || "").trim();
  if (!/^ca-pub-\d{10,20}$/.test(client)) return;
  window.GoTopicAds = { off: () => { document.querySelectorAll(".ad-box,ins.adsbygoogle").forEach(el => el.remove()); } };
  if (window.GoTopicPaid) return;
  const script = document.createElement("script");
  script.async = true;
  script.crossOrigin = "anonymous";
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(client);
  document.head.appendChild(script);
  const slot = String(cfg.footerSlot || "").trim();
  if (!/^\d{6,20}$/.test(slot)) return; // Auto ads only (enable them in the AdSense dashboard)
  const place = () => {
    const footer = document.querySelector("footer .wrap");
    if (!footer || footer.querySelector(".ad-box")) return;
    footer.insertAdjacentHTML("afterbegin", `<div class="ad-box" aria-label="Reklama"><span class="ad-label">Reklama</span><ins class="adsbygoogle" style="display:block" data-ad-client="${client}" data-ad-slot="${slot}" data-ad-format="auto" data-full-width-responsive="true"></ins></div>`);
    try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) {}
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", place); else place();
})();
