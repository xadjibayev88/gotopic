// O'yin mantiqi: XP, streak, yuraklar, olmoslar, liga, yutuqlar va SRS.
// Hamma funksiyalar sof (pure): eski holatni olib, yangisini qaytaradi.
import { ALL_LESSONS, COURSE } from '../data/course';
import { hashString, rng } from './random';
import { addDays, dayKey, daysBetween, weekId, weekStart } from './time';

export const MAX_HEARTS = 5;
export const HEART_REGEN_MS = 30 * 60 * 1000;
export const HEART_REFILL_COST = 350;
export const FREEZE_COST = 200;
export const MAX_FREEZES = 2;

export interface WordStat {
  strength: number; // 0..5
  correct: number;
  wrong: number;
  lastSeen: number;
}

export interface LeagueState {
  tier: number;
  weekId: string;
  weeklyXp: number;
  /** O'tgan hafta natijasi (modal ko'rsatish uchun). */
  lastResult?: { rank: number; fromTier: number; toTier: number; weekId: string; seen: boolean };
}

export interface GameState {
  version: 1;
  name: string;
  onboarded: boolean;
  dailyGoal: number;
  createdAt: number;
  xp: number;
  gems: number;
  hearts: number;
  heartsUpdatedAt: number;
  unlimitedHearts: boolean;
  streak: number;
  longestStreak: number;
  lastActiveDay: string | null;
  streakFreezes: number;
  frozenDays: string[];
  xpByDay: Record<string, number>;
  chatXpByDay: Record<string, number>;
  chatMessages: number;
  /** AI ustoz suhbatidan lug'atga qo'shilgan so'zlar. */
  customWords: { fr: string; uz: string; addedAt: number }[];
  /** Kunlik vazifalar uchun bugungi hisoblagichlar. */
  daily: DailyCounters;
  /** Ikki barobar ball tugaydigan vaqt (ms). */
  xpBoostUntil: number;
  /** Uzilgan seriya — 2 kun ichida tiklash mumkin. */
  lostStreak: { value: number; day: string } | null;
  /** Super: bepul soyabon oxirgi marta berilgan oy (YYYY-MM). */
  superFreezeMonth: string | null;
  lessonsDone: Record<string, number>;
  lessonsCompleted: number;
  perfectLessons: number;
  practiceDone: number;
  chests: string[];
  words: Record<string, WordStat>;
  mistakes: Record<string, number>;
  league: LeagueState;
  achievements: Record<string, number>;
  settings: { sound: boolean; ttsRate: number; listening: boolean; tutorVoice: boolean };
}

export function initialState(now = Date.now()): GameState {
  return {
    version: 1,
    name: '',
    onboarded: false,
    dailyGoal: 20,
    createdAt: now,
    xp: 0,
    gems: 500,
    hearts: MAX_HEARTS,
    heartsUpdatedAt: now,
    unlimitedHearts: false,
    streak: 0,
    longestStreak: 0,
    lastActiveDay: null,
    streakFreezes: 0,
    frozenDays: [],
    xpByDay: {},
    chatXpByDay: {},
    chatMessages: 0,
    customWords: [],
    daily: emptyDaily(dayKey(new Date(now))),
    xpBoostUntil: 0,
    lostStreak: null,
    superFreezeMonth: null,
    lessonsDone: {},
    lessonsCompleted: 0,
    perfectLessons: 0,
    practiceDone: 0,
    chests: [],
    words: {},
    mistakes: {},
    league: { tier: 0, weekId: weekId(new Date(now)), weeklyXp: 0 },
    achievements: {},
    settings: { sound: true, ttsRate: 0.9, listening: true, tutorVoice: true },
  };
}

// ---------- Yuraklar ----------

export function regenHearts(s: GameState, now = Date.now()): GameState {
  if (s.hearts >= MAX_HEARTS) return s;
  const gained = Math.floor((now - s.heartsUpdatedAt) / HEART_REGEN_MS);
  if (gained <= 0) return s;
  const hearts = Math.min(MAX_HEARTS, s.hearts + gained);
  return { ...s, hearts, heartsUpdatedAt: hearts >= MAX_HEARTS ? now : s.heartsUpdatedAt + gained * HEART_REGEN_MS };
}

export function msToNextHeart(s: GameState, now = Date.now()): number | null {
  if (s.hearts >= MAX_HEARTS) return null;
  return Math.max(0, HEART_REGEN_MS - (now - s.heartsUpdatedAt));
}

