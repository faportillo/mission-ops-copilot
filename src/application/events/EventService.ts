import type { EventRepository } from '../../infrastructure/persistence/EventRepository.js';
import type { MissionEvent } from '../../domain/events/MissionEvent.js';

export class EventService {
  constructor(private readonly repo: EventRepository) {}

  async save(event: MissionEvent): Promise<void> {
    await this.repo.save(event);
  }

  async list(spacecraftId: string, limit: number): Promise<MissionEvent[]> {
    return this.repo.findRecent(spacecraftId, limit);
  }
}


