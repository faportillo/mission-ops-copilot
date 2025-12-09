export class DomainError extends Error {
  public readonly name: string;
  constructor(message: string) {
    super(message);
    this.name = new.target.name;
  }
}

export class TelemetryNotFoundError extends DomainError {}
export class InvalidTelemetryError extends DomainError {}


