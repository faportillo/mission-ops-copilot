import { describe, it, expect } from 'vitest';
import type { MissionEvent } from '../../../src/domain/events/MissionEvent.js';

describe('MissionEvent basic shape', () => {
  it('creates a mission event object', () => {
    const ev: MissionEvent = {
      id: 'e1',
      spacecraftId: 'SC-1',
      timestamp: new Date(),
      type: 'INFO',
      severity: 'LOW',
      message: 'Nominal'
    };
    expect(ev.type).toBe('INFO');
    expect(ev.severity).toBe('LOW');
  });
});


