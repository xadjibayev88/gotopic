import type { IncomingMessage, ServerResponse } from 'node:http';

export interface ClientLogHandlerDependencies {
  readonly isRateLimited: (req: IncomingMessage) => boolean;
  readonly readBody: (req: IncomingMessage, maxBytes: number) => Promise<unknown>;
  readonly respond: (res: ServerResponse, status: number, body: unknown) => void;
}

export type RouteHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void> | void;
export type RouteTable = Record<string, RouteHandler>;

/** Consume untrusted free-form telemetry without retaining or logging its contents. */
export function createClientLogHandler(deps: ClientLogHandlerDependencies) {
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (deps.isRateLimited(req)) return deps.respond(res, 429, { ok: false });
    try {
      await deps.readBody(req, 4096);
    } catch {
      // Telemetry is best-effort; neither body nor parser error is exposed or logged.
    }
    deps.respond(res, 200, { ok: true });
  };
}

/** Register the telemetry discard route into the same route table used by the server and tests. */
export function registerClientLogRoute<T extends RouteTable>(
  routes: T,
  deps: ClientLogHandlerDependencies,
): T & { 'POST /api/client-log': ReturnType<typeof createClientLogHandler> } {
  return {
    ...routes,
    'POST /api/client-log': createClientLogHandler(deps),
  };
}
