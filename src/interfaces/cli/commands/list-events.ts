import { Command } from 'commander';
import type { AppContext } from '../../../index.js';

export function listEventsCommand(ctx: AppContext) {
  const cmd = new Command('list-events')
    .requiredOption('--spacecraft-id <id>', 'Spacecraft ID')
    .option('--limit <n>', 'Limit', '20')
    .description('List recent mission events')
    .action(async (opts: { spacecraftId: string; limit: string }) => {
      const limit = parseInt(opts.limit, 10);
      const events = await ctx.listEventsUseCase.execute(opts.spacecraftId, limit);
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(events, null, 2));
    });
  return cmd;
}


