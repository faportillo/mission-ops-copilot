-- Create Spacecraft table
CREATE TABLE IF NOT EXISTS "Spacecraft" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "missionType" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create SpacecraftConfig table (config as JSONB)
CREATE TABLE IF NOT EXISTS "SpacecraftConfig" (
  "id" TEXT PRIMARY KEY,
  "spacecraftId" TEXT NOT NULL UNIQUE,
  "config" JSONB NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'approved',
  "source" TEXT,
  "createdAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT "SpacecraftConfig_spacecraftId_fkey"
    FOREIGN KEY ("spacecraftId") REFERENCES "Spacecraft"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Trigger to update updatedAt on Spacecraft
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW."updatedAt" = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS spacecraft_set_updated_at ON "Spacecraft";
CREATE TRIGGER spacecraft_set_updated_at
BEFORE UPDATE ON "Spacecraft"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

DROP TRIGGER IF EXISTS spacecraft_config_set_updated_at ON "SpacecraftConfig";
CREATE TRIGGER spacecraft_config_set_updated_at
BEFORE UPDATE ON "SpacecraftConfig"
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
