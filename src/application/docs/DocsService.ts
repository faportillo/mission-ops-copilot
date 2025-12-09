import type { DocsRepository } from '../../infrastructure/persistence/DocsRepository.js';
import type { OpsDocument } from '../../domain/docs/OpsDocument.js';

export class DocsService {
  constructor(private readonly repo: DocsRepository) {}
  async save(doc: OpsDocument): Promise<void> {
    await this.repo.save(doc);
  }
}


