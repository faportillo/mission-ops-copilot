import { Command } from 'commander';
import { readFile } from 'fs/promises';
import { TelemetrySnapshot } from '../../../domain/telemetry/TelemetrySnapshot.js';
import type { AppContext } from '../../../index.js';

export function ingestTelemetryCommand(ctx: AppContext) {
  const cmd = new Command('ingest-telemetry')
    .requiredOption('--spacecraft-id <id>', 'Spacecraft ID')
    .requiredOption('--file <path>', 'Path to JSON file (array of telemetry DTOs)')
    .description('Ingest telemetry snapshots from a JSON file')
    .action(async (opts: { spacecraftId: string; file: string }) => {
      const content = await readFile(opts.file, 'utf8');
      const arr = JSON.parse(content) as Array<{
        id?: string;
        timestamp: string;
        parameters: Record<string, number | string | boolean>;
      }>;
      for (const item of arr) {
        const snapshot = TelemetrySnapshot.create({
          id: item.id ?? `ts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          spacecraftId: opts.spacecraftId,
          timestamp: new Date(item.timestamp),
          parameters: item.parameters
        });
        // eslint-disable-next-line no-await-in-loop
        await ctx.telemetryService.saveSnapshot(snapshot);
      }
      ctx.logger.info('Ingestion complete', { count: arr.length });
    });
  return cmd;
}


