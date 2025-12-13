import type { DocsRepository } from '../DocsRepository.js';
import { OpsDocument } from '../../../domain/docs/OpsDocument.js';
import { PrismaTx } from '../../db/prisma.js';

export class PostgresDocsRepository implements DocsRepository {
  constructor(private readonly prisma: PrismaTx) {}

  async save(doc: OpsDocument): Promise<void> {
    await this.prisma.opsDocument.upsert({
      where: { id: doc.id },
      update: {
        spacecraftId: doc.spacecraftId,
        title: doc.title,
        category: (doc as any).category ?? 'general',
        content: doc.content,
        tags: doc.tags,
        publishedAt: (doc as any).publishedAt ?? new Date(),
      } as any,
      create: {
        id: doc.id,
        spacecraftId: doc.spacecraftId ?? null,
        title: doc.title,
        category: (doc as any).category ?? 'general',
        content: doc.content,
        tags: doc.tags,
        publishedAt: (doc as any).publishedAt ?? new Date(),
      } as any,
    });
  }

  async search(keyword: string, limit: number): Promise<OpsDocument[]> {
    const q = keyword;
    const rows = await this.prisma.opsDocument.findMany({
      where: {
        OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
          { tags: { has: q } },
        ],
      },
      take: limit,
    });
    return rows.map(
      (r) =>
        new OpsDocument(
          r.id,
          (r as any).spacecraftId ?? null,
          r.title,
          (r as any).category ?? 'general',
          (r as any).tags ?? [],
          (r as any).content ?? '',
          (r as any).publishedAt ?? new Date(0),
        ),
    );
  }

  async findById(id: string): Promise<OpsDocument | null> {
    const r = await this.prisma.opsDocument.findUnique({ where: { id } });
    if (!r) return null;
    return new OpsDocument(
      r.id,
      (r as any).spacecraftId ?? null,
      r.title,
      (r as any).category ?? 'general',
      (r as any).tags ?? [],
      (r as any).content ?? '',
      (r as any).publishedAt ?? new Date(0),
    );
  }
}
