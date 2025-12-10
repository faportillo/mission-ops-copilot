import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { execa } from 'execa';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import type { AppConfig } from '../../../src/config/schema.js';
import type { MissionEvent } from '../../../src/domain/events/MissionEvent.js';

let container: StartedPostgreSqlContainer;

describe('HTTP event routes with Postgres (Testcontainers)', () => {
  beforeAll(async () => {
    container = await new PostgreSqlContainer('postgres:16-alpine')
      .withDatabase('mission_ops')
      .withUsername('mission_migrator')
      .withPassword('mission_migrator')
      .start();
    const base = container.getConnectionUri(); // postgresql://user:pass@host:port/mission_ops
    const url = `${base}?schema=app`;
    process.env.DATABASE_URL = url;
    // Ensure Prisma client is generated and DB schema applied
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

  it('saves an event to Postgres and lists it through GET /events', async () => {
    const base = container.getConnectionUri();
    const url = `${base}?schema=app`;
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

    // Seed an event directly via repository/service
    const ev: MissionEvent = {
      id: `ev_${Date.now()}`,
      spacecraftId: 'SC-IT',
      timestamp: new Date(),
      type: 'INFO',
      severity: 'LOW',
      message: 'Postgres-backed event seeded for test',
    };
    await ctx.eventRepository.save(ev);

    const res = await app.inject({
      method: 'GET',
      url: '/events?spacecraftId=SC-IT&limit=5',
    });
    expect(res.statusCode).toBe(200);
    const list = res.json() as MissionEvent[];
    expect(Array.isArray(list)).toBe(true);
    expect(list.find((e) => e.id === ev.id)).toBeDefined();

    await app.close();
  }, 120_000);
});
