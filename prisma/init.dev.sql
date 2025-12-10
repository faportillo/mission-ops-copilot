-- Dev-only initialization script for Postgres least-privilege roles
-- This runs once when the docker-compose Postgres volume is empty.

-- Create roles
DO
$$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mission_migrator') THEN
      CREATE ROLE mission_migrator LOGIN PASSWORD 'mission_migrator';
   END IF;
   IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'mission_app') THEN
      CREATE ROLE mission_app LOGIN PASSWORD 'mission_app';
   END IF;
END
$$;

-- Ensure current DB exists and is owned by migrator (compose sets POSTGRES_DB)
-- Grant permissions following least privilege in schema "app"
CREATE SCHEMA IF NOT EXISTS app AUTHORIZATION mission_migrator;
ALTER SCHEMA app OWNER TO mission_migrator;

-- App role needs to read/write but not alter structures
GRANT USAGE ON SCHEMA app TO mission_app;

-- Default privileges for future objects created by migrator in schema "app"
ALTER DEFAULT PRIVILEGES FOR USER mission_migrator IN SCHEMA app
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO mission_app;
ALTER DEFAULT PRIVILEGES FOR USER mission_migrator IN SCHEMA app
GRANT USAGE, SELECT ON SEQUENCES TO mission_app;

-- If tables are created before grants, you may also need to (no-op if none yet):
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA app TO mission_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA app TO mission_app;


