import { describe, it, expect } from 'vitest';
import Fastify from 'fastify';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import type { MissionEvent } from '../../../src/domain/events/MissionEvent.js';

describe('HTTP event routes', () => {
  it('lists events (empty initially)', async () => {
    const app = Fastify().withTypeProvider();
    const ctx = createAppContext();
    await registerHttpRoutes(app, ctx);

    const res = await app.inject({
      method: 'GET',
      url: '/events?spacecraftId=SC-1&limit=5'
    });
    expect(res.statusCode).toBe(200);
    const list = res.json() as MissionEvent[];
    expect(Array.isArray(list)).toBe(true);
  });
});


