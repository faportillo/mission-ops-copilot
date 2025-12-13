// src/application/docs/CreateOpsDocumentUseCase.ts
import { randomUUID } from 'crypto';
import { BaseUseCase } from '../BaseUseCase';
import { transactional } from '../TransactionalDecorator';
import type { TransactionalContext } from '../tx/TransactionManager';
import { OpsDocument } from '../../domain/docs/OpsDocument.js';
import type { OpsDocumentCategory } from '../../domain/docs/OpsDocument.js';

export interface CreateOpsDocumentInput {
  id?: string;
  spacecraftId?: string | null;
  title: string;
  category?: OpsDocumentCategory;
  content: string;
  tags?: string[];
}

export interface CreateOpsDocumentOutput {
  documentId: string;
}

export class CreateOpsDocumentUseCase extends BaseUseCase {
  constructor(txManager: { withTransaction: BaseUseCase['txManager']['withTransaction'] }) {
    // Accept any TransactionManager-compatible instance
    // to keep wiring simple across backends.
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    super(txManager);
  }

  // Public API: single-arg form
  async execute(input: CreateOpsDocumentInput): Promise<CreateOpsDocumentOutput>;
  // Implementation signature: used by the transactional decorator
  @transactional()
  async execute(
    a: TransactionalContext | CreateOpsDocumentInput,
    b?: CreateOpsDocumentInput,
  ): Promise<CreateOpsDocumentOutput> {
    const ctx = (b ? (a as TransactionalContext) : undefined)!;
    const input = (b ?? (a as CreateOpsDocumentInput)) as CreateOpsDocumentInput;

    const id = input.id ?? randomUUID();
    const doc = OpsDocument.publish({
      id,
      spacecraftId: input.spacecraftId ?? null,
      title: input.title,
      category: input.category ?? 'general',
      content: input.content,
      tags: input.tags ?? [],
    });

    await ctx.docs.save(doc);

    const events = doc.pullDomainEvents();
    for (const evt of events) {
      await ctx.outbox.enqueue({
        type: evt.eventType,
        topic: 'domain.OpsDocumentPublished',
        key: doc.id,
        payload: evt,
      });
    }

    return { documentId: id };
  }
}
