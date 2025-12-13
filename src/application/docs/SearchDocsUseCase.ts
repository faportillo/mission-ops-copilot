import type { DocsRepository } from '../../infrastructure/persistence/DocsRepository.js';
import type { OpsDocument } from '../../domain/docs/OpsDocument.js';

export class SearchDocsUseCase {
  constructor(private readonly repo: DocsRepository) {}
  async execute(keyword: string, limit: number): Promise<OpsDocument[]> {
    return this.repo.search(keyword, limit);
  }
}
