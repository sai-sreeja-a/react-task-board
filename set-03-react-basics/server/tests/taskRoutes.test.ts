import "dotenv/config";
import request from "supertest";
import mongoose from "mongoose";
import app from "../src/app";
import connectDB from "../src/config/db";
import { resetTasks } from "../src/services/taskService";
beforeAll(async () => {
  await connectDB();
});

beforeEach(async () => {
  await resetTasks();
});

afterAll(async () => {
  await mongoose.disconnect();
});

describe("Task API Tests", () => {

  // 1. GET ALL TASKS
  test("GET /api/tasks should return an empty task list", async () => {
    const response = await request(app).get("/api/tasks");

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
  });

  // 2. CREATE TASK
  test("POST /api/tasks should create a new task", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test task",
        description: "Testing POST"
      });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe("Test task");
  });

  // 3. INVALID CREATE DATA
  test("POST /api/tasks should reject an empty title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "",
        description: "Testing invalid data"
      });

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 4. GET TASK BY ID
  test("GET /api/tasks/:id should return a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Find me",
        description: "Testing GET by ID"
      });

    const id = created.body.data.id;

    const response = await request(app).get(`/api/tasks/${id}`);

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Find me");
  });

  // 5. GET MISSING TASK
  test("GET /api/tasks/:id should return 404 for missing task", async () => {
    const response = await request(app).get("/api/tasks/999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 6. UPDATE TASK
  test("PUT /api/tasks/:id should update a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Old title",
        description: "Testing update"
      });

    const id = created.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${id}`)
      .send({
        title: "Updated title"
      });

    expect(response.status).toBe(200);
    expect(response.body.data.title).toBe("Updated title");
  });

  // 7. INVALID UPDATE DATA
  test("PUT /api/tasks/:id should reject an empty body", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Test task",
        description: "Testing invalid update"
      });

    const id = created.body.data.id;

    const response = await request(app)
      .put(`/api/tasks/${id}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 8. DELETE TASK
  test("DELETE /api/tasks/:id should delete a task", async () => {
    const created = await request(app)
      .post("/api/tasks")
      .send({
        title: "Delete me",
        description: "Testing DELETE"
      });

    const id = created.body.data.id;

    const response = await request(app).delete(`/api/tasks/${id}`);

    expect(response.status).toBe(204);

    const check = await request(app).get(`/api/tasks/${id}`);

    expect(check.status).toBe(404);
  });

  // 9. PAGINATION
  test("GET /api/tasks should support pagination", async () => {
    await request(app).post("/api/tasks").send({
      title: "Task 1",
      description: "First task"
    });

    await request(app).post("/api/tasks").send({
      title: "Task 2",
      description: "Second task"
    });

    const response = await request(app)
      .get("/api/tasks?page=1&limit=1");

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1);
    expect(response.body.total).toBe(2);
    expect(response.body.totalPages).toBe(2);
  });

  // 10. FILTER BY STATUS
  test("GET /api/tasks should filter tasks by status", async () => {
    await request(app).post("/api/tasks").send({
      title: "Completed task",
      description: "Testing filter",
      status: "done"
    });

    const response = await request(app)
      .get("/api/tasks?status=done");

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1);
    expect(response.body.tasks[0].status).toBe("done");
  });

  // 11. SORTING
  test("GET /api/tasks should sort tasks by title", async () => {
    await request(app).post("/api/tasks").send({
      title: "Zebra",
      description: "Last alphabetically"
    });

    await request(app).post("/api/tasks").send({
      title: "Apple",
      description: "First alphabetically"
    });

    const response = await request(app)
      .get("/api/tasks?sortBy=title&order=asc");

    expect(response.status).toBe(200);
    expect(response.body.tasks[0].title).toBe("Apple");
    expect(response.body.tasks[1].title).toBe("Zebra");
  });

  // 12. INVALID PAGINATION
  test("GET /api/tasks should reject invalid page numbers", async () => {
    const response = await request(app)
      .get("/api/tasks?page=0");

    expect(response.status).toBe(400);
    expect(response.body.success).toBe(false);
  });

  // 13. INVALID SORTING
  test("GET /api/tasks should reject invalid sort fields", async () => {
    const response = await request(app)
      .get("/api/tasks?sortBy=description");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid sortBy value");
  });

  // 14. INVALID GET TASK ID
  test("GET /api/tasks/:id should reject an invalid task ID", async () => {
    const response = await request(app).get("/api/tasks/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
  });

  // 15. INVALID PUT TASK ID
  test("PUT /api/tasks/:id should reject an invalid task ID", async () => {
    const response = await request(app)
      .put("/api/tasks/abc")
      .send({ title: "Updated" });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
  });

  // 16. INVALID DELETE TASK ID
  test("DELETE /api/tasks/:id should reject an invalid task ID", async () => {
    const response = await request(app).delete("/api/tasks/abc");

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Invalid task ID");
  });

  // 17. UPDATE MISSING TASK
  test("PUT /api/tasks/:id should return 404 for missing task", async () => {
    const response = await request(app)
      .put("/api/tasks/999")
      .send({ title: "Updated" });

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 18. DELETE MISSING TASK
  test("DELETE /api/tasks/:id should return 404 for missing task", async () => {
    const response = await request(app).delete("/api/tasks/999");

    expect(response.status).toBe(404);
    expect(response.body.message).toBe("Task not found");
  });

  // 19. INVALID POST STATUS
  test("POST /api/tasks should reject an invalid status", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Invalid status",
        description: "Testing status",
        status: "pending"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // 20. INVALID PUT STATUS
  test("PUT /api/tasks/:id should reject an invalid status", async () => {
  const created = await request(app)
    .post("/api/tasks")
    .send({
      title: "Test task",
      description: "Testing invalid status",
    });

  const response = await request(app)
    .put(`/api/tasks/${created.body.data.id}`)
    .send({ status: "pending" });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Validation failed");
});
  // 23. SEARCH TASKS
  test("GET /api/tasks should search tasks by title", async () => {
    await request(app).post("/api/tasks").send({
      title: "React Task Board",
      description: "Testing search"
    });

    await request(app).post("/api/tasks").send({
      title: "Shopping List",
      description: "Another task"
    });

    const response = await request(app)
      .get("/api/tasks?search=react");

    expect(response.status).toBe(200);
    expect(response.body.tasks.length).toBe(1);
    expect(response.body.tasks[0].title).toBe("React Task Board");
    expect(response.body.total).toBe(1);
  });
  // 21. UNEXPECTED POST FIELDS
  test("POST /api/tasks should reject unexpected fields", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "Extra field",
        priority: "high"
      });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Validation failed");
  });

  // 22. UNEXPECTED PUT FIELDS
 test("PUT /api/tasks/:id should reject unexpected fields", async () => {
  const created = await request(app)
    .post("/api/tasks")
    .send({
      title: "Test task",
      description: "Testing unexpected fields",
    });

  const response = await request(app)
    .put(`/api/tasks/${created.body.data.id}`)
    .send({ priority: "high" });

  expect(response.status).toBe(400);
  expect(response.body.success).toBe(false);
  expect(response.body.message).toBe("Validation failed");
});
});
