
import { Request, Response, NextFunction } from "express";

import {
  createTask,
  getAllTasks,
  getTaskById,
  updateTask,
  deleteTask,
  moveTaskToProject
} from "../services/taskService";

// CREATE TASK
export const addTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const task = await createTask(req.body);

    return res.status(201).json({
      success: true,
      message: "Task created successfully",
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// GET ALL TASKS
export const fetchTasks = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 10);

   const status = req.query.status;
   const search = req.query.search;
const sortBy = req.query.sortBy ?? "createdAt";
const order = req.query.order ?? "desc";
    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      return res.status(400).json({
        success: false,
        message: "Page must be positive and limit must be between 1 and 100"
      });
    }

    if (
      status !== undefined &&
      !["todo", "in-progress", "done"].includes(String(status))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid status filter"
      });
    }

    if (
      !["title", "createdAt", "updatedAt"].includes(String(sortBy))
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid sortBy value"
      });
    }

    if (!["asc", "desc"].includes(String(order))) {
      return res.status(400).json({
        success: false,
        message: "Order must be asc or desc"
      });
    }

   const result = await getAllTasks({
  page,
  limit,
  status: status ? String(status) : undefined,
  search: search ? String(search) : undefined,
  sortBy: sortBy as "title" | "createdAt" | "updatedAt",
  order: order as "asc" | "desc"
});
    return res.status(200).json({
      success: true,
      ...result
    });
  } catch (error) {
    next(error);
  }
};

// GET TASK BY ID
export const fetchTaskById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const task = await getTaskById(id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// UPDATE TASK
export const editTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const task = await updateTask(id, req.body);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Task updated successfully",
      data: task
    });
  } catch (error) {
    next(error);
  }
};

// DELETE TASK
export const removeTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    const deleted = await deleteTask(id);

    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    return res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// MOVE TASK TO ANOTHER PROJECT
export const moveTask = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const taskId = Number(req.params.id);
    const newProjectId = req.body.newProjectId;

    if (!Number.isInteger(taskId) || taskId <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid task ID"
      });
    }

    if (
      !Number.isInteger(newProjectId) ||
      newProjectId <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "A valid newProjectId is required"
      });
    }

    const task = await moveTaskToProject(taskId, newProjectId);

    return res.status(200).json({
      success: true,
      message: "Task moved successfully",
      data: task
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Task not found") {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    next(error);
  }
};
