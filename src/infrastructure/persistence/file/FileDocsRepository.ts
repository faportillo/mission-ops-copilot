import { promises as fs } from 'fs';
import { join } from 'path';
import type { DocsRepository } from '../DocsRepository.js';
import { OpsDocument } from '../../../domain/docs/OpsDocument.js';

export class FileDocsRepository implements DocsRepository {
  private filePath: string;
  constructor(private dataDir: string) {
    this.filePath = join(dataDir, 'docs.json');
  }

  private async readAll(): Promise<OpsDocument[]> {
    try {
      const data = await fs.readFile(this.filePath, 'utf8');
      const parsed = JSON.parse(data) as Array<any>;
      return parsed.map(
        (d) =>
          new OpsDocument(
            d.id,
            d.spacecraftId ?? null,
            d.title,
            d.category ?? 'general',
            d.tags ?? [],
            d.content ?? '',
            d.publishedAt ? new Date(d.publishedAt) : new Date(0),
          ),
      );
    } catch {
      return [];
    }
  }

  private async writeAll(docs: OpsDocument[]): Promise<void> {
    await fs.mkdir(this.dataDir, { recursive: true });
    const plain = docs.map((d) => ({
      id: d.id,
      spacecraftId: d.spacecraftId,
      title: d.title,
      category: d.category,
      tags: d.tags,
      content: d.content,
      publishedAt: d.publishedAt,
    }));
    await fs.writeFile(this.filePath, JSON.stringify(plain, null, 2), 'utf8');
  }

  async save(doc: OpsDocument): Promise<void> {
    const docs = await this.readAll();
    const idx = docs.findIndex((d) => d.id === doc.id);
    if (idx >= 0) docs[idx] = doc;
    else docs.push(doc);
    await this.writeAll(docs);
  }

  async search(keyword: string, limit: number): Promise<OpsDocument[]> {
    const docs = await this.readAll();
    const q = keyword.toLowerCase();
    const results = docs.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        d.content.toLowerCase().includes(q) ||
        d.tags.some((t) => t.toLowerCase().includes(q)),
    );
    return results.slice(0, limit);
  }

  async findById(id: string): Promise<OpsDocument | null> {
    const docs = await this.readAll();
    return docs.find((d) => d.id === id) ?? null;
  }
}
