import { describe, it, expect } from 'vitest';
import { InMemoryTelemetryRepository } from '../../../src/infrastructure/persistence/inMemory/InMemoryTelemetryRepository.js';
import { TelemetrySnapshot } from '../../../src/domain/telemetry/TelemetrySnapshot.js';

describe('InMemoryTelemetryRepository', () => {
  it('saves and retrieves recent snapshots', async () => {
    const repo = new InMemoryTelemetryRepository();
    const a = TelemetrySnapshot.create({
      id: 'a',
      spacecraftId: 'SC-1',
      timestamp: new Date('2025-01-01T00:00:00Z'),
      parameters: {}
    });
    const b = TelemetrySnapshot.create({
      id: 'b',
      spacecraftId: 'SC-1',
      timestamp: new Date('2025-01-01T00:01:00Z'),
      parameters: {}
    });
    await repo.save(a);
    await repo.save(b);
    const recent = await repo.findRecent('SC-1', 1);
    expect(recent[0].id).toBe('b');
    const found = await repo.findById('a');
    expect(found?.id).toBe('a');
  });
});


