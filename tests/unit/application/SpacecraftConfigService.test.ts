import { describe, it, expect } from 'vitest';
import { SpacecraftConfigService } from '../../../src/application/spacecraft/SpacecraftConfigService.js';
import { InMemorySpacecraftConfigRepository } from '../../../src/infrastructure/persistence/inMemory/InMemorySpacecraftConfigRepository.js';

describe('SpacecraftConfigService', () => {
  it('persists a valid flexible config', async () => {
    const repo = new InMemorySpacecraftConfigRepository();
    const svc = new SpacecraftConfigService(repo);
    const cfg = await svc.updateConfig('SC-X', {
      parameters: { temp: { warnHigh: 50, critHigh: 80 } },
      mission: { mode: 'nominal' },
      notes: 'test config',
    });
    expect(cfg.spacecraftId).toBe('SC-X');
    expect((cfg.config as any).parameters.temp.warnHigh).toBe(50);
  });

  it('rejects obviously invalid payloads', async () => {
    const repo = new InMemorySpacecraftConfigRepository();
    const svc = new SpacecraftConfigService(repo);
    await expect(svc.updateConfig('SC-Y', null as unknown as object)).rejects.toThrow(
      /Invalid spacecraft config payload/,
    );
  });
});