export function loseHeart(s: GameState, now = Date.now()): GameState {
  if (s.unlimitedHearts || s.hearts <= 0) return s;
  const wasFull = s.hearts >= MAX_HEARTS;
  return { ...s, hearts: s.hearts - 1, heartsUpdatedAt: wasFull ? now : s.heartsUpdatedAt };
}

// ---------- Streak ----------

/** Ilova ochilganda: o'tkazib yuborilgan kunlarni muzlatish yoki streakni nolga tushirish. */
export function reconcileStreak(s: GameState, now = new Date()): GameState {
  if (!s.lastActiveDay || s.streak === 0) return s;
  const today = dayKey(now);
  const gap = daysBetween(s.lastActiveDay, today);
  if (gap <= 1) return s;
  const missed = gap - 1;
  if (s.streakFreezes >= missed) {
    const frozen: string[] = [];
    for (let i = 1; i <= missed; i++) frozen.push(addDays(s.lastActiveDay, i));
    return {
      ...s,
      streakFreezes: s.streakFreezes - missed,
      frozenDays: [...s.frozenDays, ...frozen].slice(-60),
      lastActiveDay: addDays(today, -1),
    };
  }
  return { ...s, streak: 0, lostStreak: s.streak >= 2 ? { value: s.streak, day: today } : s.lostStreak };
}

function touchStreak(s: GameState, now: Date): GameState {
  const today = dayKey(now);
  if (s.lastActiveDay === today) return s;
  const continues = s.lastActiveDay && daysBetween(s.lastActiveDay, today) === 1;
  const streak = continues ? s.streak + 1 : 1;
  return { ...s, streak, longestStreak: Math.max(s.longestStreak, streak), lastActiveDay: today };
}

export function streakActiveToday(s: GameState, now = new Date()): boolean {
  return s.lastActiveDay === dayKey(now);
}

// ---------- Liga ----------

// Turnir bosqichlari — Fransiya shaharlari bo'ylab sayohat (Ruandan Parijgacha).
export const LEAGUES = [
  { name: 'Ruan', color: '#A16207', icon: '⛪' },
  { name: 'Lill', color: '#6B7280', icon: '🧇' },
  { name: 'Nant', color: '#0E7490', icon: '🐘' },
  { name: 'Strasburg', color: '#B45309', icon: '🥨' },
  { name: 'Bordo', color: '#9F1239', icon: '🍇' },
  { name: 'Tuluza', color: '#DB2777', icon: '🌸' },
  { name: 'Marsel', color: '#0369A1', icon: '⚓' },
  { name: 'Lion', color: '#B91C1C', icon: '🦁' },
  { name: 'Nitsa', color: '#0891B2', icon: '🏖️' },
  { name: 'Parij', color: '#1E2A78', icon: '🗼' },
];

export const LEAGUE_SIZE = 30;
export const PROMOTE = 7;
export const DEMOTE = 5;

const BOT_NAMES = [
  'Madina', 'Jasur', 'Camille', 'Sardor', 'Léa', 'Dilnoza', 'Bekzod', 'Hugo', 'Nilufar', 'Aziz',
  'Chloé', 'Otabek', 'Malika', 'Louis', 'Shahzod', 'Gulnora', 'Timur', 'Inès', 'Rustam', 'Zarina',
  'Lucas', 'Feruza', 'Doniyor', 'Manon', 'Kamola', 'Ulugbek', 'Emma', 'Sevara', 'Javohir', 'Nathan',
  'Shoira', 'Akmal', 'Jade', 'Sanjar', 'Laylo', 'Jules', 'Mohira', 'Islom', 'Zoé', 'Diyora',
];
const AVATARS = ['🦊', '🐼', '🐯', '🦁', '🐨', '🐸', '🐵', '🦉', '🐧', '🐙', '🦄', '🐻', '🐰', '🐶', '🐱', '🦋'];

export interface LeagueRow {
  id: string;
  name: string;
  avatar: string;
  xp: number;
  isMe: boolean;
}

/** Haftaning qancha qismi o'tgani (0..1). */
function weekProgress(wid: string, now: Date): number {
  const start = weekStart(wid).getTime();
  return Math.min(1, Math.max(0, (now.getTime() - start) / (7 * 86_400_000)));
}

