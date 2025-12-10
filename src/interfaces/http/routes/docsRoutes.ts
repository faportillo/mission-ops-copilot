import type { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { PostDocBody, SearchDocsQuery } from '../http-types.js';
import type { AppContext } from '../../../index.js';

export async function docsRoutes(app: FastifyInstance, ctx: AppContext) {
  app.withTypeProvider().post('/docs', {}, async (req, reply) => {
    const body = PostDocBody.parse(req.body);
    const id = body.id ?? uuidv4();
    ctx.logger.info('POST /docs received', { id, title: body.title });
    await ctx.docsService.save({ id, title: body.title, content: body.content, tags: body.tags });
    ctx.logger.info('POST /docs saved', { id });
    return reply.code(201).send({ id });
  });

  app.withTypeProvider().get('/docs/search', {}, async (req) => {
    const query = SearchDocsQuery.parse(req.query);
    const results = await ctx.searchDocsUseCase.execute(query.q, query.limit);
    ctx.logger.debug('GET /docs/search', { q: query.q, count: results.length });
    return results;
  });
}
