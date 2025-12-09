import type { TelemetryRepository } from '../../infrastructure/persistence/TelemetryRepository.js';
import type { TelemetrySnapshot } from '../../domain/telemetry/TelemetrySnapshot.js';

export class ListTelemetryUseCase {
  constructor(private readonly repo: TelemetryRepository) {}
  async execute(spacecraftId: string, limit: number): Promise<TelemetrySnapshot[]> {
    return this.repo.findRecent(spacecraftId, limit);
  }
}


