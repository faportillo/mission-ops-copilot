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
  OPENAI_API_KEY: undefined,
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
});
