"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  createProject,
  deleteProject,
} from "@/lib/services/project-service";
import { createProjectSchema } from "@/lib/validations/project";

export interface ProjectActionState {
  errors?: {
    name?: string[];
    description?: string[];
  };
  message?: string;
  values?: {
    name: string;
    description: string;
  };
}

export async function createProjectAction(
  _previousState: ProjectActionState,
  formData: FormData
): Promise<ProjectActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    description: String(formData.get("description") ?? ""),
  };

  const validation = createProjectSchema.safeParse(values);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    const project = await createProject(validation.data, user.id);

    revalidatePath("/projects");
    redirect(`/projects/${project.id}`);
  } catch (error) {
    // Next.js redirect() throws internally, so let redirects pass through.
    if (
      error &&
      typeof error === "object" &&
      "digest" in error &&
      typeof error.digest === "string" &&
      error.digest.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }

    console.error("Create project error:", error);

    return {
      message: "Unable to create the project. Please try again.",
      values,
    };
  }
}

export async function deleteProjectAction(
  projectId: string
): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  await deleteProject(projectId, user.id);

  revalidatePath("/projects");
  redirect("/projects");
}