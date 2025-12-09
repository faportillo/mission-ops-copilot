import pino from 'pino';
import { loadConfig } from '../config/index.js';

export type Logger = {
  debug: (msg: string, context?: Record<string, unknown>) => void;
  info: (msg: string, context?: Record<string, unknown>) => void;
  warn: (msg: string, context?: Record<string, unknown>) => void;
  error: (msg: string, context?: Record<string, unknown>) => void;
  child: (bindings: Record<string, unknown>) => Logger;
};

let rootLogger: Logger | null = null;

export function getLogger(): Logger {
  if (rootLogger) return rootLogger;
  const cfg = loadConfig();
  const base = pino({
    level: cfg.LOG_LEVEL,
    transport:
      cfg.NODE_ENV === 'development'
        ? { target: 'pino-pretty', options: { translateTime: 'SYS:standard' } }
        : undefined
  });
  const wrap = (l: pino.Logger): Logger => ({
    debug: (msg, context) => l.debug(context ?? {}, msg),
    info: (msg, context) => l.info(context ?? {}, msg),
    warn: (msg, context) => l.warn(context ?? {}, msg),
    error: (msg, context) => l.error(context ?? {}, msg),
    child: (bindings) => wrap(l.child(bindings))
  });
  rootLogger = wrap(base);
  return rootLogger;
}


