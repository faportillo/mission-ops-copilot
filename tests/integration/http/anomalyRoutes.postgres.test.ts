import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { execa } from 'execa';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import type { AppConfig } from '../../../src/config/schema.js';
import { TelemetrySnapshot } from '../../../src/domain/telemetry/TelemetrySnapshot.js';
import { getPrisma } from '../../../src/infrastructure/db/prisma.js';

let container: StartedPostgreSqlContainer;

describe('Anomaly routes (Postgres)', () => {
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

  it('persists anomalies (deduped) and lists via endpoints', async () => {
    const url = container.getConnectionUri();
    const cfg: AppConfig = {
      NODE_ENV: 'test',
      LOG_LEVEL: 'error',
      PORT: 0,
      DATA_BACKEND: 'postgres',
      DATA_DIR: undefined,
      DATABASE_URL: url,
    };
    const ctx = createAppContext(cfg);
    const app = Fastify({ logger: false }).withTypeProvider();
    await registerHttpRoutes(app, ctx);

    const prisma = getPrisma();
    const spacecraftId = 'SC-ANOM';
    await prisma.spacecraft.create({ data: { id: spacecraftId, name: 'Anom Craft' } });
    await ctx.spacecraftConfigRepository.upsert(
      spacecraftId,
      { parameters: { temp: { warnHigh: 50, critHigh: 90 } } },
      { status: 'approved', source: 'test' },
    );

    const base = Date.now();
    const mk = (mins: number, val: number, id: string) =>
      TelemetrySnapshot.create({
        id,
        spacecraftId,
        timestamp: new Date(base + mins * 60_000),
        parameters: { temp: val },
      });
    // create two anomalous points within window and one duplicate snapshot
    await ctx.telemetryRepository.save(mk(0, 60, 'a0')); // warn
    await ctx.telemetryRepository.save(mk(10, 100, 'a10')); // crit
    await ctx.telemetryRepository.save(mk(0, 60, 'a0_dup')); // same timestamp => same anomaly key; dedup

    // Detect & persist within window
    const from = new Date(base - 1 * 60_000);
    const to = new Date(base + 20 * 60_000);
    const resDetect = await ctx.detectAndPersistAnomaliesUseCase.execute({
      spacecraftId,
      from,
      to,
    });
    expect(resDetect.detected).toBeGreaterThanOrEqual(2);
    expect(resDetect.persisted).toBeGreaterThanOrEqual(2);

    // List recent anomalies
    const resList = await app.inject({
      method: 'GET',
      url: `/anomalies?spacecraftId=${spacecraftId}&limit=10`,
    });
    expect(resList.statusCode).toBe(200);
    const list = resList.json() as Array<{ id: string }>;
    expect(list.length).toBeGreaterThanOrEqual(2);

    // Timeline query matches window
    const resTimeline = await app.inject({
      method: 'GET',
      url: `/anomalies/timeline?spacecraftId=${spacecraftId}&from=${encodeURIComponent(
        from.toISOString(),
      )}&to=${encodeURIComponent(to.toISOString())}`,
    });
    expect(resTimeline.statusCode).toBe(200);
    const timeline = resTimeline.json() as Array<{ id: string }>;
    expect(timeline.length).toBeGreaterThanOrEqual(2);

    await app.close();
  }, 120_000);
});

