// Foydalanuvchi ilova tilini tanlaganda: interfeys tarjimasi + Hori tushuntirish tili ham shu tilga o'tadi
// (Hori sozlamalarida keyin alohida o'zgartirish mumkin).
import { loadPrefs, savePrefs } from '../engine/voice/prefs';
import { setLang, type Lang } from './index';

export async function chooseLanguage(lang: Lang): Promise<void> {
  await setLang(lang);
  try {
    savePrefs({ ...loadPrefs(), lang });
  } catch {
    /* saqlash bloklangan */
  }
}
