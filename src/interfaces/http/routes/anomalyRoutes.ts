import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../../../index.js';
import { z } from 'zod';

const GetAnomaliesQuery = z.object({
  spacecraftId: z.string().min(1),
  limit: z.coerce.number().int().positive().max(200).default(20),
});

const GetAnomaliesTimelineQuery = z.object({
  spacecraftId: z.string().min(1),
  from: z.coerce.date(),
  to: z.coerce.date(),
});

export async function anomalyRoutes(app: FastifyInstance, ctx: AppContext) {
  app.get('/anomalies', async (req) => {
    const q = GetAnomaliesQuery.parse(req.query);
    const list = await ctx.anomalyRepository.findRecent(q.spacecraftId, q.limit);
    return list;
  });

  app.get('/anomalies/timeline', async (req) => {
    const q = GetAnomaliesTimelineQuery.parse(req.query);
    const list = await ctx.anomalyRepository.findInRange(q.spacecraftId, q.from, q.to);
    return list;
  });
}