export function leagueStandings(league: LeagueState, now = new Date(), name = 'Siz'): LeagueRow[] {
  const r = rng(hashString(`${league.weekId}:${league.tier}`));
  const p = weekProgress(league.weekId, now);
  const pool = BOT_NAMES.slice();
  const rows: LeagueRow[] = [];
  for (let i = 0; i < LEAGUE_SIZE - 1; i++) {
    const idx = Math.floor(r() * pool.length);
    const botName = pool.splice(idx, 1)[0];
    // Har bir bot o'z "faollik" darajasiga ega; yuqori ligada kuchliroq.
    const activity = Math.pow(r(), 1.6) * (300 + league.tier * 120);
    const jitter = 0.75 + r() * 0.5;
    const curve = Math.pow(p, 0.85 + r() * 0.4);
    rows.push({ id: `b${i}`, name: botName, avatar: AVATARS[Math.floor(r() * AVATARS.length)], xp: Math.round(activity * jitter * curve), isMe: false });
  }
  rows.push({ id: 'me', name: name || 'Siz', avatar: '🥐', xp: league.weeklyXp, isMe: true });
  return rows.sort((a, b) => b.xp - a.xp || (a.isMe ? -1 : b.isMe ? 1 : 0));
}

/** Yangi hafta boshlanganda ligani yangilaydi (ko'tarilish / tushish). */
export function rolloverLeague(s: GameState, now = new Date()): GameState {
  const current = weekId(now);
  if (s.league.weekId === current) return s;
  const prev = s.league;
  const end = new Date(weekStart(prev.weekId).getTime() + 7 * 86_400_000 - 1000);
  const rank = leagueStandings(prev, end, s.name).findIndex((r) => r.isMe) + 1;
  let toTier = prev.tier;
  if (prev.weeklyXp > 0 && rank <= PROMOTE) toTier = Math.min(LEAGUES.length - 1, prev.tier + 1);
  else if (rank > LEAGUE_SIZE - DEMOTE && prev.tier > 0) toTier = prev.tier - 1;
  const participated = prev.weeklyXp > 0;
  return {
    ...s,
    gems: s.gems + (participated && rank <= 3 ? [0, 100, 60, 40][rank] : 0),
    league: {
      tier: toTier,
      weekId: current,
      weeklyXp: 0,
      lastResult: participated ? { rank, fromTier: prev.tier, toTier, weekId: prev.weekId, seen: false } : undefined,
    },
  };
}

// ---------- SRS (so'zlar kuchi) ----------

export function updateWord(stat: WordStat | undefined, correct: boolean, now = Date.now()): WordStat {
  const s = stat ?? { strength: 0, correct: 0, wrong: 0, lastSeen: now };
  return {
    strength: correct ? Math.min(5, s.strength + 1) : Math.max(0, s.strength - 2),
    correct: s.correct + (correct ? 1 : 0),
    wrong: s.wrong + (correct ? 0 : 1),
    lastSeen: now,
  };
}

/** So'zning hozirgi "kuchi" (vaqt o'tishi bilan susayadi). 0..1 */
export function wordRecall(stat: WordStat, now = Date.now()): number {
  const days = (now - stat.lastSeen) / 86_400_000;
  const halfLife = Math.pow(2, stat.strength) * 0.5; // kunlarda
  return Math.pow(0.5, days / Math.max(0.25, halfLife));
}

// ---------- Dars natijasi ----------

export interface SessionResult {
  kind: 'lesson' | 'practice' | 'review';
  lessonId?: string;
  total: number;
  firstTryCorrect: number;
  mistakesCount: number;
  bestCombo: number;
  durationMs: number;
  wordResults: { fr: string; correct: boolean }[];
  mistakeRefs: string[];
  fixedRefs: string[];
}

export interface Reward {
  xp: number;
  gems: number;
  accuracy: number;
  perfect: boolean;
  bonus: { label: string; xp: number }[];
  streakExtended: boolean;
  newAchievements: string[];
  goalReachedNow: boolean;
  heartBack: boolean;
}

