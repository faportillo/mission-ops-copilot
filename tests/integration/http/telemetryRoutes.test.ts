import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';

describe('HTTP telemetry routes', () => {
  it('creates and lists telemetry', async () => {
    const app = Fastify().withTypeProvider();
    const ctx = createAppContext();
    await registerHttpRoutes(app, ctx);

    const resCreate = await app.inject({
      method: 'POST',
      url: '/telemetry',
      payload: {
        spacecraftId: 'SC-1',
        timestamp: new Date().toISOString(),
        parameters: { temp: 42 }
      }
    });
    expect(resCreate.statusCode).toBe(201);
    const created = resCreate.json() as { id: string };
    expect(created.id).toBeDefined();

    const resList = await app.inject({
      method: 'GET',
      url: '/telemetry?spacecraftId=SC-1&limit=10'
    });
    expect(resList.statusCode).toBe(200);
    const list = resList.json() as any[];
    expect(list.length).toBeGreaterThan(0);
  });
});


