import type { EventRepository } from '../EventRepository.js';
import type { MissionEvent } from '../../../domain/events/MissionEvent.js';

export class InMemoryEventRepository implements EventRepository {
  private storage: Map<string, MissionEvent> = new Map();
  private bySpacecraft: Map<string, MissionEvent[]> = new Map();

  async save(event: MissionEvent): Promise<void> {
    this.storage.set(event.id, event);
    const list = this.bySpacecraft.get(event.spacecraftId) ?? [];
    list.push(event);
    list.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.bySpacecraft.set(event.spacecraftId, list);
  }

  async findRecent(spacecraftId: string, limit: number): Promise<MissionEvent[]> {
    const list = this.bySpacecraft.get(spacecraftId) ?? [];
    return list.slice(0, limit);
  }

  async findById(id: string): Promise<MissionEvent | null> {
    return this.storage.get(id) ?? null;
  }
}


