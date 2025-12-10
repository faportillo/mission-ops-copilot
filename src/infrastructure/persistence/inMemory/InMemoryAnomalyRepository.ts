import type { AnomalyRepository } from '../AnomalyRepository.js';
import type { TelemetryAnomaly } from '../../../domain/telemetry/TelemetryAnomaly.js';

export class InMemoryAnomalyRepository implements AnomalyRepository {
  private bySpacecraft = new Map<string, TelemetryAnomaly[]>();

  async saveManyUnique(anomalies: TelemetryAnomaly[]): Promise<number> {
    let added = 0;
    for (const a of anomalies) {
      const list = this.bySpacecraft.get(a.spacecraftId) ?? [];
      const exists = list.find(
        (x) =>
          x.spacecraftId === a.spacecraftId &&
          x.parameter === a.parameter &&
          x.timestamp.getTime() === a.timestamp.getTime(),
      );
      if (!exists) {
        list.push(a);
        this.bySpacecraft.set(a.spacecraftId, list);
        added++;
      }
    }
    return added;
  }

  async findRecent(spacecraftId: string, limit: number): Promise<TelemetryAnomaly[]> {
    const list = this.bySpacecraft.get(spacecraftId) ?? [];
    return list
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async findInRange(spacecraftId: string, from: Date, to: Date): Promise<TelemetryAnomaly[]> {
    const list = this.bySpacecraft.get(spacecraftId) ?? [];
    const f = from.getTime();
    const t = to.getTime();
    return list
      .filter((x) => {
        const ts = x.timestamp.getTime();
        return ts >= f && ts <= t;
      })
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
}
