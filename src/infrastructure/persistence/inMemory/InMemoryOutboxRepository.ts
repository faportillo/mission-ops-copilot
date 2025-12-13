import type { NewOutboxMessage, OutboxMessage, OutboxRepository } from '../OutboxRepository.js';

export class InMemoryOutboxRepository implements OutboxRepository {
  private storage: OutboxMessage[] = [];

  async enqueue(message: NewOutboxMessage): Promise<OutboxMessage> {
    const now = new Date();
    const created: OutboxMessage = {
      id: `outbox_${this.storage.length + 1}_${now.getTime()}`,
      type: message.type,
      topic: message.topic,
      key: message.key ?? null,
      headers: message.headers ?? null,
      payload: message.payload,
      availableAt: message.availableAt ?? now,
      createdAt: now,
      processed_at: null,
      retries: 0,
      lastError: null,
    };
    this.storage.push(created);
    return created;
  }

  async fetchPending(limit: number, now: Date): Promise<OutboxMessage[]> {
    return this.storage
      .filter((m) => m.processed_at == null && m.availableAt <= now)
      .slice(0, limit);
  }

  async markProcessed(id: string, processedAt: Date): Promise<void> {
    const msg = this.storage.find((m) => m.id === id);
    if (msg) {
      msg.processed_at = processedAt;
      msg.lastError = null;
    }
  }

  async recordFailure(id: string, errorMessage: string, nextAvailableAt: Date): Promise<void> {
    const msg = this.storage.find((m) => m.id === id);
    if (msg) {
      msg.retries += 1;
      msg.lastError = errorMessage;
      msg.availableAt = nextAvailableAt;
    }
  }
}
