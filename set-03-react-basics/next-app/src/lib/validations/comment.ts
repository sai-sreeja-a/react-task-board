import { z } from "zod";

export const createCommentSchema = z.object({
  taskId: z.string().regex(/^[1-9]\d*$/, "Invalid task ID"),
  content: z
    .string()
    .trim()
    .min(1, "Comment cannot be empty")
    .max(2000, "Comment cannot exceed 2000 characters"),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;