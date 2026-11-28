import "server-only";

import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { createSession } from "@/lib/auth";

export interface AuthResult {
  id: string;
  name: string;
  email: string;
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<AuthResult> {
  const normalizedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const client = await pool.connect();

  let user: AuthResult;

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id::text AS id, name, email`,
      [normalizedName, normalizedEmail, passwordHash]
    );

    user = userResult.rows[0];

    const projectResult = await client.query(
      `INSERT INTO projects (user_id, name)
       VALUES ($1, $2)
       RETURNING id`,
      [user.id, "My First Project"]
    );

    await client.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, $3)`,
      [projectResult.rows[0].id, user.id, "owner"]
    );

    await client.query("COMMIT");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }

  await createSession(user.id);

  return user;
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthResult | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id::text AS id, name, email, password_hash
     FROM users
     WHERE email = $1`,
    [normalizedEmail]
  );

  if (result.rows.length === 0) {
    return null;
  }

  const databaseUser = result.rows[0];

  const passwordMatches = await bcrypt.compare(
    password,
    databaseUser.password_hash
  );

  if (!passwordMatches) {
    return null;
  }

  const user: AuthResult = {
    id: databaseUser.id,
    name: databaseUser.name,
    email: databaseUser.email,
  };

  const membershipResult = await pool.query(
    `SELECT 1
     FROM project_members
     WHERE user_id = $1
     LIMIT 1`,
    [user.id]
  );

  if (membershipResult.rows.length === 0) {
    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      const projectResult = await client.query(
        `INSERT INTO projects (user_id, name)
         VALUES ($1, $2)
         RETURNING id`,
        [user.id, "My First Project"]
      );

      await client.query(
        `INSERT INTO project_members (project_id, user_id, role)
         VALUES ($1, $2, $3)`,
        [projectResult.rows[0].id, user.id, "owner"]
      );

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  await createSession(user.id);

  return user;
}
