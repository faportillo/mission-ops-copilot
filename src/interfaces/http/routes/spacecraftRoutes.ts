import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../../../index.js';

export async function spacecraftRoutes(app: FastifyInstance, ctx: AppContext) {
  const { spacecraftConfigService, listSpacecraftConfigUseCase, countSpacecraftConfigsUseCase } =
    ctx;

  app.withTypeProvider().get('/spacecraft', {}, async (req) => {
    // Parse pagination parameters (limit, offset) from query string
    const { limit = 20, offset = 0 } = req.query as { limit?: number; offset?: number };
    // Ensure numeric and positive values with sensible bounds
    const safeLimit = Math.max(1, Math.min(Number(limit) || 20, 100));
    const safeOffset = Math.max(0, Number(offset) || 0);

    // Fetch total count and corresponding page of configs
    const [items, total] = await Promise.all([
      listSpacecraftConfigUseCase.execute({ limit: safeLimit, offset: safeOffset }),
      countSpacecraftConfigsUseCase.execute(),
    ]);
    return {
      total,
      count: items.length,
      limit: safeLimit,
      offset: safeOffset,
      items,
    };
  });

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
