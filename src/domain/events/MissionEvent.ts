import type { EventSeverity } from './EventSeverity.js';

export type MissionEventType = 'ANOMALY' | 'CONTACT_LOST' | 'MODE_CHANGE' | 'COMMAND_SENT' | 'INFO';

export type MissionEvent = {
  id: string;
  spacecraftId: string;
  timestamp: Date;
  type: MissionEventType;
  severity: EventSeverity;
  message: string;
  metadata?: Record<string, unknown>;
};


