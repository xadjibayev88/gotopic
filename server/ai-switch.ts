// Operator command for the persisted AI kill switch (it starts ON and is tripped automatically on a quota overrun).
//   npm run ai:on   → allow AI (still requires VIVI_AI_KILL_SWITCH=off and complete config)
//   npm run ai:off  → stop all AI requests immediately
//   npm run ai:status
import { isAiQuotaKillSwitchActive, setAiQuotaKillSwitchActive } from './ai-quota.ts';

const cmd = process.argv[2];
if (cmd === 'on' || cmd === 'off') {
  const ok = setAiQuotaKillSwitchActive(cmd === 'off');
  if (!ok) {
    console.error('Kill switch saqlanmadi (baza mavjud emasmi?).');
    process.exit(1);
  }
}
const envOff = process.env.VIVI_AI_KILL_SWITCH === 'off';
const active = isAiQuotaKillSwitchActive();
console.log(`AI kill switch: ${active ? 'YOQILGAN — AI o‘chiq' : 'o‘chirilgan — AI ruxsat etilgan'}`);
if (cmd === 'on') console.log('Bazadagi kalit o‘chirildi.');
if (!envOff) console.log('Eslatma: serverda VIVI_AI_KILL_SWITCH=off ham bo‘lishi kerak (bu buyruq muhitida u o‘rnatilmagan).');
if (cmd && cmd !== 'on' && cmd !== 'off' && cmd !== 'status') {
  console.error('Foydalanish: node server/ai-switch.ts on|off|status');
  process.exit(2);
}
