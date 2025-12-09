import type { TelemetryRepository } from '../../infrastructure/persistence/TelemetryRepository.js';
import type { TelemetryAnomaly } from '../../domain/telemetry/TelemetryAnomaly.js';
import type { Logger } from '../../logging/logger.js';

export type AnalyzeTelemetryInput = {
  spacecraftId: string;
  limit?: number;
  thresholds?: Record<string, { min?: number; max?: number; delta?: number }>;
};

export class AnalyzeTelemetryUseCase {
  constructor(private readonly repo: TelemetryRepository, private readonly logger: Logger) {}

  async execute(input: AnalyzeTelemetryInput): Promise<TelemetryAnomaly[]> {
    const limit = input.limit ?? 20;
    const snapshots = await this.repo.findRecent(input.spacecraftId, limit);
    const anomalies: TelemetryAnomaly[] = [];
    const thresholds = input.thresholds ?? {};
    if (snapshots.length === 0) return anomalies;

    for (let i = 0; i < snapshots.length; i++) {
      const current = snapshots[i];
      const previous = snapshots[i + 1];
      for (const [key, value] of Object.entries(current.parameters)) {
        const th = thresholds[key];
        if (typeof value === 'number' && th) {
          if (typeof th.min === 'number' && value < th.min) {
            anomalies.push({
              id: `${current.id}:${key}:MIN`,
              spacecraftId: current.spacecraftId,
              timestamp: current.timestamp,
              parameter: key,
              value,
              severity: 'HIGH',
              description: `Parameter ${key} below min ${th.min}`
            });
          } else if (typeof th.max === 'number' && value > th.max) {
            anomalies.push({
              id: `${current.id}:${key}:MAX`,
              spacecraftId: current.spacecraftId,
              timestamp: current.timestamp,
              parameter: key,
              value,
              severity: 'HIGH',
              description: `Parameter ${key} above max ${th.max}`
            });
          } else if (typeof th.delta === 'number' && previous) {
            const prevVal = previous.parameters[key];
            if (typeof prevVal === 'number') {
              const d = Math.abs(value - prevVal);
              if (d > th.delta) {
                anomalies.push({
                  id: `${current.id}:${key}:DELTA`,
                  spacecraftId: current.spacecraftId,
                  timestamp: current.timestamp,
                  parameter: key,
                  value,
                  severity: 'MEDIUM',
                  description: `Parameter ${key} delta ${d} exceeds ${th.delta}`
                });
              }
            }
          }
        }
      }
    }
    this.logger.info('AnalyzeTelemetryUseCase completed', {
      spacecraftId: input.spacecraftId,
      anomalies: anomalies.length
    });
    return anomalies;
  }
}


