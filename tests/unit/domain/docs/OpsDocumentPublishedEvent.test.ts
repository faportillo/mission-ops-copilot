import { describe, it, expect } from 'vitest';
import { OpsDocument } from '../../../../src/domain/docs/OpsDocument.js';
import { OpsDocumentPublishedEvent } from '../../../../src/domain/docs/OpsDocumentPublishedEvent.js';

describe('OpsDocument domain events', () => {
  it('publishing an OpsDocument records a single OpsDocumentPublished event', () => {
    const doc = OpsDocument.publish({
      id: 'doc-1',
      title: 'Checklist',
      content: 'Do A, then B',
      tags: ['checklist', 'ops'],
      category: 'procedures',
    });

    const events = doc.pullDomainEvents();
    expect(events.length).toBe(1);
    const evt = events[0] as OpsDocumentPublishedEvent;
    expect(evt.eventType).toBe('OpsDocumentPublished');
    expect(evt.documentId).toBe('doc-1');
    expect(evt.spacecraftId).toBeNull();
    expect(evt.category).toBe('procedures');
    expect(evt.tags).toEqual(['checklist', 'ops']);
    expect(evt.occurredAt instanceof Date).toBe(true);
  });
});
