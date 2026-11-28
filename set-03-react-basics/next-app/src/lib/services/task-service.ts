import "server-only";

import pool from "@/lib/db";

export type TaskStatus = "todo" | "in-progress" | "done";

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: TaskStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskInput {
  projectId: string;
  title: string;
  description: string;
  status?: TaskStatus;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
}

export interface TaskQueryOptions {
  page: number;
  limit: number;
  projectId?: string;
  status?: TaskStatus;
  search?: string;
  sortBy: "title" | "createdAt" | "updatedAt";
  order: "asc" | "desc";
}

interface TaskRow {
  id: string;
  project_id: string;
  title: string;
  description: string | null;
  status: string;
  created_at: Date | string;
  updated_at: Date | string;
}

function mapTask(row: TaskRow): Task {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    title: row.title,
    description: row.description ?? "",
    status:
      row.status === "in_progress"
        ? "in-progress"
        : (row.status as TaskStatus),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}

function toDatabaseStatus(status: TaskStatus): string {
  return status === "in-progress" ? "in_progress" : status;
}

function createError(message: string, status: number) {
  const error = new Error(message) as Error & { status: number };
  error.status = status;
  return error;
}

async function getProjectRole(projectId: string, userId: string) {
  const result = await pool.query<{ role: string }>(
    `SELECT role
     FROM project_members
     WHERE project_id = $1 AND user_id = $2`,
    [projectId, userId]
  );

  return result.rows[0]?.role ?? null;
}

async function getTaskRole(taskId: string, userId: string) {
  const result = await pool.query<{ role: string }>(
    `SELECT pm.role
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id
     WHERE t.id = $1 AND pm.user_id = $2`,
    [taskId, userId]
  );

  return result.rows[0]?.role ?? null;
}

