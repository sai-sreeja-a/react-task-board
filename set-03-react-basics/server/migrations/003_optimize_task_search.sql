CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_tasks_title_trgm
ON tasks
USING GIN (title gin_trgm_ops);