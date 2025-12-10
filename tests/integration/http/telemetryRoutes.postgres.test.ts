import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { execa } from 'execa';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import type { AppConfig } from '../../../src/config/schema.js';

let container: StartedPostgreSqlContainer;

describe('HTTP telemetry routes with Postgres (Testcontainers)', () => {
  beforeAll(async () => {
    container = await new PostgreSqlContainer().start();
    const url = container.getConnectionUri();
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

  it('POST /telemetry then GET /telemetry returns the created snapshot', async () => {
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

    const resCreate = await app.inject({
      method: 'POST',
      url: '/telemetry',
      payload: {
        spacecraftId: 'SC-IT',
        timestamp: new Date().toISOString(),
        parameters: { temp: 42 },
      },
    });
    if (resCreate.statusCode !== 201) {
      // eslint-disable-next-line no-console
      console.error('POST body:', resCreate.body);
    }
    expect(resCreate.statusCode).toBe(201);
    const created = resCreate.json() as { id: string };
    expect(created.id).toBeDefined();

    const resList = await app.inject({
      method: 'GET',
      url: '/telemetry?spacecraftId=SC-IT&limit=5',
    });
    expect(resList.statusCode).toBe(200);
    const list = resList.json() as Array<{ id: string }>;
    expect(list.length).toBeGreaterThan(0);
    const found = list.find((s) => s.id === created.id);
    expect(found).toBeDefined();

    await app.close();
  }, 120_000);

  it('POST /telemetry/batch returns count and data is queryable', async () => {
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

    const now = Date.now();
    const resBatch = await app.inject({
      method: 'POST',
      url: '/telemetry/batch',
      payload: {
        spacecraftId: 'SC-IT-BATCH',
        snapshots: [
          {
            spacecraftId: 'SC-IT-BATCH',
            timestamp: new Date(now - 2000).toISOString(),
            parameters: { temp: 50 },
          },
          {
            spacecraftId: 'SC-IT-BATCH',
            timestamp: new Date(now - 1000).toISOString(),
            parameters: { temp: 51 },
          },
        ],
      },
    });
    expect(resBatch.statusCode).toBe(201);
    const json = resBatch.json() as { count: number };
    expect(json.count).toBe(2);

    const resList = await app.inject({
      method: 'GET',
      url: '/telemetry?spacecraftId=SC-IT-BATCH&limit=5',
    });
    expect(resList.statusCode).toBe(200);
    const list = resList.json() as Array<{ id: string }>;
    expect(list.length).toBeGreaterThanOrEqual(2);

    await app.close();
  }, 120_000);
});
