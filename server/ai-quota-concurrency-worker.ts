import { createRequire } from 'node:module';
import { parentPort, workerData } from 'node:worker_threads';
import type { DatabaseSync as DatabaseSyncType } from 'node:sqlite';
import type { AiQuotaReservation, AiUsage } from './ai-quota.ts';

interface WorkerInput {
  action?: 'reserve' | 'settle' | 'abort';
  dbPath: string;
  subject: { kind: 'account'; userId: string };
  requestId: string;
  usage: AiUsage;
  reservation?: AiQuotaReservation;
  actualUsage?: AiUsage;
  limits: {
    subject: { requests: number; tokens: number; sttAudioSeconds: number; ttsCharacters: number; ttsAudioSeconds: number };
    global: { requests: number; tokens: number; sttAudioSeconds: number; ttsCharacters: number; ttsAudioSeconds: number };
  };
  barrier: SharedArrayBuffer;
  parties: number;
  now: number;
}

const input = workerData as WorkerInput;
process.env.SALUT_DB = input.dbPath;
const { DatabaseSync } = createRequire(import.meta.url)('node:sqlite') as typeof import('node:sqlite');
const connection = new DatabaseSync(input.dbPath);
connection.exec('PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 10000;');
const { createAiQuotaStore } = await import('./ai-quota.ts');
const quota = createAiQuotaStore({
  database: () => connection as DatabaseSyncType,
  limits: input.limits,
  sharedStorageVerified: () => true,
  envKillSwitchActive: () => false,
  now: () => input.now,
});

const barrier = new Int32Array(input.barrier);
const arrived = Atomics.add(barrier, 0, 1) + 1;
if (arrived === input.parties) {
  Atomics.notify(barrier, 0, input.parties - 1);
} else {
  let observed = Atomics.load(barrier, 0);
  while (observed < input.parties) {
    Atomics.wait(barrier, 0, observed, 10000);
    observed = Atomics.load(barrier, 0);
  }
}

try {
  let result;
  if (input.action === 'settle') {
    if (!input.reservation || !input.actualUsage) throw new Error('settlement worker requires reservation and actual usage');
    result = quota.settleAiUsage(input.reservation, input.actualUsage);
  } else if (input.action === 'abort') {
    if (!input.reservation) throw new Error('abort worker requires a reservation');
    result = quota.abortAiUsage(input.reservation);
  } else {
    result = quota.reserveAiUsage(input.subject, input.usage, input.requestId);
  }
  parentPort?.postMessage(result);
} finally {
  connection.close();
}
