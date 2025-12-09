import type { TelemetrySnapshot } from '../../domain/telemetry/TelemetrySnapshot.js';

export interface TelemetryRepository {
  save(snapshot: TelemetrySnapshot): Promise<void>;
  findRecent(spacecraftId: string, limit: number): Promise<TelemetrySnapshot[]>;
  findById(id: string): Promise<TelemetrySnapshot | null>;
}


