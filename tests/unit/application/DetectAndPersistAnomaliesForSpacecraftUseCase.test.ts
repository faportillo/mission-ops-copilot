import { describe, it, expect } from 'vitest';
import { InMemoryTelemetryRepository } from '../../../src/infrastructure/persistence/inMemory/InMemoryTelemetryRepository.js';
import { InMemorySpacecraftConfigRepository } from '../../../src/infrastructure/persistence/inMemory/InMemorySpacecraftConfigRepository.js';
import { InMemoryAnomalyRepository } from '../../../src/infrastructure/persistence/inMemory/InMemoryAnomalyRepository.js';
import { AnalyzeTelemetryUseCase } from '../../../src/application/telemetry/AnalyzeTelemetryUseCase.js';
import { DetectAndPersistAnomaliesForSpacecraftUseCase } from '../../../src/application/telemetry/DetectAndPersistAnomaliesForSpacecraftUseCase.js';
import { TelemetrySnapshot } from '../../../src/domain/telemetry/TelemetrySnapshot.js';
import { getLogger } from '../../../src/logging/logger.js';

describe('DetectAndPersistAnomaliesForSpacecraftUseCase', () => {
  it('detects anomalies in a window, persists uniquely, and dedupes on re-run', async () => {
    const telemetryRepo = new InMemoryTelemetryRepository();
    const cfgRepo = new InMemorySpacecraftConfigRepository();
    const anomalyRepo = new InMemoryAnomalyRepository();
    const logger = getLogger();

    const analyze = new AnalyzeTelemetryUseCase(telemetryRepo, cfgRepo, logger);
    const detectPersist = new DetectAndPersistAnomaliesForSpacecraftUseCase(
      analyze,
      anomalyRepo,
      logger,
    );

    const spacecraftId = 'SC-UP';
    await cfgRepo.upsert(spacecraftId, {
      parameters: { temp: { warnHigh: 50, critHigh: 90 } },
    });

    const base = new Date('2025-01-01T00:00:00Z').getTime();
    const mk = (mins: number, val: number, id: string) =>
      TelemetrySnapshot.create({
        id,
        spacecraftId,
        timestamp: new Date(base + mins * 60_000),
        parameters: { temp: val },
      });

    // Two anomalous points in-window; also add a duplicate snapshot at same timestamp to test dedupe
    await telemetryRepo.save(mk(0, 60, 's0')); // warn
    await telemetryRepo.save(mk(10, 100, 's10')); // crit
    await telemetryRepo.save(mk(0, 60, 's0_dup')); // duplicate time/param => dedupe by repo key

    const from = new Date(base - 1 * 60_000);
    const to = new Date(base + 20 * 60_000);
    const first = await detectPersist.execute({ spacecraftId, from, to });
    expect(first.detected).toBeGreaterThanOrEqual(2);
    expect(first.persisted).toBeGreaterThanOrEqual(2);

    // Running again should dedupe and persist zero new
    const second = await detectPersist.execute({ spacecraftId, from, to });
    expect(second.detected).toBeGreaterThanOrEqual(2);
    expect(second.persisted).toBe(0);

    const recent = await anomalyRepo.findRecent(spacecraftId, 10);
    expect(recent.length).toBeGreaterThanOrEqual(2);
  });
});
