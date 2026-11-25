
import pool from "../config/database";

export interface CreateProjectInput {
  name: string;
  description?: string;
}

// CREATE PROJECT AND ASSIGN THE CREATOR AS OWNER
export const createProject = async (
  data: CreateProjectInput,
  userId: number
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const projectResult = await client.query(
      `INSERT INTO projects (user_id, name, description)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, name, description, created_at`,
      [userId, data.name.trim(), data.description?.trim() ?? null]
    );

    const project = projectResult.rows[0];

    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'owner')`,
      [project.id, userId]
    );

    await client.query("COMMIT");

    return {
      id: Number(project.id),
      userId: Number(project.user_id),
      name: project.name,
      description: project.description,
      role: "owner",
      createdAt: project.created_at
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// GET ALL PROJECTS ACCESSIBLE TO A USER
export const getUserProjects = async (userId: number) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.description,
       p.created_at,
       pm.role
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE pm.user_id = $1
     ORDER BY p.created_at DESC`,
    [userId]
  );

  return result.rows.map((row) => ({
    id: Number(row.id),
    name: row.name,
    description: row.description,
    role: row.role,
    createdAt: row.created_at
  }));
};

 // GET A SINGLE PROJECT ACCESSIBLE TO A USER
export const getProjectById = async (
  projectId: number,
  userId: number
) => {
  const result = await pool.query(
    `SELECT
       p.id,
       p.name,
       p.description,
       p.created_at,
       pm.role
     FROM projects p
     JOIN project_members pm ON pm.project_id = p.id
     WHERE p.id = $1 AND pm.user_id = $2`,
    [projectId, userId]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    role: row.role,
    createdAt: row.created_at
  };
};

 // UPDATE PROJECT (OWNER ONLY)
export const updateProject = async (
  projectId: number,
  userId: number,
  data: { name?: string; description?: string }
) => {
  const result = await pool.query(
    `UPDATE projects p
     SET name = COALESCE($3, p.name),
         description = CASE
           WHEN $4::boolean THEN $5
           ELSE p.description
         END
     WHERE p.id = $1
       AND EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id = $2
           AND pm.role = 'owner'
       )
     RETURNING p.id, p.name, p.description, p.created_at`,
    [
      projectId,
      userId,
      data.name?.trim() ?? null,
      data.description !== undefined,
      data.description?.trim() ?? null
    ]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const row = result.rows[0];

  return {
    id: Number(row.id),
    name: row.name,
    description: row.description,
    createdAt: row.created_at
  };
};

// DELETE PROJECT (OWNER ONLY)
export const deleteProject = async (
  projectId: number,
  userId: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM projects p
     WHERE p.id = $1
       AND EXISTS (
         SELECT 1
         FROM project_members pm
         WHERE pm.project_id = p.id
           AND pm.user_id = $2
           AND pm.role = 'owner'
       )`,
    [projectId, userId]
  );

  return (result.rowCount ?? 0) > 0;
};

export type ProjectRole = "member" | "viewer";

// ADD A MEMBER TO A PROJECT (OWNER ONLY)
export const addProjectMember = async (
  projectId: number,
  ownerId: number,
  email: string,
  role: ProjectRole
) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

   const ownerCheck = await client.query(
  `SELECT p.id
   FROM projects p
   JOIN project_members pm ON pm.project_id = p.id
   WHERE p.id = $1
     AND pm.user_id = $2
     AND pm.role = 'owner'
   FOR UPDATE OF p`,
  [projectId, ownerId]
);

    if (ownerCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const userResult = await client.query(
      `SELECT id, name, email
       FROM users
       WHERE email = $1`,
      [email.trim().toLowerCase()]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const user = userResult.rows[0];

    const memberResult = await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, role`,
      [projectId, user.id, role]
    );

    await client.query("COMMIT");

    return {
      id: Number(memberResult.rows[0].id),
      userId: Number(user.id),
      name: user.name,
      email: user.email,
      role: memberResult.rows[0].role
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// CHANGE A MEMBER'S ROLE (OWNER ONLY)
export const updateProjectMemberRole = async (
  projectId: number,
  ownerId: number,
  memberId: number,
  role: ProjectRole
) => {
  const result = await pool.query(
    `UPDATE project_members pm
     SET role = $4
     WHERE pm.project_id = $1
       AND pm.user_id = $3
       AND pm.role <> 'owner'
       AND EXISTS (
         SELECT 1
         FROM project_members owner
         WHERE owner.project_id = $1
           AND owner.user_id = $2
           AND owner.role = 'owner'
       )
     RETURNING pm.user_id, pm.role`,
    [projectId, ownerId, memberId, role]
  );

  if (result.rows.length === 0) {
    return null;
  }

  return {
    userId: Number(result.rows[0].user_id),
    role: result.rows[0].role
  };
};

// REMOVE A MEMBER (OWNER ONLY)
export const removeProjectMember = async (
  projectId: number,
  ownerId: number,
  memberId: number
): Promise<boolean> => {
  const result = await pool.query(
    `DELETE FROM project_members pm
     WHERE pm.project_id = $1
       AND pm.user_id = $3
       AND pm.role <> 'owner'
       AND EXISTS (
         SELECT 1
         FROM project_members owner
         WHERE owner.project_id = $1
           AND owner.user_id = $2
           AND owner.role = 'owner'
       )`,
    [projectId, ownerId, memberId]
  );

  return (result.rowCount ?? 0) > 0;
};


// GET PROJECT MEMBERS (PROJECT MEMBERS ONLY)
export const getProjectMembers = async (
  projectId: number,
  userId: number
) => {
  const result = await pool.query(
    `SELECT
       u.id AS user_id,
       u.name,
       u.email,
       pm.role,
       pm.created_at
     FROM project_members pm
     JOIN users u ON u.id = pm.user_id
     WHERE pm.project_id = $1
       AND EXISTS (
         SELECT 1
         FROM project_members access
         WHERE access.project_id = $1
           AND access.user_id = $2
       )
     ORDER BY
       CASE pm.role
         WHEN 'owner' THEN 1
         WHEN 'member' THEN 2
         WHEN 'viewer' THEN 3
       END,
       u.name ASC`,
    [projectId, userId]
  );

  return result.rows.map((row) => ({
    userId: Number(row.user_id),
    name: row.name,
    email: row.email,
    role: row.role,
    joinedAt: row.created_at
  }));
};
