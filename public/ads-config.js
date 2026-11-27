/* Voilà! reklama sozlamasi (qayta build shart emas).
   Android ilova (AdMob): "ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN" ko'rinishidagi birlik ID'lari.
   Bo'sh qolsa — ilovada Google'ning SINOV reklamalari ko'rinadi (daromad bermaydi).
   Sayt (AdSense): adsenseClient — "ca-pub-XXXXXXXXXXXXXXXX", adsenseSlot — Display blok raqami.
   adsenseRewarded — true bo'lsa saytda mukofotli video (XP / Vivi daqiqalari). AdSense'da «Ad placements» yoqilishi kerak.
   admobTestAds — true bo'lsa ID'siz birliklar o'rniga Google SINOV reklamasi (oqimni tekshirish uchun).
   Railway Variables orqali ham beriladi (qulayroq, bu fayl e'tiborsiz qoladi): ADMOB_REWARDED_ID, ADMOB_BANNER_ID,
   ADMOB_INTERSTITIAL_ID, ADMOB_TEST_ADS=1, ADMOB_PUBLISHER_ID (app-ads.txt uchun).
   Super obunachilarida reklama hech qachon ko'rsatilmaydi. */
window.SALUT_ADS = {
  admobBanner: "",
  admobRewarded: "",
  admobInterstitial: "",
  admobTestAds: false,
  adsenseClient: "",
  adsenseSlot: "",
  adsenseRewarded: false,
};
