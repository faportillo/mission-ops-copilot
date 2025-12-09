import { Command } from 'commander';
import type { AppContext } from '../../../index.js';

export function analyzeTelemetryCommand(ctx: AppContext) {
  const cmd = new Command('analyze-telemetry')
    .requiredOption('--spacecraft-id <id>', 'Spacecraft ID')
    .option('--limit <n>', 'Limit', '20')
    .description('Analyze recent telemetry for anomalies')
    .action(async (opts: { spacecraftId: string; limit: string }) => {
      const limit = parseInt(opts.limit, 10);
      const anomalies = await ctx.analyzeTelemetryUseCase.execute({
        spacecraftId: opts.spacecraftId,
        limit
      });
      // eslint-disable-next-line no-console
      console.log(JSON.stringify(anomalies, null, 2));
    });
  return cmd;
}


