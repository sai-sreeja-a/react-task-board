CREATE INDEX idx_tasks_project_status_created
ON tasks (project_id, status, created_at DESC);