// src/domain/common/BaseEntity.ts
import type { DomainEvent } from './DomainEvent';

export abstract class BaseEntity<TId = string> {
  private _domainEvents: DomainEvent[] = [];

  protected constructor(public readonly id: TId) {}

  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event);
  }

  pullDomainEvents(): DomainEvent[] {
    const events = this._domainEvents;
    this._domainEvents = [];
    return events;
  }

  equals(other?: BaseEntity<TId>): boolean {
    if (!other) return false;
    return this.id === other.id && this.constructor === other.constructor;
  }
}
