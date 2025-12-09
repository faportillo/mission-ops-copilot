import type { FastifyInstance } from 'fastify';
import { PostDocBody, SearchDocsQuery } from '../http-types.js';
import type { AppContext } from '../../../index.js';

export async function docsRoutes(app: FastifyInstance, ctx: AppContext) {
  app.withTypeProvider().post(
    '/docs',
    {
      schema: { body: PostDocBody }
    },
    async (req, reply) => {
      const body = PostDocBody.parse(req.body);
      const id = body.id ?? `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      await ctx.docsService.save({ id, title: body.title, content: body.content, tags: body.tags });
      return reply.code(201).send({ id });
    }
  );

  app.withTypeProvider().get(
    '/docs/search',
    {
      schema: { querystring: SearchDocsQuery }
    },
    async (req) => {
      const query = SearchDocsQuery.parse(req.query);
      const results = await ctx.searchDocsUseCase.execute(query.q, query.limit);
      return results;
    }
  );
}


