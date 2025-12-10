import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../../../index.js';

export async function spacecraftRoutes(app: FastifyInstance, ctx: AppContext) {
  const { spacecraftConfigService } = ctx;

  app.get('/spacecraft/:id/config', async (request, reply) => {
    const { id: spacecraftId } = request.params as { id: string };

    const cfg = await spacecraftConfigService.getConfig(spacecraftId);
    if (!cfg) {
      return reply.code(404).send({ error: { message: 'Config not found' } });
    }

    return {
      spacecraftId,
      config: cfg.config,
      status: cfg.status,
      source: cfg.source,
    };
  });

  app.put('/spacecraft/:id/config', async (request, reply) => {
    const { id: spacecraftId } = request.params as { id: string };
    const body = request.body;

    try {
      const updated = await spacecraftConfigService.updateConfig(spacecraftId, body, {
        status: 'approved',
        source: 'manual',
      });

      return {
        spacecraftId,
        config: updated.config,
        status: updated.status,
        source: updated.source,
      };
    } catch (err) {
      request.log.error({ err }, 'Failed to update spacecraft config');
      return reply.code(400).send({ error: { message: 'Invalid config payload' } });
    }
  });
}
