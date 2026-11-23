
import { Router } from "express";

import {
  addTask,
  fetchTasks,
  fetchTaskById,
  editTask,
  removeTask,
  moveTask
} from "../controllers/taskController";

import { validateRequest } from "../middleware/validateRequest";

import {
  createTaskSchema,
  updateTaskSchema
} from "../schemas/taskSchema";

const router = Router();

// CREATE TASK
router.post(
  "/",
  validateRequest(createTaskSchema),
  addTask
);

// GET ALL TASKS
router.get("/", fetchTasks);

// GET TASK BY ID
router.get("/:id", fetchTaskById);

// UPDATE TASK
router.put(
  "/:id",
  validateRequest(updateTaskSchema),
  editTask
);

// DELETE TASK
router.delete("/:id", removeTask);
// MOVE TASK TO ANOTHER PROJECT
router.patch("/:id/move", moveTask);
export default router;
