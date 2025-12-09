import type { TelemetryAnomaly } from '../../domain/telemetry/TelemetryAnomaly.js';
import type { OpsDocument } from '../../domain/docs/OpsDocument.js';
import type { MissionEvent } from '../../domain/events/MissionEvent.js';

export interface LlmClient {
  summarizeTelemetry(anomalies: TelemetryAnomaly[], context: OpsDocument[]): Promise<string>;
  generateEventBrief(event: MissionEvent, context: OpsDocument[]): Promise<string>;
}


