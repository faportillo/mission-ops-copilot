import { Command } from 'commander';
import type { AppContext } from '../../../index.js';

export function generateBriefCommand(ctx: AppContext) {
  const cmd = new Command('generate-brief')
    .requiredOption('--event-id <id>', 'Event ID')
    .description('Generate an LLM-backed brief for an event (stubbed)')
    .action(async (opts: { eventId: string }) => {
      const event = await ctx.eventRepository.findById(opts.eventId);
      if (!event) {
        // eslint-disable-next-line no-console
        console.error(`Event not found: ${opts.eventId}`);
        process.exitCode = 1;
        return;
      }
      const contextDocs = await ctx.docsRepository.search(event.type, 5);
      const brief = await ctx.llmClient.generateEventBrief(event, contextDocs);
      // eslint-disable-next-line no-console
      console.log(brief);
    });
  return cmd;
}


