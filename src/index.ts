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
import type { TelemetryRepository } from './infrastructure/persistence/TelemetryRepository.js';
import type { EventRepository } from './infrastructure/persistence/EventRepository.js';
import type { DocsRepository } from './infrastructure/persistence/DocsRepository.js';
import type { Logger } from './logging/logger.js';
import { PostgresTelemetryRepository } from './infrastructure/persistence/db/PostgresTelemetryRepository.js';
import { PostgresEventRepository } from './infrastructure/persistence/db/PostgresEventRepository.js';
import { PostgresDocsRepository } from './infrastructure/persistence/db/PostgresDocsRepository.js';
import type { SpacecraftConfigRepository } from './infrastructure/persistence/SpacecraftConfigRepository.js';
import { PostgresSpacecraftConfigRepository } from './infrastructure/persistence/db/PostgresSpacecraftConfigRepository.js';
import { InMemorySpacecraftConfigRepository } from './infrastructure/persistence/inMemory/InMemorySpacecraftConfigRepository.js';
import { SpacecraftConfigService } from './application/spacecraft/SpacecraftConfigService.js';
import { ListSpacecraftConfigUseCase } from './application/spacecraft/ListSpacecraftConfigUseCase.js';
import { CountSpacecraftConfigsUseCase } from './application/spacecraft/CountSpacecraftConfigsUseCase.js';

export type AppContext = {
  config: AppConfig;
  logger: Logger;
  time: TimeProvider;
  telemetryRepository: TelemetryRepository;
  eventRepository: EventRepository;
  docsRepository: DocsRepository;
  spacecraftConfigRepository: SpacecraftConfigRepository;
  telemetryService: TelemetryService;
  eventService: EventService;
  docsService: DocsService;
  spacecraftConfigService: SpacecraftConfigService;
  analyzeTelemetryUseCase: AnalyzeTelemetryUseCase;
  listTelemetryUseCase: ListTelemetryUseCase;
  listEventsUseCase: ListEventsUseCase;
  searchDocsUseCase: SearchDocsUseCase;
  listSpacecraftConfigUseCase: ListSpacecraftConfigUseCase;
  countSpacecraftConfigsUseCase: CountSpacecraftConfigsUseCase;
};

export function createAppContext(passedConfig?: AppConfig): AppContext {
  const config = passedConfig ?? loadConfig();
  const logger = getLogger();
  const time = new SystemTimeProvider();

  let telemetryRepository: TelemetryRepository;
  let eventRepository: EventRepository;
  let docsRepository: DocsRepository;
  let spacecraftConfigRepository: SpacecraftConfigRepository;

  if (config.DATA_BACKEND === 'file' && config.DATA_DIR) {
    telemetryRepository = new FileTelemetryRepository(config.DATA_DIR);
    eventRepository = new FileEventRepository(config.DATA_DIR);
    docsRepository = new FileDocsRepository(config.DATA_DIR);
    spacecraftConfigRepository = new InMemorySpacecraftConfigRepository();
  } else if (config.DATA_BACKEND === 'postgres') {
    telemetryRepository = new PostgresTelemetryRepository();
    eventRepository = new PostgresEventRepository();
    docsRepository = new PostgresDocsRepository();
    spacecraftConfigRepository = new PostgresSpacecraftConfigRepository();
  } else {
    telemetryRepository = new InMemoryTelemetryRepository();
    eventRepository = new InMemoryEventRepository();
    docsRepository = new InMemoryDocsRepository();
    spacecraftConfigRepository = new InMemorySpacecraftConfigRepository();
  }

  const telemetryService = new TelemetryService(telemetryRepository, logger);
  const spacecraftConfigService = new SpacecraftConfigService(spacecraftConfigRepository);
  const analyzeTelemetryUseCase = new AnalyzeTelemetryUseCase(
    telemetryRepository,
    spacecraftConfigRepository,
    logger,
  );
  const listTelemetryUseCase = new ListTelemetryUseCase(telemetryRepository);

  const eventService = new EventService(eventRepository);
  const listEventsUseCase = new ListEventsUseCase(eventRepository);

  const docsService = new DocsService(docsRepository);
  const searchDocsUseCase = new SearchDocsUseCase(docsRepository);

  const listSpacecraftConfigUseCase = new ListSpacecraftConfigUseCase(spacecraftConfigRepository);
  const countSpacecraftConfigsUseCase = new CountSpacecraftConfigsUseCase(
    spacecraftConfigRepository,
  );

  return {
    config,
    logger,
    time,
    telemetryRepository,
    eventRepository,
    docsRepository,
    spacecraftConfigRepository,
    telemetryService,
    eventService,
    docsService,
    spacecraftConfigService,
    analyzeTelemetryUseCase,
    listTelemetryUseCase,
    listEventsUseCase,
    searchDocsUseCase,
    listSpacecraftConfigUseCase,
    countSpacecraftConfigsUseCase,
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
