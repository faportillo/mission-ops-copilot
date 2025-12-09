import type { OpsDocument } from '../../domain/docs/OpsDocument.js';

export interface DocsRepository {
  save(doc: OpsDocument): Promise<void>;
  search(keyword: string, limit: number): Promise<OpsDocument[]>;
  findById(id: string): Promise<OpsDocument | null>;
}


