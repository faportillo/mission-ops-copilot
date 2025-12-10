import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import { AppConfig } from '../../../src/config/schema.js';

const cfg: AppConfig = {
  NODE_ENV: 'test',
  LOG_LEVEL: 'debug',
  PORT: 0,
  DATA_BACKEND: 'in-memory',
  DATA_DIR: undefined,
  DATABASE_URL: undefined,
};

describe('HTTP telemetry routes', () => {
  it('creates and lists telemetry', async () => {
    const app = Fastify().withTypeProvider();
    const ctx = createAppContext(cfg);
    await registerHttpRoutes(app, ctx);

    const resCreate = await app.inject({
      method: 'POST',
      url: '/telemetry',
      payload: {
        spacecraftId: 'SC-1',
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
      url: '/telemetry?spacecraftId=SC-1&limit=10',
    });
    expect(resList.statusCode).toBe(200);
    const list = resList.json() as any[];
    expect(list.length).toBeGreaterThan(0);
  });

  it('accepts batch telemetry and returns count', async () => {
    const app = Fastify().withTypeProvider();
    const ctx = createAppContext(cfg);
    await registerHttpRoutes(app, ctx);

    const now = Date.now();
    const resBatch = await app.inject({
      method: 'POST',
      url: '/telemetry/batch',
      payload: {
        spacecraftId: 'SC-BATCH',
        snapshots: [
          {
            spacecraftId: 'SC-BATCH',
            timestamp: new Date(now - 1000).toISOString(),
            parameters: { temp: 20 },
          },
          {
            spacecraftId: 'SC-BATCH',
            timestamp: new Date(now).toISOString(),
            parameters: { temp: 21 },
          },
        ],
      },
    });
    if (resBatch.statusCode !== 201) {
      // eslint-disable-next-line no-console
      console.error('BATCH body:', resBatch.body);
    }
    expect(resBatch.statusCode).toBe(201);
    const body = resBatch.json() as { count: number };
    expect(body.count).toBe(2);

    const resList = await app.inject({
      method: 'GET',
      url: '/telemetry?spacecraftId=SC-BATCH&limit=10',
    });
    expect(resList.statusCode).toBe(200);
    const list = resList.json() as any[];
    expect(list.length).toBeGreaterThanOrEqual(2);
  });
});
