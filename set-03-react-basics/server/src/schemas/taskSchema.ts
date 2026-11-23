
import { z } from "zod";

const taskStatusSchema = z.enum([
  "todo",
  "in-progress",
  "done"
]);

// Validation when creating a task
export const createTaskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title is required")
    .max(100, "Title cannot exceed 100 characters"),

  description: z.string()
    .max(500, "Description cannot exceed 500 characters"),

  status: taskStatusSchema.optional()
}).strict();

// Validation when updating a task
export const updateTaskSchema = z.object({
  title: z.string()
    .trim()
    .min(1, "Title cannot be empty")
    .max(100, "Title cannot exceed 100 characters")
    .optional(),

  description: z.string()
    .max(500, "Description cannot exceed 500 characters")
    .optional(),

  status: taskStatusSchema.optional()
})
.strict()
.refine(
  (data) => Object.keys(data).length > 0,
  "At least one field must be provided for update"
);
