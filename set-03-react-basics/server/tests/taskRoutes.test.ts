
import "dotenv/config";
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../src/app";
import pool from "../src/config/database";
import crypto from "crypto";

let testProjectId: number;

const agent = request.agent(app);

beforeAll(async () => {
  const password = "TestPassword123!";
  const passwordHash = await bcrypt.hash(password, 12);

  const userResult = await pool.query(
    `INSERT INTO users (name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING id`,
    ["Test User", "test-user@example.com", passwordHash]
  );

  const userId = Number(userResult.rows[0].id);

  const projectResult = await pool.query(
    `INSERT INTO projects (user_id, name)
     VALUES ($1, $2)
     RETURNING id`,
    [userId, "Test Project"]
  );

  testProjectId = Number(projectResult.rows[0].id);

  await pool.query(
    `INSERT INTO project_members (project_id, user_id, role)
     VALUES ($1, $2, 'owner')`,
    [testProjectId, userId]
  );

  const loginResponse = await agent
    .post("/api/auth/login")
    .send({
      email: "test-user@example.com",
      password
    });

  expect(loginResponse.status).toBe(200);
      
});

beforeEach(async () => {
  await pool.query(
    "DELETE FROM tasks WHERE project_id = $1",
    [testProjectId]
  );
});

afterAll(async () => {
  await pool.query(
    "DELETE FROM users WHERE email = $1",
    ["test-user@example.com"]
  );

  await pool.end();
});


