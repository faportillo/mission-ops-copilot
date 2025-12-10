-- CreateTable TelemetrySnapshot
CREATE TABLE IF NOT EXISTS "TelemetrySnapshot" (
  "id" TEXT PRIMARY KEY,
  "spacecraftId" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "parameters" JSONB NOT NULL
);

-- Index for recent queries
CREATE INDEX IF NOT EXISTS "TelemetrySnapshot_spacecraftId_timestamp_idx"
  ON "TelemetrySnapshot" ("spacecraftId", "timestamp" DESC);

-- CreateTable MissionEvent
CREATE TABLE IF NOT EXISTS "MissionEvent" (
  "id" TEXT PRIMARY KEY,
  "spacecraftId" TEXT NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL,
  "type" TEXT NOT NULL,
  "severity" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "metadata" JSONB
);

CREATE INDEX IF NOT EXISTS "MissionEvent_spacecraftId_timestamp_idx"
  ON "MissionEvent" ("spacecraftId", "timestamp" DESC);

-- CreateTable OpsDocument
CREATE TABLE IF NOT EXISTS "OpsDocument" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "tags" TEXT[] NOT NULL
);


