BEGIN;
-- Create a dedicated seed user
INSERT INTO users (name, email, password_hash)
VALUES (
    'Seed User',
    'seed.user@example.com',
    'not-a-real-login-password'
)
ON CONFLICT (email) DO NOTHING;

-- Create 10 projects for the seed user
INSERT INTO projects (user_id, name, description)
SELECT
    u.id,
    'Seed Project ' || project_number,
    'Project generated for database performance testing'
FROM users u
CROSS JOIN generate_series(1, 10) AS project_number
WHERE u.email = 'seed.user@example.com'
AND NOT EXISTS (
    SELECT 1
    FROM projects p
    WHERE p.user_id = u.id
      AND p.name = 'Seed Project ' || project_number
);

-- Generate 100,000 tasks across the 10 seed projects
WITH seed_projects AS (
    SELECT
        id,
        ROW_NUMBER() OVER (ORDER BY id) AS project_number
    FROM projects
    WHERE name LIKE 'Seed Project %'
      AND user_id = (
          SELECT id
          FROM users
          WHERE email = 'seed.user@example.com'
      )
),
generated_tasks AS (
    SELECT
        task_number,
        ((task_number - 1) % 10) + 1 AS project_number
    FROM generate_series(1, 100000) AS task_number
)
INSERT INTO tasks (
    project_id,
    title,
    description,
    status,
    priority,
    created_at,
    updated_at
)
SELECT
    sp.id,
    'Seed Task ' || gt.task_number,
    'Generated task for PostgreSQL performance testing',
    CASE
        WHEN gt.task_number % 3 = 0 THEN 'done'
        WHEN gt.task_number % 3 = 1 THEN 'todo'
        ELSE 'in_progress'
    END,
    CASE
        WHEN gt.task_number % 3 = 0 THEN 'high'
        WHEN gt.task_number % 3 = 1 THEN 'medium'
        ELSE 'low'
    END,
    CURRENT_TIMESTAMP - (gt.task_number % 365) * INTERVAL '1 day',
    CURRENT_TIMESTAMP
FROM generated_tasks gt
JOIN seed_projects sp
    ON sp.project_number = gt.project_number
WHERE NOT EXISTS (
    SELECT 1
    FROM tasks existing
    WHERE existing.project_id = sp.id
      AND existing.title = 'Seed Task ' || gt.task_number
);
COMMIT;