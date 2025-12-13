-- Add new columns to OpsDocument to align with domain entity
ALTER TABLE "OpsDocument"
ADD COLUMN IF NOT EXISTS "spacecraftId" TEXT,
ADD COLUMN IF NOT EXISTS "category" TEXT NOT NULL DEFAULT 'general',
ADD COLUMN IF NOT EXISTS "publishedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW();


