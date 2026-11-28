import "server-only";

import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import pool from "@/lib/db";

const SESSION_COOKIE = "task_board_session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(userId: string): Promise<void> {
  const token = randomBytes(32).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(
    Date.now() + SESSION_DURATION_SECONDS * 1000
  );

  await pool.query(
    `INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
     VALUES ($1, $2, $3)`,
    [userId, tokenHash, expiresAt]
  );

  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_SECONDS,
  });
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashToken(token);

  const result = await pool.query<AuthUser>(
    `SELECT
       u.id::text AS id,
       u.name,
       u.email
     FROM users u
     INNER JOIN user_sessions s ON s.user_id = u.id
     WHERE s.session_token_hash = $1
       AND s.expires_at > CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function deleteSession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    await pool.query(
      "DELETE FROM user_sessions WHERE session_token_hash = $1",
      [hashToken(token)]
    );
  }

  cookieStore.delete(SESSION_COOKIE);
}
