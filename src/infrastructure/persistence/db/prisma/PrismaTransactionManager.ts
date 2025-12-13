import type { TransactionManager } from '../../TransactionManager.js';
import type { TransactionalContext } from '../../TransactionManager.js';
import { PrismaDocsRepository } from './PrismaDocsRepository.js';
import { PrismaOutboxRepository } from './PrismaOutboxRepository.js';
import { PrismaClient } from '../../../../../prisma/generated/client/index.js';

export class PrismaTransactionManager implements TransactionManager {
  constructor(private readonly prisma: PrismaClient) {}

  withTransaction<T>(fn: (ctx: TransactionalContext) => Promise<T>) {
    return this.prisma.$transaction(async (tx) => {
      const ctx: TransactionalContext = {
        docs: new PrismaDocsRepository(tx),
        outbox: new PrismaOutboxRepository(tx),
      };
      return fn(ctx);
    });
  }
}
