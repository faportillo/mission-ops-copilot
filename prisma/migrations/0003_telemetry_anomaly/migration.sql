-- CreateTable TelemetryAnomaly
CREATE TABLE IF NOT EXISTS "TelemetryAnomaly" (
  "id" TEXT PRIMARY KEY,
  "spacecraftId" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "parameter" TEXT NOT NULL,
  "value" JSONB NOT NULL,
  "severity" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "detectedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "windowStart" TIMESTAMPTZ,
  "windowEnd" TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS "TelemetryAnomaly_spacecraftId_timestamp_idx"
  ON "TelemetryAnomaly" ("spacecraftId", "timestamp" DESC);

CREATE UNIQUE INDEX IF NOT EXISTS "TelemetryAnomaly_unique_triplet"
  ON "TelemetryAnomaly" ("spacecraftId", "parameter", "timestamp");

