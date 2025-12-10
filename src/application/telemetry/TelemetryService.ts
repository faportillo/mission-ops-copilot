import type { TelemetryRepository } from '../../infrastructure/persistence/TelemetryRepository.js';
import { TelemetrySnapshot } from '../../domain/telemetry/TelemetrySnapshot.js';
import type { Logger } from '../../logging/logger.js';

export class TelemetryService {
  constructor(
    private readonly repo: TelemetryRepository,
    private readonly logger: Logger,
  ) {}

  async saveSnapshot(snapshot: TelemetrySnapshot): Promise<void> {
    await this.repo.save(snapshot);
    this.logger.info('Saved telemetry snapshot', {
      id: snapshot.id,
      spacecraftId: snapshot.spacecraftId,
    });
  }

  async saveSnapshots(snapshots: TelemetrySnapshot[]): Promise<void> {
    for (const snapshot of snapshots) {
      await this.saveSnapshot(snapshot);
    }
  }

  async getRecentSnapshots(spacecraftId: string, limit: number): Promise<TelemetrySnapshot[]> {
    const items = await this.repo.findRecent(spacecraftId, limit);
    return items;
  }
}
