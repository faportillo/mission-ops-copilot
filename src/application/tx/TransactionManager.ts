import type { DocsRepository } from '../../infrastructure/persistence/DocsRepository';
import type { SpacecraftConfigRepository } from '../../infrastructure/persistence/SpacecraftConfigRepository';
import type { TelemetryRepository } from '../../infrastructure/persistence/TelemetryRepository';
import type { AnomalyRepository } from '../../infrastructure/persistence/AnomalyRepository';
import type { EventRepository } from '../../infrastructure/persistence/EventRepository';
import type { OutboxRepository } from '../../infrastructure/persistence/OutboxRepository';

export interface TransactionalContext {
  docs: DocsRepository;
  spacecraftConfigs: SpacecraftConfigRepository;
  telemetry: TelemetryRepository;
  anomalies: AnomalyRepository;
  events: EventRepository;
  outbox: OutboxRepository;
}

export interface TransactionManager {
  withTransaction<T>(fn: (ctx: TransactionalContext) => Promise<T>): Promise<T>;
}
