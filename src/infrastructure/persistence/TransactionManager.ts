import type { DocsRepository } from './DocsRepository.js';
import type { OutboxRepository } from './OutboxRepository.js';

export interface TransactionalContext {
  docs: DocsRepository;
  outbox: OutboxRepository;
  // later: telemetry, anomalies, events, spacecraftConfigs…
}

export interface TransactionManager {
  withTransaction<T>(fn: (ctx: TransactionalContext) => Promise<T>): Promise<T>;
}
