import "server-only";

import pool from "@/lib/db";

export interface Comment {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: string;
}

interface CommentRow {
  id: string;
  task_id: string;
  user_id: string;
  user_name: string;
  content: string;
  created_at: Date | string;
}

function mapComment(row: CommentRow): Comment {
  return {
    id: String(row.id),
    taskId: String(row.task_id),
    userId: String(row.user_id),
    userName: row.user_name,
    content: row.content,
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export async function getTaskComments(
  taskId: string,
  userId: string
): Promise<Comment[]> {
  const result = await pool.query<CommentRow>(
    `SELECT
       c.id::text AS id,
       c.task_id::text AS task_id,
       c.user_id::text AS user_id,
       u.name AS user_name,
       c.content,
       c.created_at
     FROM comments c
     INNER JOIN users u ON u.id = c.user_id
     INNER JOIN tasks t ON t.id = c.task_id
     INNER JOIN project_members pm ON pm.project_id = t.project_id
     WHERE c.task_id = $1
       AND pm.user_id = $2
     ORDER BY c.created_at ASC`,
    [taskId, userId]
  );

  return result.rows.map(mapComment);
}

export async function createComment(
  taskId: string,
  userId: string,
  content: string
): Promise<Comment> {
  const result = await pool.query<CommentRow>(
    `INSERT INTO comments (task_id, user_id, content)
     SELECT t.id, $2, $3
     FROM tasks t
     INNER JOIN project_members pm ON pm.project_id = t.project_id
     WHERE t.id = $1
       AND pm.user_id = $2
     RETURNING
       id::text AS id,
       task_id::text AS task_id,
       user_id::text AS user_id,
       (SELECT name FROM users WHERE id = $2) AS user_name,
       content,
       created_at`,
    [taskId, userId, content]
  );

  if (!result.rows[0]) {
    throw new Error("Task not found or you do not have access.");
  }

  return mapComment(result.rows[0]);
}