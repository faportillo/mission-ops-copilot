import type { TelemetryRepository } from '../infrastructure/persistence/TelemetryRepository.js';
import type { EventRepository } from '../infrastructure/persistence/EventRepository.js';
import type { DocsRepository } from '../infrastructure/persistence/DocsRepository.js';
import type { Logger } from '../logging/logger.js';
import type { TimeProvider } from '../infrastructure/time/TimeProvider.js';
import type { LlmClient } from '../infrastructure/llm/LlmClient.js';

export type ApplicationDeps = {
  telemetryRepository: TelemetryRepository;
  eventRepository: EventRepository;
  docsRepository: DocsRepository;
  logger: Logger;
  time: TimeProvider;
  llm: LlmClient;
};


