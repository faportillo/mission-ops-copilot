import { describe, it, expect } from 'vitest';
import { TelemetrySnapshot } from '../../../src/domain/telemetry/TelemetrySnapshot.js';

describe('TelemetrySnapshot.diffFrom', () => {
  it('computes changed parameters and numeric deltas', () => {
    const a = TelemetrySnapshot.create({
      id: 'a',
      spacecraftId: 'SC-1',
      timestamp: new Date('2025-01-01T00:00:00Z'),
      parameters: { temp: 10, mode: 'CRUISE', healthy: true }
    });
    const b = TelemetrySnapshot.create({
      id: 'b',
      spacecraftId: 'SC-1',
      timestamp: new Date('2025-01-01T00:01:00Z'),
      parameters: { temp: 12, mode: 'CRUISE', healthy: false }
    });
    const diff = b.diffFrom(a);
    expect(diff.changed.length).toBe(2);
    const tempDelta = diff.changed.find((c) => c.parameter === 'temp')!;
    expect(tempDelta.delta).toBe(2);
    const healthyChange = diff.changed.find((c) => c.parameter === 'healthy')!;
    expect(healthyChange.previous).toBe(true);
    expect(healthyChange.current).toBe(false);
  });
});


