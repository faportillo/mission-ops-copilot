import type { MissionEvent } from '../../domain/events/MissionEvent.js';

export interface EventRepository {
  save(event: MissionEvent): Promise<void>;
  findRecent(spacecraftId: string, limit: number): Promise<MissionEvent[]>;
  findById(id: string): Promise<MissionEvent | null>;
}


