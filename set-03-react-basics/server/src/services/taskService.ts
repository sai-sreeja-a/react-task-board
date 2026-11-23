
import mongoose from "mongoose";
import TaskModel from "../models/taskModel";
import {
  CreateTaskInput,
  UpdateTaskInput
} from "../types/task";

// Numeric ID counter stored in MongoDB
const Counter =
  mongoose.models.Counter ||
  mongoose.model(
    "Counter",
    new mongoose.Schema({
      _id: String,
      seq: Number
    })
  );

// Generate the next numeric task ID
const getNextId = async (): Promise<number> => {
  const counter = await Counter.findByIdAndUpdate(
    "taskId",
    { $inc: { seq: 1 } },
    { returnDocument: "after", upsert: true }
  );

  return counter.seq;
};

// CREATE TASK
export const createTask = async (data: CreateTaskInput) => {
  const id = await getNextId();

  const newTask = await TaskModel.create({
    id,
    title: data.title,
    description: data.description,
    status: data.status ?? "todo"
  });

  return newTask;
};

// GET ALL TASKS

export interface TaskQueryOptions {
  page: number;
  limit: number;
  status?: string;
  search?: string;
  sortBy: "title" | "createdAt" | "updatedAt";
  order: "asc" | "desc";
}

export const getAllTasks = async (options: TaskQueryOptions) => {
  const filter: Record<string, unknown> = {};
if (options.status) {
  filter.status = options.status;
}

if (options.search?.trim()) {
  const escapedSearch = options.search
    .trim()
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  filter.title = {
    $regex: escapedSearch,
    $options: "i"
  };
}



  const total = await TaskModel.countDocuments(filter);

  const sortDirection = options.order === "asc" ? 1 : -1;

 const sortOptions: Record<string, 1 | -1> = {
  [options.sortBy]: sortDirection
};

let query = TaskModel.find(filter).sort(sortOptions);
  if (options.sortBy === "title") {
    query = query.collation({ locale: "en", strength: 2 });
  }

  const tasks = await query
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .lean();

  return {
    tasks,
    total,
    page: options.page,
    limit: options.limit,
    totalPages: Math.ceil(total / options.limit)
  };
};

// GET TASK BY ID
export const getTaskById = async (id: number) => {
  return await TaskModel.findOne({ id }).lean();
};

// UPDATE TASK
export const updateTask = async (
  id: number,
  data: UpdateTaskInput
) => {
  return await TaskModel.findOneAndUpdate(
    { id },
    {
      ...data,
      updatedAt: new Date()
    },
    {
  returnDocument: "after",
  runValidators: true
}
  ).lean();
};

// DELETE TASK
export const deleteTask = async (id: number): Promise<boolean> => {
  const result = await TaskModel.deleteOne({ id });

  return result.deletedCount > 0;
};

// RESET TASKS FOR AUTOMATED TESTS
export const resetTasks = async (): Promise<void> => {
  await TaskModel.deleteMany({});
  await Counter.deleteOne({ _id: "taskId" });
};
