import { describe, it, expect } from 'vitest';
import { ListSpacecraftConfigUseCase } from '../../../src/application/spacecraft/ListSpacecraftConfigUseCase.js';
import { InMemorySpacecraftConfigRepository } from '../../../src/infrastructure/persistence/inMemory/InMemorySpacecraftConfigRepository.js';

describe('ListSpacecraftConfigUseCase', () => {
  it('lists configs with pagination (limit/offset)', async () => {
    const repo = new InMemorySpacecraftConfigRepository();
    // Seed 3 configs
    await repo.upsert('SC-A', { a: 1 });
    await repo.upsert('SC-B', { b: 2 });
    await repo.upsert('SC-C', { c: 3 });

    const useCase = new ListSpacecraftConfigUseCase(repo as any);
    const page1 = await useCase.execute({ limit: 2, offset: 0 });
    expect(page1.length).toBe(2);
    const page2 = await useCase.execute({ limit: 2, offset: 2 });
    expect(page2.length).toBe(1);
    const ids = [...page1, ...page2].map((r) => r.spacecraftId).sort();
    expect(ids).toEqual(['SC-A', 'SC-B', 'SC-C']);
  });
});
