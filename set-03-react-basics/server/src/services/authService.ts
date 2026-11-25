import { createProject } from "./projectService";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import pool from "../config/database";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

export interface AuthResult {
  user: AuthUser;
  sessionToken: string;
}

// HASH A TOKEN
const hashToken = (token: string): string => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// CREATE A SECURE SESSION
const createSession = async (userId: number): Promise<string> => {
  const sessionToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(sessionToken);

  await pool.query(
    `INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
     VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '7 days')`,
    [userId, tokenHash]
  );

  return sessionToken;
};

// REGISTER USER
// REGISTER USER
export const registerUser = async (
  name: string,
  email: string,
  password: string
): Promise<AuthResult> => {
  const normalizedEmail = email.trim().toLowerCase();
  const passwordHash = await bcrypt.hash(password, 12);

  const result = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id, name, email`,
    [name.trim(), normalizedEmail, passwordHash]
  );

  const user: AuthUser = {
    id: Number(result.rows[0].id),
    name: result.rows[0].name,
    email: result.rows[0].email
  };

  await createProject({ name: "My First Project" }, user.id);

  const sessionToken = await createSession(user.id);

  return { user, sessionToken };
};
// LOGIN USER
// LOGIN USER
export const loginUser = async (
  email: string,
  password: string
): Promise<AuthResult | null> => {
  const normalizedEmail = email.trim().toLowerCase();

  const result = await pool.query(
    `SELECT id, name, email, password_hash
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

  const user: AuthUser = {
    id: Number(databaseUser.id),
    name: databaseUser.name,
    email: databaseUser.email
  };

  const projectResult = await pool.query(
    `SELECT 1 FROM project_members
     WHERE user_id = $1
     LIMIT 1`,
    [user.id]
  );

  if (projectResult.rows.length === 0) {
    await createProject({ name: "My First Project" }, user.id);
  }

  const sessionToken = await createSession(user.id);

  return { user, sessionToken };
};

// LOGOUT USER
export const logoutUser = async (sessionToken: string): Promise<void> => {
  const tokenHash = hashToken(sessionToken);

  await pool.query(
    `DELETE FROM user_sessions
     WHERE session_token_hash = $1`,
    [tokenHash]
  );
};

// GENERATE A PASSWORD RESET TOKEN
export const createPasswordResetToken = async (
  email: string
): Promise<string | null> => {
  const normalizedEmail = email.trim().toLowerCase();

  const resetToken = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(resetToken);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const userResult = await client.query(
      `SELECT id FROM users WHERE email = $1 FOR UPDATE`,
      [normalizedEmail]
    );

    if (userResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return null;
    }

    const userId = Number(userResult.rows[0].id);

    // Invalidate previous unused reset tokens
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE user_id = $1 AND used_at IS NULL`,
      [userId]
    );

    // Store only the hashed token
    await client.query(
      `INSERT INTO password_reset_tokens
       (user_id, token_hash, expires_at)
       VALUES ($1, $2, CURRENT_TIMESTAMP + INTERVAL '15 minutes')`,
      [userId, tokenHash]
    );

    await client.query("COMMIT");

    return resetToken;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

// RESET PASSWORD USING A VALID TOKEN
export const resetPassword = async (
  resetToken: string,
  newPassword: string
): Promise<boolean> => {
  const tokenHash = hashToken(resetToken);
  const passwordHash = await bcrypt.hash(newPassword, 12);

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const tokenResult = await client.query(
      `SELECT id, user_id
       FROM password_reset_tokens
       WHERE token_hash = $1
         AND used_at IS NULL
         AND expires_at > CURRENT_TIMESTAMP
       FOR UPDATE`,
      [tokenHash]
    );

    if (tokenResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return false;
    }

    const token = tokenResult.rows[0];

    // Update the user's password
    await client.query(
      `UPDATE users
       SET password_hash = $1
       WHERE id = $2`,
      [passwordHash, token.user_id]
    );

    // Mark the reset token as used
    await client.query(
      `UPDATE password_reset_tokens
       SET used_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [token.id]
    );

    // Invalidate all existing sessions
    await client.query(
      `DELETE FROM user_sessions
       WHERE user_id = $1`,
      [token.user_id]
    );

    await client.query("COMMIT");

    return true;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};
