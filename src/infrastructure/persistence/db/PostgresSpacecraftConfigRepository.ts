import type { SpacecraftConfigRepository } from '../SpacecraftConfigRepository.js';
import type { SpacecraftConfig as PrismaSpacecraftConfig } from '@prisma/client';
import { getPrisma } from '../../db/prisma.js';

export class PostgresSpacecraftConfigRepository implements SpacecraftConfigRepository {
  async getBySpacecraftId(spacecraftId: string): Promise<PrismaSpacecraftConfig | null> {
    const prisma = getPrisma();
    return prisma.spacecraftConfig.findUnique({
      where: { spacecraftId },
    });
  }

  async upsert(
    spacecraftId: string,
    config: unknown,
    options?: { status?: string; source?: string },
  ): Promise<PrismaSpacecraftConfig> {
    const prisma = getPrisma();
    return prisma.spacecraftConfig.upsert({
      where: { spacecraftId },
      create: {
        spacecraftId,
        config: config as any,
        status: options?.status ?? 'approved',
        source: options?.source ?? null,
      },
      update: {
        config: config as any,
        status: options?.status ?? 'approved',
        source: options?.source ?? null,
      },
    });
  }
}
