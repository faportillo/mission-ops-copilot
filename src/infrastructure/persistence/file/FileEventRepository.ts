import { promises as fs } from 'fs';
import { join } from 'path';
import type { EventRepository } from '../EventRepository.js';
import type { MissionEvent } from '../../../domain/events/MissionEvent.js';

type EventRecord = {
  id: string;
  spacecraftId: string;
  timestamp: string;
  type: MissionEvent['type'];
  severity: MissionEvent['severity'];
  message: string;
  metadata?: Record<string, unknown>;
};

export class FileEventRepository implements EventRepository {
  private filePath: string;
  constructor(private dataDir: string) {
    this.filePath = join(dataDir, 'events.json');
  }

  private async readAll(): Promise<EventRecord[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(data) as EventRecord[];
    } catch {
      return [];
    }
  }

  private async writeAll(records: EventRecord[]): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(records, null, 2), 'utf8');
  }

  async save(event: MissionEvent): Promise<void> {
    const records = await this.readAll();
    const idx = records.findIndex((r) => r.id === event.id);
    const rec: EventRecord = {
      id: event.id,
      spacecraftId: event.spacecraftId,
      timestamp: event.timestamp.toISOString(),
      type: event.type,
      severity: event.severity,
      message: event.message,
      metadata: event.metadata
    };
    if (idx >= 0) records[idx] = rec;
    else records.push(rec);
    await this.writeAll(records);
  }

  async findRecent(spacecraftId: string, limit: number): Promise<MissionEvent[]> {
    const records = await this.readAll();
    return records
      .filter((r) => r.spacecraftId === spacecraftId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit)
      .map((r) => ({
        id: r.id,
        spacecraftId: r.spacecraftId,
        timestamp: new Date(r.timestamp),
        type: r.type,
        severity: r.severity,
        message: r.message,
        metadata: r.metadata
      }));
  }

  async findById(id: string): Promise<MissionEvent | null> {
    const records = await this.readAll();
    const r = records.find((x) => x.id === id);
    return r
      ? {
          id: r.id,
          spacecraftId: r.spacecraftId,
          timestamp: new Date(r.timestamp),
          type: r.type,
          severity: r.severity,
          message: r.message,
          metadata: r.metadata
        }
      : null;
  }
}