export function computeReward(r: SessionResult): Omit<Reward, 'streakExtended' | 'newAchievements' | 'goalReachedNow' | 'heartBack'> {
  const accuracy = r.total ? Math.round((r.firstTryCorrect / r.total) * 100) : 0;
  const perfect = r.mistakesCount === 0 && r.total > 0;
  const base = r.kind === 'lesson' ? 10 : r.kind === 'review' ? 15 : 10;
  const bonus: { label: string; xp: number }[] = [];
  if (perfect) bonus.push({ label: 'Xatosiz dars', xp: 5 });
  if (r.bestCombo >= 8) bonus.push({ label: `${r.bestCombo}x ketma-ket`, xp: 3 });
  if (r.durationMs > 0 && r.durationMs < 90_000 && r.total >= 10) bonus.push({ label: 'Tezkor', xp: 2 });
  const xp = base + bonus.reduce((a, b) => a + b.xp, 0);
  const gems = (perfect ? 10 : 5) + (r.kind === 'review' ? 10 : 0);
  return { xp, gems, accuracy, perfect, bonus };
}

export function applySession(s: GameState, r: SessionResult, now = new Date()): { state: GameState; reward: Reward } {
  const base0 = computeReward(r);
  const boosted = s.xpBoostUntil > now.getTime();
  const base = boosted ? { ...base0, xp: base0.xp * 2, bonus: [...base0.bonus, { label: 'Ikki barobar ball ⚡', xp: base0.xp }] } : base0;
  const today = dayKey(now);
  const ts = now.getTime();
  let next: GameState = rolloverLeague(s, now);
  const beforeToday = next.xpByDay[today] ?? 0;
  const wasActive = next.lastActiveDay === today;
  next = touchStreak(next, now);

  const words = { ...next.words };
  for (const w of r.wordResults) words[w.fr] = updateWord(words[w.fr], w.correct, ts);

  const mistakes = { ...next.mistakes };
  for (const m of r.mistakeRefs) mistakes[m] = (mistakes[m] ?? 0) + 1;
  for (const f of r.fixedRefs) delete mistakes[f];

  const lessonsDone = { ...next.lessonsDone };
  if (r.lessonId) lessonsDone[r.lessonId] = (lessonsDone[r.lessonId] ?? 0) + 1;

  const heartBack = r.kind === 'practice' && next.hearts < MAX_HEARTS;
  next = {
    ...next,
    xp: next.xp + base.xp,
    gems: next.gems + base.gems,
    hearts: heartBack ? next.hearts + 1 : next.hearts,
    xpByDay: { ...next.xpByDay, [today]: beforeToday + base.xp },
    words,
    mistakes,
    lessonsDone,
    lessonsCompleted: next.lessonsCompleted + (r.kind === 'lesson' ? 1 : 0),
    perfectLessons: next.perfectLessons + (base.perfect ? 1 : 0),
    practiceDone: next.practiceDone + (r.kind !== 'lesson' ? 1 : 0),
    league: { ...next.league, weeklyXp: next.league.weeklyXp + base.xp },
  };
  next = bumpDaily(next, now, {
    xp: base.xp,
    lessons: r.kind === 'lesson' ? 1 : 0,
    perfect: base.perfect ? 1 : 0,
    practice: r.kind !== 'lesson' ? 1 : 0,
    combo: r.bestCombo,
  });
  const unlocked = evaluateAchievements(next, ts);
  next = { ...next, achievements: { ...next.achievements, ...Object.fromEntries(unlocked.map((a) => [a, ts])) } };
  return {
    state: next,
    reward: {
      ...base,
      streakExtended: !wasActive,
      newAchievements: unlocked,
      goalReachedNow: beforeToday < next.dailyGoal && beforeToday + base.xp >= next.dailyGoal,
      heartBack,
    },
  };
}

// ---------- AI ustoz bilan suhbat ----------

export const CHAT_XP = 2;
export const CHAT_XP_DAILY_CAP = 20;

/** Ustozga yuborilgan har bir xabar uchun XP (kuniga cheklangan); streak va ligaga ham hisoblanadi. */
export function applyChatTurn(s: GameState, now = new Date()): { state: GameState; xp: number } {
  const today = dayKey(now);
  const used = s.chatXpByDay[today] ?? 0;
  const xp = Math.max(0, Math.min(CHAT_XP, CHAT_XP_DAILY_CAP - used)) * (s.xpBoostUntil > now.getTime() ? 2 : 1);
  let next: GameState = { ...s, chatMessages: s.chatMessages + 1 };
  if (xp > 0) {
    next = touchStreak(rolloverLeague(next, now), now);
    next = {
      ...next,
      xp: next.xp + xp,
      xpByDay: { ...next.xpByDay, [today]: (next.xpByDay[today] ?? 0) + xp },
      chatXpByDay: { ...next.chatXpByDay, [today]: used + xp },
      league: { ...next.league, weeklyXp: next.league.weeklyXp + xp },
    };
  }
  next = bumpDaily(next, now, { chat: 1, xp });
  const unlocked = evaluateAchievements(next, now.getTime());
  if (unlocked.length) next = { ...next, achievements: { ...next.achievements, ...Object.fromEntries(unlocked.map((a) => [a, now.getTime()])) } };
  return { state: next, xp };
}

