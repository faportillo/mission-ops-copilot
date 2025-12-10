import type { SpacecraftConfig } from '../../domain/spacecraft/SpacecraftConfig.js';

export interface SpacecraftConfigRepository {
  getBySpacecraftId(spacecraftId: string): Promise<SpacecraftConfig | null>;
  upsert(
    spacecraftId: string,
    config: unknown,
    options?: { status?: string; source?: string },
  ): Promise<SpacecraftConfig>;
  listConfigsPaged(options: { limit: number; offset: number }): Promise<SpacecraftConfig[]>;
  countConfigs(): Promise<number>;
}
