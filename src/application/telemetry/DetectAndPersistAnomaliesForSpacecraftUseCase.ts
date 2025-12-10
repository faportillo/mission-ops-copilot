import type { Logger } from '../../logging/logger.js';
import type { AnomalyRepository } from '../../infrastructure/persistence/AnomalyRepository.js';
import { AnalyzeTelemetryUseCase } from './AnalyzeTelemetryUseCase.js';

export type DetectPersistInput = {
  spacecraftId: string;
  from?: Date;
  to?: Date;
  limit?: number;
};

export class DetectAndPersistAnomaliesForSpacecraftUseCase {
  constructor(
    private readonly analyze: AnalyzeTelemetryUseCase,
    private readonly anomalyRepo: AnomalyRepository,
    private readonly logger: Logger,
  ) {}

  async execute(input: DetectPersistInput): Promise<{ detected: number; persisted: number }> {
    const anomalies = await this.analyze.execute({
      spacecraftId: input.spacecraftId,
      from: input.from,
      to: input.to,
      limit: input.limit,
    });
    // Normalize ids (keep existing id), dedupe handled by repo unique constraint
    const persisted = await this.anomalyRepo.saveManyUnique(
      anomalies.map((a) => ({
        ...a,
        detectedAt: a.detectedAt ?? new Date(),
        windowStart: input.from,
        windowEnd: input.to,
      })),
    );
    this.logger.info('DetectAndPersistAnomalies done', {
      spacecraftId: input.spacecraftId,
      detected: anomalies.length,
      persisted,
    });
    return { detected: anomalies.length, persisted };
  }
}
