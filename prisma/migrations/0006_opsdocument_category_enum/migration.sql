DO $$ BEGIN
  CREATE TYPE "OpsDocumentCategory" AS ENUM (
    'operations_procedure',
    'anomaly_report',
    'spacecraft_configuration',
    'mission_policy',
    'telemetry_definition',
    'mission_planning',
    'maneuver_record',
    'conjunction_assessment',
    'system_design',
    'operations_log',
    'external_communication',
    'general'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE "OpsDocument"
  ALTER COLUMN "category" DROP DEFAULT,
  ALTER COLUMN "category" TYPE "OpsDocumentCategory" USING ("category"::text::"OpsDocumentCategory"),
  ALTER COLUMN "category" SET DEFAULT 'general';


