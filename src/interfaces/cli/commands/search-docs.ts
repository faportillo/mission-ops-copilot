import { Command } from 'commander';
import type { AppContext } from '../../../index.js';

export function searchDocsCommand(ctx: AppContext) {
  const cmd = new Command('search-docs')
    .requiredOption('--query <q>', 'Search query')
    .option('--limit <n>', 'Limit', '10')
    .description('Search operations documents by keyword')
    .action(async (opts: { query: string; limit: string }) => {
      const limit = parseInt(opts.limit, 10);
      const results = await ctx.searchDocsUseCase.execute(opts.query, limit);
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(results, null, 2));
    });
  return cmd;
}


