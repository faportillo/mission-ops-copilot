import type { TelemetryRepository } from '../TelemetryRepository.js';
import type { TelemetrySnapshot } from '../../../domain/telemetry/TelemetrySnapshot.js';

export class InMemoryTelemetryRepository implements TelemetryRepository {
  private storage: Map<string, TelemetrySnapshot> = new Map();
  private bySpacecraft: Map<string, TelemetrySnapshot[]> = new Map();

  async save(snapshot: TelemetrySnapshot): Promise<void> {
    this.storage.set(snapshot.id, snapshot);
    const list = this.bySpacecraft.get(snapshot.spacecraftId) ?? [];
    list.push(snapshot);
    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.bySpacecraft.set(snapshot.spacecraftId, list);
  }

  async findRecent(spacecraftId: string, limit: number): Promise<TelemetrySnapshot[]> {
    const list = this.bySpacecraft.get(spacecraftId) ?? [];
    return list.slice(0, limit);
  }

  async findById(id: string): Promise<TelemetrySnapshot | null> {
    return this.storage.get(id) ?? null;
  }
}


