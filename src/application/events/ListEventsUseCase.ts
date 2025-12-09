import type { EventRepository } from '../../infrastructure/persistence/EventRepository.js';
import type { MissionEvent } from '../../domain/events/MissionEvent.js';

export class ListEventsUseCase {
  constructor(private readonly repo: EventRepository) {}
  async execute(spacecraftId: string, limit: number): Promise<MissionEvent[]> {
    return this.repo.findRecent(spacecraftId, limit);
  }
}


