// src/infrastructure/db/PostgresTransactionManager.ts
import type { PrismaClient } from '../../../prisma/generated/client';
import { PrismaTx } from './prisma';
import type {
  TransactionManager,
  TransactionalContext,
} from '../../application/tx/TransactionManager';

import { PostgresDocsRepository } from '../persistence/db/PostgresDocsRepository';
import { PostgresSpacecraftConfigRepository } from '../persistence/db/PostgresSpacecraftConfigRepository';
import { PostgresTelemetryRepository } from '../persistence/db/PostgresTelemetryRepository';
import { PostgresAnomalyRepository } from '../persistence/db/PostgresAnomalyRepository';
import { PostgresEventRepository } from '../persistence/db/PostgresEventRepository';
import { PostgresOutboxRepository } from '../persistence/db/PostgresOutboxRepository';

class PostgresTransactionalContext implements TransactionalContext {
  docs: PostgresDocsRepository;
  spacecraftConfigs: PostgresSpacecraftConfigRepository;
  telemetry: PostgresTelemetryRepository;
  anomalies: PostgresAnomalyRepository;
  events: PostgresEventRepository;
  outbox: PostgresOutboxRepository;

  constructor(prisma: PrismaTx) {
    this.docs = new PostgresDocsRepository(prisma);
    this.spacecraftConfigs = new PostgresSpacecraftConfigRepository(prisma);
    this.telemetry = new PostgresTelemetryRepository(prisma);
    this.anomalies = new PostgresAnomalyRepository(prisma);
    this.events = new PostgresEventRepository(prisma);
    this.outbox = new PostgresOutboxRepository(prisma);
  }
}

export class PostgresTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaClient) {}

  async withTransaction<T>(fn: (ctx: TransactionalContext) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(async (tx) => {
      const ctx = new PostgresTransactionalContext(tx);
      return fn(ctx);
    });
  }
}
