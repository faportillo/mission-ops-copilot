import type { SpacecraftConfig } from '@prisma/client';

export interface SpacecraftConfigRepository {
  getBySpacecraftId(spacecraftId: string): Promise<SpacecraftConfig | null>;
  upsert(
    spacecraftId: string,
    config: unknown,
    options?: { status?: string; source?: string },
  ): Promise<SpacecraftConfig>;
}