// ---------- Yutuqlar ----------

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  goal: number;
  progress: (s: GameState) => number;
}

const learnedWords = (s: GameState) => Object.keys(s.words).length;

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', title: 'Ilk qadam', desc: 'Birinchi darsni tugating', icon: '🚀', goal: 1, progress: (s) => s.lessonsCompleted },
  { id: 'streak3', title: 'Quyosh chiqdi', desc: '3 kunlik seriya', icon: '☀️', goal: 3, progress: (s) => s.longestStreak },
  { id: 'streak7', title: 'Bir hafta', desc: '7 kunlik seriya', icon: '📆', goal: 7, progress: (s) => s.longestStreak },
  { id: 'streak30', title: 'Temir iroda', desc: '30 kunlik seriya', icon: '🏔️', goal: 30, progress: (s) => s.longestStreak },
  { id: 'xp100', title: 'Bilimdon', desc: '100 ball to\'plang', icon: '⭐', goal: 100, progress: (s) => s.xp },
  { id: 'xp500', title: 'Olim', desc: '500 ball to\'plang', icon: '🌟', goal: 500, progress: (s) => s.xp },
  { id: 'xp2000', title: 'Professor', desc: '2000 ball to\'plang', icon: '🎓', goal: 2000, progress: (s) => s.xp },
  { id: 'perfect5', title: 'Mukammal', desc: '5 ta xatosiz dars', icon: '💯', goal: 5, progress: (s) => s.perfectLessons },
  { id: 'words50', title: "So'z ustasi", desc: "50 ta so'z o'rganing", icon: '📚', goal: 50, progress: learnedWords },
  { id: 'words100', title: "Lug'at", desc: "100 ta so'z o'rganing", icon: '📖', goal: 100, progress: learnedWords },
  { id: 'unit1', title: 'Bonjour !', desc: "1-bo'limni tugating", icon: '🇫🇷', goal: 1, progress: (s) => (unitComplete(s, 0) ? 1 : 0) },
  { id: 'course', title: 'Parijga tayyor', desc: 'Butun kursni tugating', icon: '🗼', goal: ALL_LESSONS.length, progress: (s) => ALL_LESSONS.filter((l) => s.lessonsDone[l.id]).length },
  { id: 'chat10', title: 'Suhbatdosh', desc: 'Krua bilan 10 ta xabar almashing', icon: '🗨️', goal: 10, progress: (s) => s.chatMessages },
  { id: 'chat100', title: 'Gapdon', desc: 'Krua bilan 100 ta xabar', icon: '🎙️', goal: 100, progress: (s) => s.chatMessages },
  { id: 'practice10', title: 'Takror — ilm onasi', desc: '10 marta mashq qiling', icon: '🏋️', goal: 10, progress: (s) => s.practiceDone },
];

export function unitComplete(s: GameState, unitIndex: number): boolean {
  return COURSE[unitIndex].lessons.every((l) => s.lessonsDone[l.id]);
}

export function evaluateAchievements(s: GameState, _now: number): string[] {
  return ACHIEVEMENTS.filter((a) => !s.achievements[a.id] && a.progress(s) >= a.goal).map((a) => a.id);
}

// ---------- Yo'l (path) ----------

export type PathNode =
  | { type: 'lesson'; id: string; unitIndex: number; lessonIndex: number; title: string }
  | { type: 'chest'; id: string; unitIndex: number }
  | { type: 'review'; id: string; unitIndex: number };

export function buildPath(unitIndex: number): PathNode[] {
  const u = COURSE[unitIndex];
  const nodes: PathNode[] = [];
  u.lessons.forEach((l, i) => {
    nodes.push({ type: 'lesson', id: l.id, unitIndex, lessonIndex: i, title: l.title });
    if (i === 1) nodes.push({ type: 'chest', id: `${u.id}-chest`, unitIndex });
  });
  nodes.push({ type: 'review', id: `${u.id}-review`, unitIndex });
  return nodes;
}

