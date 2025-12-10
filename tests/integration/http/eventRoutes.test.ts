import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import type { MissionEvent } from '../../../src/domain/events/MissionEvent.js';
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
describe('HTTP event routes', () => {
  it('lists events (empty initially)', async () => {
    const app = Fastify().withTypeProvider();
    const ctx = createAppContext(cfg);
    await registerHttpRoutes(app, ctx);

    const res = await app.inject({
      method: 'GET',
      url: '/events?spacecraftId=SC-1&limit=5',
    });
    expect(res.statusCode).toBe(200);
    const list = res.json() as MissionEvent[];
    expect(Array.isArray(list)).toBe(true);
  });
});
