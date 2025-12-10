import type { SpacecraftConfigRepository } from '../../infrastructure/persistence/SpacecraftConfigRepository.js';
import { AnomalyRulesConfigSchema } from '../../domain/telemetry/AnomalyRules.js';
import { z } from 'zod';

export class SpacecraftConfigService {
  constructor(private readonly repo: SpacecraftConfigRepository) {}

  async getConfig(spacecraftId: string) {
    return this.repo.getBySpacecraftId(spacecraftId);
  }

  async updateConfig(
    spacecraftId: string,
    rawConfig: unknown,
    options?: { status?: string; source?: string },
  ) {
    const RelaxedConfigSchema = z
      .object({
        parameters: z.record(z.string(), z.any()).optional(),
        mission: z.any().optional(),
        notes: z.string().optional(),
        configVersion: z.string().optional(),
      })
      .catchall(z.any());

    const parsed = RelaxedConfigSchema.safeParse(rawConfig);
    if (!parsed.success) {
      throw new Error('Invalid spacecraft config payload');
    }

    // Validate anomaly-related part non-fatally
    AnomalyRulesConfigSchema.safeParse(parsed.data);

    return this.repo.upsert(spacecraftId, parsed.data, options);
  }
}