export function isLessonUnlocked(s: GameState, lessonId: string): boolean {
  const idx = ALL_LESSONS.findIndex((l) => l.id === lessonId);
  if (idx <= 0) return true;
  return !!s.lessonsDone[ALL_LESSONS[idx - 1].id];
}

export function nodeState(s: GameState, node: PathNode): 'locked' | 'active' | 'done' {
  const u = COURSE[node.unitIndex];
  if (node.type === 'lesson') {
    if (s.lessonsDone[node.id]) return 'done';
    return isLessonUnlocked(s, node.id) ? 'active' : 'locked';
  }
  if (node.type === 'chest') {
    if (s.chests.includes(node.id)) return 'done';
    return s.lessonsDone[u.lessons[1].id] ? 'active' : 'locked';
  }
  if (s.lessonsDone[node.id]) return 'done';
  return unitComplete(s, node.unitIndex) ? 'active' : 'locked';
}

export function chestReward(id: string): number {
  return 20 + (hashString(id) % 4) * 10;
}

export function openChest(s: GameState, id: string): { state: GameState; gems: number } {
  if (s.chests.includes(id)) return { state: s, gems: 0 };
  const gems = chestReward(id);
  return { state: { ...s, chests: [...s.chests, id], gems: s.gems + gems }, gems };
}

export function currentUnitIndex(s: GameState): number {
  for (let i = 0; i < COURSE.length; i++) {
    if (!COURSE[i].lessons.every((l) => s.lessonsDone[l.id]) || !s.lessonsDone[`${COURSE[i].id}-review`]) return i;
  }
  return COURSE.length - 1;
}

// ---------- Do'kon ----------

export function buyHeartRefill(s: GameState, now = Date.now()): GameState | null {
  if (s.gems < HEART_REFILL_COST || s.hearts >= MAX_HEARTS) return null;
  return { ...s, gems: s.gems - HEART_REFILL_COST, hearts: MAX_HEARTS, heartsUpdatedAt: now };
}

export function buyFreeze(s: GameState): GameState | null {
  if (s.gems < FREEZE_COST || s.streakFreezes >= MAX_FREEZES) return null;
  return { ...s, gems: s.gems - FREEZE_COST, streakFreezes: s.streakFreezes + 1 };
}

/** Ilova ochilganda / har daqiqada chaqiriladi. */
export function tick(s: GameState, now = new Date()): GameState {
  return rolloverLeague(reconcileStreak(regenHearts(s, now.getTime()), now), now);
}

// ---------- Kunlik vazifalar ----------

export interface DailyCounters {
  day: string;
  xp: number;
  lessons: number;
  perfect: number;
  practice: number;
  chat: number;
  combo: number;
  claimed: string[];
}

export function emptyDaily(day: string): DailyCounters {
  return { day, xp: 0, lessons: 0, perfect: 0, practice: 0, chat: 0, combo: 0, claimed: [] };
}

export interface Quest {
  id: string;
  title: string;
  icon: string;
  goal: number;
  reward: number;
  value: (d: DailyCounters) => number;
}

interface QuestDef {
  id: string;
  title: string;
  icon: string;
  value: (d: DailyCounters) => number;
  goals: number[];
}

const QUEST_POOL: QuestDef[] = [
  { id: 'xp', title: "{n} ball to'plang", icon: '⭐', value: (d) => d.xp, goals: [20, 30, 40] },
  { id: 'lessons', title: '{n} ta dars tugating', icon: '🚇', value: (d) => d.lessons, goals: [1, 2, 3] },
  { id: 'perfect', title: "{n} ta darsni xatosiz o'ting", icon: '💯', value: (d) => d.perfect, goals: [1, 2] },
  { id: 'chat', title: 'Krua bilan {n} ta xabar almashing', icon: '💬', value: (d) => d.chat, goals: [3, 5] },
  { id: 'combo', title: "Ketma-ket {n} ta to'g'ri javob", icon: '⚡', value: (d) => d.combo, goals: [8, 12] },
  { id: 'practice', title: '{n} marta mashq qiling', icon: '🏋️', value: (d) => d.practice, goals: [1, 2] },
];

