import type { AppConfig } from './config/schema.js';
import { loadConfig } from './config/index.js';
import { getLogger } from './logging/logger.js';
import { SystemTimeProvider, type TimeProvider } from './infrastructure/time/TimeProvider.js';
import { InMemoryTelemetryRepository } from './infrastructure/persistence/inMemory/InMemoryTelemetryRepository.js';
import { InMemoryEventRepository } from './infrastructure/persistence/inMemory/InMemoryEventRepository.js';
import { InMemoryDocsRepository } from './infrastructure/persistence/inMemory/InMemoryDocsRepository.js';
import { FileTelemetryRepository } from './infrastructure/persistence/file/FileTelemetryRepository.js';
import { FileEventRepository } from './infrastructure/persistence/file/FileEventRepository.js';
import { FileDocsRepository } from './infrastructure/persistence/file/FileDocsRepository.js';
import { TelemetryService } from './application/telemetry/TelemetryService.js';
import { AnalyzeTelemetryUseCase } from './application/telemetry/AnalyzeTelemetryUseCase.js';
import { ListTelemetryUseCase } from './application/telemetry/ListTelemetryUseCase.js';
import { EventService } from './application/events/EventService.js';
import { ListEventsUseCase } from './application/events/ListEventsUseCase.js';
import { DocsService } from './application/docs/DocsService.js';
import { SearchDocsUseCase } from './application/docs/SearchDocsUseCase.js';
import { OpenAiLlmClient } from './infrastructure/llm/OpenAiLlmClient.js';
import type { LlmClient } from './infrastructure/llm/LlmClient.js';
import type { TelemetryRepository } from './infrastructure/persistence/TelemetryRepository.js';
import type { EventRepository } from './infrastructure/persistence/EventRepository.js';
import type { DocsRepository } from './infrastructure/persistence/DocsRepository.js';
import type { Logger } from './logging/logger.js';

export type AppContext = {
  config: AppConfig;
  logger: Logger;
  time: TimeProvider;
  telemetryRepository: TelemetryRepository;
  eventRepository: EventRepository;
  docsRepository: DocsRepository;
  telemetryService: TelemetryService;
  eventService: EventService;
  docsService: DocsService;
  analyzeTelemetryUseCase: AnalyzeTelemetryUseCase;
  listTelemetryUseCase: ListTelemetryUseCase;
  listEventsUseCase: ListEventsUseCase;
  searchDocsUseCase: SearchDocsUseCase;
  llmClient: LlmClient;
};

export function createAppContext(): AppContext {
  const config = loadConfig();
  const logger = getLogger();
  const time = new SystemTimeProvider();

  const telemetryRepository =
    config.DATA_BACKEND === 'file' && config.DATA_DIR
      ? new FileTelemetryRepository(config.DATA_DIR)
      : new InMemoryTelemetryRepository();

  const eventRepository =
    config.DATA_BACKEND === 'file' && config.DATA_DIR
      ? new FileEventRepository(config.DATA_DIR)
      : new InMemoryEventRepository();

  const docsRepository =
    config.DATA_BACKEND === 'file' && config.DATA_DIR
      ? new FileDocsRepository(config.DATA_DIR)
      : new InMemoryDocsRepository();

  const telemetryService = new TelemetryService(telemetryRepository, logger);
  const analyzeTelemetryUseCase = new AnalyzeTelemetryUseCase(telemetryRepository, logger);
  const listTelemetryUseCase = new ListTelemetryUseCase(telemetryRepository);

  const eventService = new EventService(eventRepository);
  const listEventsUseCase = new ListEventsUseCase(eventRepository);

  const docsService = new DocsService(docsRepository);
  const searchDocsUseCase = new SearchDocsUseCase(docsRepository);

  const llmClient = new OpenAiLlmClient(logger, config.OPENAI_API_KEY);

  return {
    config,
    logger,
    time,
    telemetryRepository,
    eventRepository,
    docsRepository,
    telemetryService,
    eventService,
    docsService,
    analyzeTelemetryUseCase,
    listTelemetryUseCase,
    listEventsUseCase,
    searchDocsUseCase,
    llmClient
  };
}

export * from './domain/telemetry/TelemetrySnapshot.js';
export * from './domain/telemetry/TelemetryAnomaly.js';
export * from './domain/events/MissionEvent.js';
export * from './domain/docs/OpsDocument.js';
export * from './infrastructure/persistence/TelemetryRepository.js';
export * from './infrastructure/persistence/EventRepository.js';
export * from './infrastructure/persistence/DocsRepository.js';
export * from './application/telemetry/AnalyzeTelemetryUseCase.js';
export * from './application/telemetry/ListTelemetryUseCase.js';
export * from './application/telemetry/TelemetryService.js';
export * from './application/events/EventService.js';
export * from './application/events/ListEventsUseCase.js';
export * from './application/docs/DocsService.js';
export * from './application/docs/SearchDocsUseCase.js';
export * from './infrastructure/llm/LlmClient.js';


