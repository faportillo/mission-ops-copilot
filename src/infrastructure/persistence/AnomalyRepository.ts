import type { TelemetryAnomaly } from '../../domain/telemetry/TelemetryAnomaly.js';

export interface AnomalyRepository {
  saveManyUnique(anomalies: TelemetryAnomaly[]): Promise<number>;
  findRecent(spacecraftId: string, limit: number): Promise<TelemetryAnomaly[]>;
  findInRange(spacecraftId: string, from: Date, to: Date): Promise<TelemetryAnomaly[]>;
}
