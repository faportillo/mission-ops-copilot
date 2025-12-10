import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ZodTypeProvider, validatorCompiler, serializerCompiler } from 'fastify-type-provider-zod';
import type { AppContext } from '../../index.js';
import { telemetryRoutes } from './routes/telemetryRoutes.js';
import { eventRoutes } from './routes/eventRoutes.js';
import { docsRoutes } from './routes/docsRoutes.js';
import { spacecraftRoutes } from './routes/spacecraftRoutes.js';
import { anomalyRoutes } from './routes/anomalyRoutes.js';
import { DomainError } from '../../domain/common/DomainError.js';

export async function registerHttpRoutes(app: FastifyInstance, ctx: AppContext) {
  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);
  app.withTypeProvider<ZodTypeProvider>();

  app.setErrorHandler(async (error, req: FastifyRequest, reply: FastifyReply) => {
    if (error instanceof DomainError) {
      return reply.status(400).send({ error: error.name, message: error.message });
    }
    const payload =
      process.env.NODE_ENV === 'test'
        ? {
            error: 'InternalServerError',
            message: String(error?.message ?? error),
            stack: (error as any)?.stack,
          }
        : { error: 'InternalServerError' };
    req.log.error({ err: error }, 'Unhandled error');
    return reply.status(500).send(payload);
  });

  await telemetryRoutes(app, ctx);
  await eventRoutes(app, ctx);
  await docsRoutes(app, ctx);
  await spacecraftRoutes(app, ctx);
  await anomalyRoutes(app, ctx);
}
