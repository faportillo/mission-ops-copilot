import { describe, it, expect } from 'vitest';
import { CountSpacecraftConfigsUseCase } from '../../../src/application/spacecraft/CountSpacecraftConfigsUseCase.js';
import { InMemorySpacecraftConfigRepository } from '../../../src/infrastructure/persistence/inMemory/InMemorySpacecraftConfigRepository.js';

describe('CountSpacecraftConfigsUseCase', () => {
  it('counts number of spacecraft configs', async () => {
    const repo = new InMemorySpacecraftConfigRepository();
    await repo.upsert('SC-1', { a: 1 });
    await repo.upsert('SC-2', { b: 2 });
    const useCase = new CountSpacecraftConfigsUseCase(repo as any);
    const count = await useCase.execute();
    expect(count).toBe(2);
  });
});
