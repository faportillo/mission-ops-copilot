import { Command } from 'commander';
import type { AppContext } from '../../../index.js';

export function listTelemetryCommand(ctx: AppContext) {
  const cmd = new Command('list-telemetry')
    .requiredOption('--spacecraft-id <id>', 'Spacecraft ID')
    .option('--limit <n>', 'Limit', '20')
    .description('List recent telemetry snapshots')
    .action(async (opts: { spacecraftId: string; limit: string }) => {
      const limit = parseInt(opts.limit, 10);
      const items = await ctx.listTelemetryUseCase.execute(opts.spacecraftId, limit);
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(items, null, 2));
    });
  return cmd;
}


