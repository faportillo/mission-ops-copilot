import type { FastifyInstance } from 'fastify';
import type { AppContext } from '../../../index.js';
import { PostTelemetryBody, GetTelemetryQuery, AnalyzeTelemetryQuery } from '../http-types.js';
import { TelemetrySnapshot } from '../../../domain/telemetry/TelemetrySnapshot.js';
import { v4 as uuidv4 } from 'uuid';

export async function telemetryRoutes(app: FastifyInstance, ctx: AppContext) {
  app.withTypeProvider().post(
    '/telemetry',
    {
      schema: {
        body: PostTelemetryBody,
      },
    },
    async (req, reply) => {
      const body = PostTelemetryBody.parse(req.body);
      const id = body.id ?? uuidv4();
      const snapshot = TelemetrySnapshot.create({
        id,
        spacecraftId: body.spacecraftId,
        timestamp: body.timestamp,
        parameters: body.parameters,
      });
      await ctx.telemetryService.saveSnapshot(snapshot);
      return reply.code(201).send({ id: snapshot.id });
    },
  );

  app.withTypeProvider().get(
    '/telemetry',
    {
      schema: { querystring: GetTelemetryQuery },
    },
    async (req) => {
      const query = GetTelemetryQuery.parse(req.query);
      const list = await ctx.listTelemetryUseCase.execute(query.spacecraftId, query.limit);
      return list;
    },
  );

  app.withTypeProvider().get(
    '/telemetry/analyze',
    {
      schema: { querystring: AnalyzeTelemetryQuery },
    },
    async (req) => {
      const query = AnalyzeTelemetryQuery.parse(req.query);
      const anomalies = await ctx.analyzeTelemetryUseCase.execute({
        spacecraftId: query.spacecraftId,
        limit: query.limit,
      });
      return anomalies;
    },
  );
}
