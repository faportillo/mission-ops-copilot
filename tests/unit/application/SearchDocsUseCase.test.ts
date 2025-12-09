import { describe, it, expect } from 'vitest';
import { InMemoryDocsRepository } from '../../../src/infrastructure/persistence/inMemory/InMemoryDocsRepository.js';
import { SearchDocsUseCase } from '../../../src/application/docs/SearchDocsUseCase.js';

describe('SearchDocsUseCase', () => {
  it('searches docs by keyword', async () => {
    const repo = new InMemoryDocsRepository();
    const uc = new SearchDocsUseCase(repo);
    await repo.save({ id: 'd1', title: 'Thermal Ops', content: 'Manage temp', tags: ['thermal'] });
    await repo.save({ id: 'd2', title: 'Power Ops', content: 'Manage volt', tags: ['power'] });
    const results = await uc.execute('thermal', 10);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('d1');
  });
});