/** Bugungi 3 ta vazifa (sana bo'yicha bir xil tanlanadi; birinchisi doim ball). */
export function dailyQuests(day: string, dailyGoal = 20): Quest[] {
  const r = rng(hashString(`quests:${day}`));
  const [xpQ, ...others] = QUEST_POOL;
  // Fisher–Yates (seed bilan) — sort(() => random) noto'g'ri taqsimot beradi.
  const pool = others.slice();
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const rest = pool.slice(0, 2);
  return [xpQ, ...rest].map((q, i) => {
    const goal = q.id === 'xp' ? Math.max(dailyGoal, q.goals[0]) : q.goals[Math.floor(r() * q.goals.length)];
    return { id: q.id, icon: q.icon, value: q.value, goal, title: q.title.replace('{n}', String(goal)), reward: 10 + i * 5 };
  });
}

export const QUESTS_BONUS = 30;

function bumpDaily(s: GameState, now: Date, add: Partial<Omit<DailyCounters, 'day' | 'claimed'>>): GameState {
  const day = dayKey(now);
  const d = s.daily && s.daily.day === day ? s.daily : emptyDaily(day);
  return {
    ...s,
    daily: {
      ...d,
      xp: d.xp + (add.xp ?? 0),
      lessons: d.lessons + (add.lessons ?? 0),
      perfect: d.perfect + (add.perfect ?? 0),
      practice: d.practice + (add.practice ?? 0),
      chat: d.chat + (add.chat ?? 0),
      combo: Math.max(d.combo, add.combo ?? 0),
    },
  };
}

export function todayDaily(s: GameState, now = new Date()): DailyCounters {
  const day = dayKey(now);
  return s.daily && s.daily.day === day ? s.daily : emptyDaily(day);
}

/** Bajarilgan vazifa sovg'asini olish (yoki uchalasi uchun bonus: id = 'all'). */
export function claimQuest(s: GameState, id: string, now = new Date()): { state: GameState; gems: number } {
  const d = todayDaily(s, now);
  if (d.claimed.includes(id)) return { state: s, gems: 0 };
  const quests = dailyQuests(d.day, s.dailyGoal);
  let gems = 0;
  if (id === 'all') {
    if (!quests.every((q) => d.claimed.includes(q.id))) return { state: s, gems: 0 };
    gems = QUESTS_BONUS;
  } else {
    const q = quests.find((x) => x.id === id);
    if (!q || q.value(d) < q.goal) return { state: s, gems: 0 };
    gems = q.reward;
  }
  return { state: { ...s, gems: s.gems + gems, daily: { ...d, claimed: [...d.claimed, id] } }, gems };
}

// ---------- Ikki barobar ball va seriyani tiklash ----------

export const XP_BOOST_COST = 100;
export const XP_BOOST_MINUTES = 15;
export const STREAK_REPAIR_COST = 400;

export function buyXpBoost(s: GameState, now = Date.now()): GameState | null {
  if (s.gems < XP_BOOST_COST) return null;
  const from = Math.max(now, s.xpBoostUntil);
  return { ...s, gems: s.gems - XP_BOOST_COST, xpBoostUntil: from + XP_BOOST_MINUTES * 60_000 };
}

/** Uzilgan seriyani tiklash mumkinmi (uzilgan kundan 2 kun ichida). */
export function canRepairStreak(s: GameState, now = new Date()): boolean {
  return !!s.lostStreak && daysBetween(s.lostStreak.day, dayKey(now)) <= 2;
}

export function repairStreak(s: GameState, free: boolean, now = new Date()): GameState | null {
  if (!canRepairStreak(s, now) || (!free && s.gems < STREAK_REPAIR_COST)) return null;
  const value = s.lostStreak!.value + s.streak;
  return {
    ...s,
    gems: free ? s.gems : s.gems - STREAK_REPAIR_COST,
    streak: value,
    longestStreak: Math.max(s.longestStreak, value),
    lastActiveDay: s.lastActiveDay === dayKey(now) ? s.lastActiveDay : addDays(dayKey(now), -1),
    lostStreak: null,
  };
}

/** Super obunachilariga har oy bitta bepul seriya soyaboni (maksimal soni oshmaydi). */
export function grantSuperFreeze(s: GameState, now = new Date()): GameState {
  const month = dayKey(now).slice(0, 7);
  if (s.superFreezeMonth === month) return s;
  return { ...s, superFreezeMonth: month, streakFreezes: Math.min(MAX_FREEZES, s.streakFreezes + 1) };
}
