import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import Fastify from 'fastify';
import { execa } from 'execa';
import { PostgreSqlContainer, StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { registerHttpRoutes } from '../../../src/interfaces/http/index.js';
import { createAppContext } from '../../../src/index.js';
import type { AppConfig } from '../../../src/config/schema.js';
import { getPrisma } from '../../../src/infrastructure/db/prisma.js';

let container: StartedPostgreSqlContainer;

describe('HTTP spacecraft routes with Postgres (Testcontainers)', () => {
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

  it('PUT /spacecraft/:id/config then GET returns stored config', async () => {
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

    const spacecraftId = 'SC-CFG-IT';
    // Ensure FK exists
    const prisma = getPrisma();
    await prisma.spacecraft.create({
      data: { id: spacecraftId, name: 'Test Craft' },
    });
    const payload = {
      parameters: { temp: { warnHigh: 45, critHigh: 70 } },
      notes: 'integration-test',
    };

    const resPut = await app.inject({
      method: 'PUT',
      url: `/spacecraft/${spacecraftId}/config`,
      payload,
    });
    expect(resPut.statusCode).toBe(200);
    const putBody = resPut.json() as any;
    expect(putBody.spacecraftId).toBe(spacecraftId);
    expect(putBody.status).toBe('approved');
    expect(putBody.source).toBe('manual');

    const resGet = await app.inject({
      method: 'GET',
      url: `/spacecraft/${spacecraftId}/config`,
    });
    expect(resGet.statusCode).toBe(200);
    const got = resGet.json() as any;
    expect(got.spacecraftId).toBe(spacecraftId);
    expect(got.config?.parameters?.temp?.warnHigh).toBe(45);

    await app.close();
  }, 120_000);
});
