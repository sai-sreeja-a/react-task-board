
import pool from "../config/database";
import {
  CreateTaskInput,
  UpdateTaskInput,
  TaskStatus
} from "../types/task";

export interface TaskQueryOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  sortBy: "title" | "createdAt" | "updatedAt";
  order: "asc" | "desc";
}

const mapTask = (row: any) => ({
  id: Number(row.id),
  projectId: Number(row.project_id),
  title: row.title,
  description: row.description ?? "",
  status: row.status === "in_progress" ? "in-progress" : row.status,
  createdAt: row.created_at,
  updatedAt: row.updated_at
});

const toDatabaseStatus = (status: TaskStatus) =>
  status === "in-progress" ? "in_progress" : status;

// CREATE TASK
export const createTask = async (data: CreateTaskInput) => {
  const result = await pool.query(
    `INSERT INTO tasks (project_id, title, description, status)
     VALUES ($1, $2, $3, $4)
     RETURNING id, project_id, title, description, status,
               created_at, updated_at`,
    [
      data.projectId,
      data.title,
      data.description,
      toDatabaseStatus(data.status ?? "todo")
    ]
  );

  return mapTask(result.rows[0]);
};

// GET ALL TASKS
export const getAllTasks = async (options: TaskQueryOptions) => {
  const conditions: string[] = [];
  const values: unknown[] = [];

  if (options.status) {
    values.push(toDatabaseStatus(options.status as TaskStatus));
    conditions.push(`status = $${values.length}`);
  }

  if (options.search?.trim()) {
    values.push(`%${options.search.trim()}%`);
    conditions.push(`title ILIKE $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const countResult = await pool.query(
    `SELECT COUNT(*) FROM tasks ${whereClause}`,
    values
  );

  const total = Number(countResult.rows[0].count);

  const sortColumns = {
    title: "title",
    createdAt: "created_at",
    updatedAt: "updated_at"
  };

  const sortColumn = sortColumns[options.sortBy];
  const sortOrder = options.order === "asc" ? "ASC" : "DESC";

  const offset = (options.page - 1) * options.limit;

  const queryValues = [...values, options.limit, offset];

  const result = await pool.query(
    `SELECT id, project_id, title, description, status,
            created_at, updated_at
     FROM tasks
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
    totalPages: Math.ceil(total / options.limit)
  };
};

// GET TASK BY ID
export const getTaskById = async (id: number) => {
  const result = await pool.query(
    `SELECT id, project_id, title, description, status,
            created_at, updated_at
     FROM tasks
     WHERE id = $1`,
    [id]
  );

  return result.rows.length ? mapTask(result.rows[0]) : null;
};

// UPDATE TASK
export const updateTask = async (
  id: number,
  data: UpdateTaskInput
) => {
  const columnMap = {
    title: "title",
    description: "description",
    status: "status"
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

  updates.push("updated_at = CURRENT_TIMESTAMP");
  values.push(id);

  const result = await pool.query(
    `UPDATE tasks
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING id, project_id, title, description, status,
               created_at, updated_at`,
    values
  );

  return result.rows.length ? mapTask(result.rows[0]) : null;
};

// DELETE TASK
export const deleteTask = async (id: number): Promise<boolean> => {
  const result = await pool.query(
    "DELETE FROM tasks WHERE id = $1",
    [id]
  );

  return (result.rowCount ?? 0) > 0;
};

// MOVE TASK BETWEEN PROJECTS (TRANSACTION)
export const moveTaskToProject = async (
  taskId: number,
  newProjectId: number,
  userId?: number
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // Lock the task while it is being moved
    const taskResult = await client.query(
      `SELECT id, project_id, title
       FROM tasks
       WHERE id = $1
       FOR UPDATE`,
      [taskId]
    );

    if (taskResult.rows.length === 0) {
      throw new Error("Task not found");
    }

    const oldProjectId = Number(taskResult.rows[0].project_id);

    // Update the task's project
    const updateResult = await client.query(
      `UPDATE tasks
       SET project_id = $1,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING id, project_id, title, description, status,
                 created_at, updated_at`,
      [newProjectId, taskId]
    );

    // Record the movement in the audit log
    await client.query(
      `INSERT INTO audit_logs
       (task_id, user_id, action, details)
       VALUES ($1, $2, $3, $4::jsonb)`,
      [
        taskId,
        userId ?? null,
        "TASK_MOVED",
        JSON.stringify({
          oldProjectId,
          newProjectId
        })
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
};
