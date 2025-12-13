// src/domain/docs/OpsDocument.ts
import { BaseEntity } from '../common/BaseEntity';
import { OpsDocumentPublishedEvent } from './OpsDocumentPublishedEvent.js';

export type OpsDocumentCategory =
  | 'operations_procedure'
  | 'anomaly_report'
  | 'spacecraft_configuration'
  | 'mission_policy'
  | 'telemetry_definition'
  | 'mission_planning'
  | 'maneuver_record'
  | 'conjunction_assessment'
  | 'system_design'
  | 'operations_log'
  | 'external_communication'
  | 'general';

export class OpsDocument extends BaseEntity {
  constructor(
    public readonly id: string,
    public readonly spacecraftId: string | null,
    public title: string,
    public category: OpsDocumentCategory,
    public tags: string[],
    public content: string,
    public publishedAt: Date,
  ) {
    super(id);
  }

  static publish(props: {
    id: string;
    spacecraftId?: string | null;
    title: string;
    category: OpsDocumentCategory;
    tags?: string[];
    content: string;
    publishedAt?: Date;
  }): OpsDocument {
    const doc = new OpsDocument(
      props.id,
      props.spacecraftId ?? null,
      props.title,
      props.category ?? 'general',
      props.tags ?? [],
      props.content,
      props.publishedAt ?? new Date(),
    );

    doc.addDomainEvent(
      new OpsDocumentPublishedEvent(doc.id, doc.spacecraftId, doc.category, doc.tags),
    );

    return doc;
  }
}
