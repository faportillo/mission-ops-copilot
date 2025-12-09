import { describe, it, expect } from 'vitest';
import { AnalyzeTelemetryUseCase } from '../../../src/application/telemetry/AnalyzeTelemetryUseCase.js';
import { InMemoryTelemetryRepository } from '../../../src/infrastructure/persistence/inMemory/InMemoryTelemetryRepository.js';
import { TelemetrySnapshot } from '../../../src/domain/telemetry/TelemetrySnapshot.js';
import { getLogger } from '../../../src/logging/logger.js';

describe('AnalyzeTelemetryUseCase', () => {
  it('detects threshold anomalies', async () => {
    const repo = new InMemoryTelemetryRepository();
    const logger = getLogger();
    const uc = new AnalyzeTelemetryUseCase(repo, logger);
    const ts1 = TelemetrySnapshot.create({
      id: 't1',
      spacecraftId: 'SC-1',
      timestamp: new Date('2025-01-01T00:00:00Z'),
      parameters: { temp: 10 }
    });
    const ts2 = TelemetrySnapshot.create({
      id: 't2',
      spacecraftId: 'SC-1',
      timestamp: new Date('2025-01-01T00:01:00Z'),
      parameters: { temp: 100 }
    });
    await repo.save(ts1);
    await repo.save(ts2);
    const anomalies = await uc.execute({
      spacecraftId: 'SC-1',
      limit: 5,
      thresholds: { temp: { max: 50 } }
    });
    expect(anomalies.length).toBeGreaterThan(0);
  });
});


