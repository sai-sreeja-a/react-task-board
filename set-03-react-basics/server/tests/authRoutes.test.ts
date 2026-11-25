
import "dotenv/config";
import request from "supertest";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import app from "../src/app";
import pool from "../src/config/database";

const suffix = crypto.randomBytes(6).toString("hex");
const baselineEmail = `auth-test-${suffix}@example.com`;
const signupEmail = `signup-test-${suffix}@example.com`;

const initialPassword = "InitialPassword123!";
const newPassword = "UpdatedPassword456!";

const baselineAgent = request.agent(app);

let resetToken = "";

beforeAll(async () => {
  const passwordHash = await bcrypt.hash(initialPassword, 12);

  await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)`,
    ["Auth Test User", baselineEmail, passwordHash]
  );
});

afterAll(async () => {
  await pool.query(
    `DELETE FROM users
     WHERE email = ANY($1::text[])`,
    [[baselineEmail, signupEmail]]
  );

  await pool.end();
});

describe("Authentication API Tests", () => {
  test("signup should create an account, project and session", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Signup Test User",
        email: signupEmail,
        password: "SignupPassword123!"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.user.email).toBe(signupEmail);

    expect(response.headers["set-cookie"]?.[0]).toMatch(/HttpOnly/i);

    const result = await pool.query(
      `SELECT p.id, pm.role
       FROM projects p
       JOIN project_members pm ON pm.project_id = p.id
       WHERE p.user_id = (
         SELECT id FROM users WHERE email = $1
       )
       AND pm.user_id = p.user_id`,
      [signupEmail]
    );

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].role).toBe("owner");
  });

  test("signup should reject a duplicate email", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "Duplicate User",
        email: signupEmail,
        password: "SignupPassword123!"
      });

    expect(response.status).toBe(409);
  });
  test("signup should reject invalid input", async () => {
    const response = await request(app)
      .post("/api/auth/signup")
      .send({
        name: "",
        email: "invalid-email",
        password: "short"
      });

    expect(response.status).toBe(400);
  });
  test("signup should reject passwords longer than 72 bytes", async () => {
  const response = await request(app)
    .post("/api/auth/signup")
    .send({
      name: "Long Password User",
      email: `long-password-${suffix}@example.com`,
      password: "a".repeat(73)
    });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
});

  test("login should reject incorrect credentials", async () => {
    const response = await request(app)
      .post("/api/auth/login")
      .send({
        email: baselineEmail,
        password: "WrongPassword123!"
      });

    expect(response.status).toBe(401);
  });

  test("login and logout should create and revoke a session", async () => {
    const loginResponse = await baselineAgent
      .post("/api/auth/login")
      .send({
        email: baselineEmail,
        password: initialPassword
      });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.headers["set-cookie"]?.[0]).toMatch(/HttpOnly/i);

    const meResponse = await baselineAgent.get("/api/auth/me");
    expect(meResponse.status).toBe(200);

    const logoutResponse = await baselineAgent.post("/api/auth/logout");
    expect(logoutResponse.status).toBe(200);

    const afterLogout = await baselineAgent.get("/api/auth/me");
    expect(afterLogout.status).toBe(401);
  });

  test("forgot password should not reveal whether an email exists", async () => {
    const infoSpy = jest
      .spyOn(console, "info")
      .mockImplementation(() => {});

    try {
      const existingResponse = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: baselineEmail });

      const unknownResponse = await request(app)
        .post("/api/auth/forgot-password")
        .send({ email: `unknown-${suffix}@example.com` });

      expect(existingResponse.status).toBe(200);
      expect(unknownResponse.status).toBe(200);

      expect(existingResponse.body.message).toBe(
        unknownResponse.body.message
      );

      const resetLog = infoSpy.mock.calls.find(
        (call) => call[0] === "Password reset link:"
      );

      const resetLink = String(resetLog?.[1] ?? "");
      const tokenMatch = resetLink.match(/[?&]token=([a-f0-9]{64})/i);

      expect(tokenMatch).not.toBeNull();

      if (!tokenMatch) {
        throw new Error(
          "Password reset token was not found in the development log"
        );
      }

      resetToken = tokenMatch[1];
    } finally {
      infoSpy.mockRestore();
    }
  });

  test("password reset should change the password and revoke existing sessions", async () => {
    const resetAgent = request.agent(app);

    const loginResponse = await resetAgent
      .post("/api/auth/login")
      .send({
        email: baselineEmail,
        password: initialPassword
      });

    expect(loginResponse.status).toBe(200);

    const beforeReset = await resetAgent.get("/api/auth/me");
    expect(beforeReset.status).toBe(200);

    const resetResponse = await request(app)
      .post("/api/auth/reset-password")
      .send({
        token: resetToken,
        newPassword
      });

    expect(resetResponse.status).toBe(200);
    expect(resetResponse.body.success).toBe(true);

    const oldSessionResponse = await resetAgent.get("/api/auth/me");
    expect(oldSessionResponse.status).toBe(401);

    const newLoginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: baselineEmail,
        password: newPassword
      });

    expect(newLoginResponse.status).toBe(200);
  });
});
