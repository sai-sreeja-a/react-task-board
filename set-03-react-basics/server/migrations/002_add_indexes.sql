
-- Index projects by owner
CREATE INDEX idx_projects_user_id
ON projects(user_id);


-- Index tasks by status
CREATE INDEX idx_tasks_status
ON tasks(status);

-- Composite index for filtering tasks within a project by status
CREATE INDEX idx_tasks_project_status
ON tasks(project_id, status);

-- Index comments by task
CREATE INDEX idx_comments_task_id
ON comments(task_id);

-- Index comments by user
CREATE INDEX idx_comments_user_id
ON comments(user_id);

-- Index audit logs by task and creation time
CREATE INDEX idx_audit_logs_task_created
ON audit_logs(task_id, created_at DESC);

-- Index task_tags by tag
CREATE INDEX idx_task_tags_tag_id
ON task_tags(tag_id);
