import { z } from "zod";

export const createProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Project name is required")
    .max(150, "Project name cannot exceed 150 characters"),

  description: z
    .string()
    .max(1000, "Description cannot exceed 1000 characters")
    .optional()
    .default(""),
});

export const updateProjectSchema = createProjectSchema
  .partial()
  .refine(
    (data) => Object.keys(data).length > 0,
    "At least one field must be provided"
  );

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;