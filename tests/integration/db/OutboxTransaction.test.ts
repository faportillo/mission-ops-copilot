import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execa } from 'execa';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import type { AppConfig } from '../../../src/config/schema.js';
import { createAppContext } from '../../../src/index.js';
import { getPrisma } from '../../../src/infrastructure/db/prisma.js';
import { OpsDocument } from '../../../src/domain/docs/OpsDocument.js';
import { PostgresTransactionManager } from '../../../src/infrastructure/db/PostgresTransactionManager.js';

let container: StartedPostgreSqlContainer;

describe('Docs + Outbox transactional persistence (Postgres)', () => {
  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    const url = container.getConnectionUri();
    process.env.DATABASE_URL = url;
    await execa('npx', ['prisma', 'generate'], {
      cwd: process.cwd(),
      env: { ...process.env },
    });
    await execa('npx', ['prisma', 'migrate', 'deploy', '--schema=prisma/schema.prisma'], {
      cwd: process.cwd(),
      env: { ...process.env, DATABASE_URL: url },
    });
  }, 120_000);

  afterAll(async () => {
    await container.stop();
  }, 120_000);

  it('persists doc and outbox together, and rolls back on error', async () => {
    const url = container.getConnectionUri();
    const cfg: AppConfig = {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      PORT: 0,
      DATA_BACKEND: 'postgres',
      DATA_DIR: undefined,
      DATABASE_URL: url,
    };
    // ensure prisma initialized
    const prisma = getPrisma();
    const txManager = new PostgresTransactionManager(prisma);

    const id1 = `doc_${Date.now()}`;
    // Commit path
    await txManager.withTransaction(async (ctx) => {
      const doc = OpsDocument.publish({
        id: id1,
        title: 'TX Doc',
        content: 'Testing atomicity',
        tags: ['tx'],
      });
      await ctx.docs.save(doc);
      const [evt] = doc.pullDomainEvents();
      await ctx.outbox.enqueue({
        type: evt.eventType,
        topic: 'domain.OpsDocumentPublished',
        key: id1,
        payload: evt,
      });
      return true;
    });

    const savedDoc = await prisma.opsDocument.findUnique({ where: { id: id1 } });
    expect(savedDoc).toBeTruthy();
    const outboxRows1 = await prisma.outboxEvent.findMany({ where: { key: id1 } as any });
    expect(outboxRows1.length).toBe(1);

    // Rollback path
    const id2 = `doc_${Date.now()}_rb`;
    await expect(
      txManager.withTransaction(async (ctx) => {
        const doc = OpsDocument.publish({
          id: id2,
          title: 'TX Doc 2',
          content: 'Should rollback',
          tags: [],
        });
        await ctx.docs.save(doc);
        const [evt] = doc.pullDomainEvents();
        await ctx.outbox.enqueue({
          type: evt.eventType,
          topic: 'domain.OpsDocumentPublished',
          key: id2,
          payload: evt,
        });
        throw new Error('force rollback');
      }),
    ).rejects.toThrow();

    const rolledDoc = await prisma.opsDocument.findUnique({ where: { id: id2 } });
    expect(rolledDoc).toBeNull();
    const outboxRows2 = await prisma.outboxEvent.findMany({ where: { key: id2 } as any });
    expect(outboxRows2.length).toBe(0);
  }, 120_000);
});
