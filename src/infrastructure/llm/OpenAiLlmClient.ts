import type { LlmClient } from './LlmClient.js';
import type { TelemetryAnomaly } from '../../domain/telemetry/TelemetryAnomaly.js';
import type { OpsDocument } from '../../domain/docs/OpsDocument.js';
import type { MissionEvent } from '../../domain/events/MissionEvent.js';
import type { Logger } from '../../logging/logger.js';

export class OpenAiLlmClient implements LlmClient {
  constructor(private readonly logger: Logger, private readonly apiKey?: string) {}

  async summarizeTelemetry(anomalies: TelemetryAnomaly[], context: OpsDocument[]): Promise<string> {
    this.logger.info('LLM summarizeTelemetry (stub) called', {
      anomalies: anomalies.length,
      docs: context.length,
      apiKeyProvided: Boolean(this.apiKey)
    });
    return `Summary (stub): ${anomalies.length} anomalies; ${context.length} context docs.`;
  }

  async generateEventBrief(event: MissionEvent, context: OpsDocument[]): Promise<string> {
    this.logger.info('LLM generateEventBrief (stub) called', {
      eventId: event.id,
      docs: context.length,
      apiKeyProvided: Boolean(this.apiKey)
    });
    return `Brief (stub): Event ${event.id} (${event.type}, ${event.severity}). Context docs: ${context.length}.`;
  }
}


