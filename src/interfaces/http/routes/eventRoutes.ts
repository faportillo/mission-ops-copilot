import type { FastifyInstance } from 'fastify';
import { GetEventsQuery } from '../http-types.js';
import type { AppContext } from '../../../index.js';

export async function eventRoutes(app: FastifyInstance, ctx: AppContext) {
  app.withTypeProvider().get('/events', {}, async (req) => {
    const query = GetEventsQuery.parse(req.query);
    const events = await ctx.listEventsUseCase.execute(query.spacecraftId, query.limit);
    ctx.logger.debug('GET /events list', {
      spacecraftId: query.spacecraftId,
      count: events.length,
    });
    return events;
  });
}