describe("Task API Tests", () => {

  // 1. GET ALL TASKS
  test("GET /api/tasks should return an empty task list", async () => {
    const response = await agent.get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // 2. CREATE TASK
  test("POST /api/tasks should create a new task", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Test task",
  description: "Testing POST"
});

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Test task");
  });

  // 3. INVALID CREATE DATA
  test("POST /api/tasks should reject an empty title", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "",
  description: "Testing invalid data"
});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 4. GET TASK BY ID
  test("GET /api/tasks/:id should return a task", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Find me",
  description: "Testing GET by ID"
});

    const id = created.body.data.id;

    const response = await agent.get(`/api/tasks/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Find me");
  });

  // 5. GET MISSING TASK
  test("GET /api/tasks/:id should return 404 for missing task", async () => {
    const response = await agent.get("/api/tasks/999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 6. UPDATE TASK
  test("PUT /api/tasks/:id should update a task", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Old title",
  description: "Testing update"
});
    const id = created.body.data.id;

    const response = await agent
      .put(`/api/tasks/${id}`)
      .send({
        title: "Updated title"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated title");
  });

  // 7. INVALID UPDATE DATA
  test("PUT /api/tasks/:id should reject an empty body", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Test task",
  description: "Testing invalid update"
});
    const id = created.body.data.id;

    const response = await agent
      .put(`/api/tasks/${id}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 8. DELETE TASK
  test("DELETE /api/tasks/:id should delete a task", async () => {
    const created = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Delete me",
  description: "Testing DELETE"
});

    const id = created.body.data.id;

    const response = await agent.delete(`/api/tasks/${id}`);

    expect(response.status).toBe(204);

    const check = await agent.get(`/api/tasks/${id}`);

    expect(check.status).toBe(404);
  });

  // 9. PAGINATION
  test("GET /api/tasks should support pagination", async () => {
    await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "Task 1",
  description: "First task"
});

   await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "Task 2",
  description: "Second task"
});

    const response = await agent
      .get("/api/tasks?page=1&limit=1");

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1);
    expect(response.body.total).toBe(2);
    expect(response.body.totalPages).toBe(2);
  });

  // 10. FILTER BY STATUS
  test("GET /api/tasks should filter tasks by status", async () => {
    await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "Completed task",
  description: "Testing filter",
  status: "done"
});

    const response = await agent
      .get("/api/tasks?status=done");

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1);
    expect(response.body.tasks[0].status).toBe("done");
  });

  // 11. SORTING
  test("GET /api/tasks should sort tasks by title", async () => {
    await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "Zebra",
  description: "Last alphabetically"
});

    await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "Apple",
  description: "First alphabetically"
});

    const response = await agent
      .get("/api/tasks?sortBy=title&order=asc");

    expect(response.status).toBe(200);
    expect(response.body.tasks[0].title).toBe("Apple");
    expect(response.body.tasks[1].title).toBe("Zebra");
  });

  // 12. INVALID PAGINATION
  test("GET /api/tasks should reject invalid page numbers", async () => {
    const response = await agent
      .get("/api/tasks?page=0");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 13. INVALID SORTING
  test("GET /api/tasks should reject invalid sort fields", async () => {
    const response = await agent
      .get("/api/tasks?sortBy=description");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid sortBy value");
  });

  // 14. INVALID GET TASK ID
  test("GET /api/tasks/:id should reject an invalid task ID", async () => {
    const response = await agent.get("/api/tasks/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
  });

  // 15. INVALID PUT TASK ID
  test("PUT /api/tasks/:id should reject an invalid task ID", async () => {
    const response = await agent
      .put("/api/tasks/abc")
      .send({ title: "Updated" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
  });

  // 16. INVALID DELETE TASK ID
  test("DELETE /api/tasks/:id should reject an invalid task ID", async () => {
    const response = await agent.delete("/api/tasks/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
  });

  // 17. UPDATE MISSING TASK
  test("PUT /api/tasks/:id should return 404 for missing task", async () => {
    const response = await agent
      .put("/api/tasks/999")
      .send({ title: "Updated" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 18. DELETE MISSING TASK
  test("DELETE /api/tasks/:id should return 404 for missing task", async () => {
    const response = await agent.delete("/api/tasks/999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 19. INVALID POST STATUS
  test("POST /api/tasks should reject an invalid status", async () => {
    const response = await agent
      .post("/api/tasks")
     .send({
  projectId: testProjectId,
  title: "Invalid status",
  description: "Testing status",
  status: "pending"
});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // 20. INVALID PUT STATUS
  test("PUT /api/tasks/:id should reject an invalid status", async () => {
  const created = await agent
    .post("/api/tasks")
   .send({
  projectId: testProjectId,
  title: "Test task",
  description: "Testing invalid status",
});

  const response = await agent
    .put(`/api/tasks/${created.body.data.id}`)
    .send({ status: "pending" });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Validation failed");
});
  // 23. SEARCH TASKS
  test("GET /api/tasks should search tasks by title", async () => {
await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "React Task Board",
  description: "Testing search"
});
    await agent.post("/api/tasks").send({
  projectId: testProjectId,
  title: "Shopping List",
  description: "Another task"
});

    const response = await agent
      .get("/api/tasks?search=react");

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1);
    expect(response.body.tasks[0].title).toBe("React Task Board");
    expect(response.body.total).toBe(1);
  });
  // 21. UNEXPECTED POST FIELDS
  test("POST /api/tasks should reject unexpected fields", async () => {
    const response = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Extra field",
  priority: "high"
});

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // 22. UNEXPECTED PUT FIELDS
 test("PUT /api/tasks/:id should reject unexpected fields", async () => {
  const created = await agent
    .post("/api/tasks")
    .send({
  projectId: testProjectId,
  title: "Test task",
  description: "Testing unexpected fields",
});

  const response = await agent
    .put(`/api/tasks/${created.body.data.id}`)
    .send({ priority: "high" });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Validation failed");
});
  // 24. PREVENT CROSS-USER ACCESS
  test("should prevent another user from accessing tasks and projects", async () => {
   await pool.query(
  "DELETE FROM users WHERE email = $1",
  ["second-user@example.com"]
);
    const secondPassword = "SecondPassword123!";
    const secondPasswordHash = await bcrypt.hash(secondPassword, 12);

    await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)`,
      ["Second User", "second-user@example.com", secondPasswordHash]
    );

    const secondAgent = request.agent(app);

    const loginResponse = await secondAgent
      .post("/api/auth/login")
      .send({
        email: "second-user@example.com",
        password: secondPassword
      });

    expect(loginResponse.status).toBe(200);

    // First user creates a task in their own project
    const taskResponse = await agent
      .post("/api/tasks")
      .send({
  projectId: testProjectId,
  title: "Private task",
  description: ""
});
console.log("Task creation response:", taskResponse.body);
    expect(taskResponse.status).toBe(201);

    const taskId = taskResponse.body.data.id;
       

    // Second user attempts to access the first user's task
    const taskAccess = await secondAgent.get(`/api/tasks/${taskId}`);

    expect(taskAccess.status).toBe(404);

    // Second user attempts to access the first user's project
    const projectAccess = await secondAgent.get(
      `/api/projects/${testProjectId}`
    );

    expect(projectAccess.status).toBe(404);

    await pool.query(
      "DELETE FROM users WHERE email = $1",
      ["second-user@example.com"]
    );
  });
    // 25. VIEWER CANNOT EDIT OR DELETE TASKS
  test("should prevent a viewer from editing or deleting tasks", async () => {
    await pool.query(
      "DELETE FROM users WHERE email = $1",
      ["viewer-user@example.com"]
    );

    const password = "ViewerPassword123!";
    const passwordHash = await bcrypt.hash(password, 12);

    const userResult = await pool.query(
      `INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id`,
      ["Viewer User", "viewer-user@example.com", passwordHash]
    );

    const viewerUserId = Number(userResult.rows[0].id);

    await pool.query(
      `INSERT INTO project_members (project_id, user_id, role)
       VALUES ($1, $2, 'viewer')`,
      [testProjectId, viewerUserId]
    );

    const viewerAgent = request.agent(app);

    const loginResponse = await viewerAgent
      .post("/api/auth/login")
      .send({
        email: "viewer-user@example.com",
        password
      });

        expect(loginResponse.status).toBe(200);

    const viewerCreateResponse = await viewerAgent
      .post("/api/tasks")
      .send({
        projectId: testProjectId,
        title: "Viewer should not create this",
        description: "Permission test"
      });

    expect(viewerCreateResponse.status).toBe(403);

    const taskResponse = await agent
      .post("/api/tasks")
      .send({
        projectId: testProjectId,
        title: "Viewer permission test",
        description: "This task must not be modified by a viewer"
      });

    expect(taskResponse.status).toBe(201);

    const taskId = taskResponse.body.data.id;
const viewerMoveResponse = await viewerAgent
  .patch(`/api/tasks/${taskId}/move`)
  .send({
    newProjectId: testProjectId
  });

expect(viewerMoveResponse.status).toBe(403);
    const editResponse = await viewerAgent
      .put(`/api/tasks/${taskId}`)
      .send({
        title: "Viewer changed this task"
      });

    expect(editResponse.status).toBe(403);

    const deleteResponse = await viewerAgent
      .delete(`/api/tasks/${taskId}`);

    expect(deleteResponse.status).toBe(403);

    await pool.query(
      "DELETE FROM users WHERE email = $1",
      ["viewer-user@example.com"]
    );
  });
    // 26. REJECT EXPIRED SESSIONS
  test("should reject an expired session", async () => {
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      ["test-user@example.com"]
    );

    const userId = Number(userResult.rows[0].id);

    await pool.query(
      `UPDATE user_sessions
       SET expires_at = CURRENT_TIMESTAMP - INTERVAL '1 minute'
       WHERE user_id = $1`,
      [userId]
    );

    const response = await agent.get("/api/auth/me");

    expect(response.status).toBe(401);
    expect(response.body.success).toBe(false);
    expect(response.body.message).toBe("Invalid or expired session");
  });
});

