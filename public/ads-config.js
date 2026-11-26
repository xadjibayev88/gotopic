/* Voilà! reklama sozlamasi (qayta build shart emas).
   Android ilova (AdMob): "ca-app-pub-XXXXXXXXXXXXXXXX/NNNNNNNNNN" ko'rinishidagi birlik ID'lari.
   Bo'sh qolsa — ilovada Google'ning SINOV reklamalari ko'rinadi (daromad bermaydi).
   Sayt (AdSense): adsenseClient — "ca-pub-XXXXXXXXXXXXXXXX", adsenseSlot — Display blok raqami.
   adsenseRewarded — true bo'lsa saytda mukofotli video (XP / Vivi daqiqalari). AdSense'da «Ad placements» yoqilishi kerak.
   Super obunachilarida reklama hech qachon ko'rsatilmaydi. */
window.SALUT_ADS = {
  admobBanner: "",
  admobRewarded: "",
  admobInterstitial: "",
  adsenseClient: "",
  adsenseSlot: "",
  adsenseRewarded: false,
};