function requireWriteRole(role: string | null) {
  if (!role) {
    throw createError("Task or project not found", 404);
  }

  if (!["owner", "member"].includes(role)) {
    throw createError(
      "You do not have permission to modify tasks",
      403
    );
  }
}
// CREATE TASK
export async function createTask(
  data: CreateTaskInput,
  userId: string
): Promise<Task> {
  const role = await getProjectRole(data.projectId, userId);

  if (!role) {
    throw createError("Project not found", 404);
  }

  requireWriteRole(role);

  const result = await pool.query<TaskRow>(
    `INSERT INTO tasks (project_id, title, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING
       id::text AS id,
       project_id::text AS project_id,
       title,
       description,
       status,
       created_at,
       updated_at`,
    [
      data.projectId,
      data.title,
      data.description,
      toDatabaseStatus(data.status ?? "todo"),
    ]
  );

  return mapTask(result.rows[0]);
}
// GET ALL TASKS ACCESSIBLE TO THE USER
export async function getAllTasks(
  options: TaskQueryOptions,
  userId: string
) {
  const conditions: string[] = ["pm.user_id = $1"];
  const values: unknown[] = [userId];

  if (options.projectId !== undefined) {
    values.push(options.projectId);
    conditions.push(`t.project_id = $${values.length}`);
  }

  if (options.status) {
    values.push(toDatabaseStatus(options.status));
    conditions.push(`t.status = $${values.length}`);
  }

  if (options.search?.trim()) {
    values.push(`%${options.search.trim()}%`);
    conditions.push(`t.title ILIKE $${values.length}`);
  }

  const whereClause = `WHERE ${conditions.join(" AND ")}`;

  const countResult = await pool.query<{ count: string }>(
    `SELECT COUNT(*)
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id
     ${whereClause}`,
    values
  );

  const total = Number(countResult.rows[0].count);

  const sortColumns = {
    title: "t.title",
    createdAt: "t.created_at",
    updatedAt: "t.updated_at",
  };

  const sortColumn = sortColumns[options.sortBy];
  const sortOrder = options.order === "asc" ? "ASC" : "DESC";

  const offset = (options.page - 1) * options.limit;
  const queryValues = [...values, options.limit, offset];

  const result = await pool.query<TaskRow>(
    `SELECT
       t.id::text AS id,
       t.project_id::text AS project_id,
       t.title,
       t.description,
       t.status,
       t.created_at,
       t.updated_at
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id
     ${whereClause}
     ORDER BY ${sortColumn} ${sortOrder}
     LIMIT $${values.length + 1}
     OFFSET $${values.length + 2}`,
    queryValues
  );

  return {
    tasks: result.rows.map(mapTask),
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit),
  };
}
// GET TASK BY ID
export async function getTaskById(
  id: string,
  userId: string
): Promise<Task | null> {
  const result = await pool.query<TaskRow>(
    `SELECT
       t.id::text AS id,
       t.project_id::text AS project_id,
       t.title,
       t.description,
       t.status,
       t.created_at,
       t.updated_at
     FROM tasks t
     JOIN project_members pm ON pm.project_id = t.project_id
     WHERE t.id = $1 AND pm.user_id = $2`,
    [id, userId]
  );

  return result.rows.length ? mapTask(result.rows[0]) : null;
}
// UPDATE TASK
export async function updateTask(
  id: string,
  data: UpdateTaskInput,
  userId: string
): Promise<Task | null> {
  const role = await getTaskRole(id, userId);

  requireWriteRole(role);

  const columnMap = {
    title: "title",
    description: "description",
    status: "status",
  } as const;

  const updates: string[] = [];
  const values: unknown[] = [];

  for (const key of Object.keys(data) as (keyof UpdateTaskInput)[]) {
    const value = data[key];

    if (value === undefined) continue;

    values.push(
      key === "status"
        ? toDatabaseStatus(value as TaskStatus)
        : value
    );

    updates.push(`${columnMap[key]} = $${values.length}`);
  }

  if (updates.length === 0) {
    throw createError("At least one field must be provided", 400);
  }

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const result = await pool.query<TaskRow>(
    `UPDATE tasks
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING
       id::text AS id,
       project_id::text AS project_id,
       title,
       description,
       status,
       created_at,
       updated_at`,
    values
  );

  return result.rows.length ? mapTask(result.rows[0]) : null;
}
// DELETE TASK
export async function deleteTask(
  id: string,
  userId: string
): Promise<boolean> {
  const role = await getTaskRole(id, userId);

  requireWriteRole(role);

  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1",
    [id]
  );

  return (result.rowCount ?? 0) > 0;
}
// MOVE TASK BETWEEN PROJECTS
export async function moveTaskToProject(
  taskId: string,
  newProjectId: string,
  userId: string
): Promise<Task> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const taskResult = await client.query<{
      id: string;
      project_id: string;
    }>(
      `SELECT id::text AS id, project_id::text AS project_id
       FROM tasks
       WHERE id = $1
       FOR UPDATE`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw createError("Task not found", 404);
    }

    const oldProjectId = taskResult.rows[0].project_id;

    const sourceResult = await client.query<{ role: string }>(
      `SELECT role
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [oldProjectId, userId]
    );

    const destinationResult = await client.query<{ role: string }>(
      `SELECT role
       FROM project_members
       WHERE project_id = $1 AND user_id = $2`,
      [newProjectId, userId]
    );

    requireWriteRole(sourceResult.rows[0]?.role ?? null);
    requireWriteRole(destinationResult.rows[0]?.role ?? null);

    const updateResult = await client.query<TaskRow>(
      `UPDATE tasks
       SET project_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING
         id::text AS id,
         project_id::text AS project_id,
         title,
         description,
         status,
         created_at,
         updated_at`,
      [newProjectId, taskId]
    );

    await client.query(
      `INSERT INTO audit_logs
       (task_id, user_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [
        taskId,
        userId,
        "TASK_MOVED",
        JSON.stringify({ oldProjectId, newProjectId }),
      ]
    );

    await client.query("COMMIT");

    return mapTask(updateResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}