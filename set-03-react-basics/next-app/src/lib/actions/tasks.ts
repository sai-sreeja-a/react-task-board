"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  createTask,
  updateTask,
  deleteTask,
} from "@/lib/services/task-service";
import { createComment } from "@/lib/services/comment-service";
import { createCommentSchema } from "@/lib/validations/comment";
import {
  createTaskSchema,
  updateTaskSchema,
} from "@/lib/validations/task";
export interface TaskActionState {
  errors?: {
    title?: string[];
    description?: string[];
    projectId?: string[];
    status?: string[];
  };
  message?: string;
  values?: {
    title: string;
    description: string;
    status: string;
  };
}

export async function createTaskAction(
  _previousState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    projectId: String(formData.get("projectId") ?? ""),
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? "todo"),
  };

  const validation = createTaskSchema.safeParse(values);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      values: {
        title: values.title,
        description: values.description,
        status: values.status,
      },
    };
  }

 try {
  await createTask(validation.data, user.id);
} catch (error) {
    console.error("Create task error:", error);

    return {
      message: "Unable to create the task. Please try again.",
      values: {
        title: values.title,
        description: values.description,
        status: values.status,
      },
    };
  }

  revalidatePath(`/projects/${values.projectId}`);

  redirect(`/projects/${values.projectId}`);
}
export async function updateTaskAction(
  taskId: string,
  _previousState: TaskActionState,
  formData: FormData
): Promise<TaskActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!/^[1-9]\d*$/.test(taskId)) {
    return { message: "Invalid task ID." };
  }

  const values = {
    title: String(formData.get("title") ?? ""),
    description: String(formData.get("description") ?? ""),
    status: String(formData.get("status") ?? ""),
  };

  const validation = updateTaskSchema.safeParse(values);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      values,
    };
  }

  try {
    await updateTask(taskId, validation.data, user.id);
  } catch (error) {
    console.error("Update task error:", error);

    return {
      message: "Unable to update the task. Please try again.",
      values,
    };
  }

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/projects");

  redirect(`/tasks/${taskId}`);
}
export async function deleteTaskAction(taskId: string): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!/^[1-9]\d*$/.test(taskId)) {
    throw new Error("Invalid task ID.");
  }

  try {
    await deleteTask(taskId, user.id);
  } catch (error) {
    console.error("Delete task error:", error);
    throw new Error("Unable to delete the task. Please try again.");
  }

  revalidatePath("/projects");
  redirect("/");
}
export interface CommentActionState {
  errors?: {
    content?: string[];
  };
  message?: string;
  values?: {
    content: string;
  };
}

export async function createCommentAction(
  taskId: string,
  _previousState: CommentActionState,
  formData: FormData
): Promise<CommentActionState> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    taskId,
    content: String(formData.get("content") ?? ""),
  };

  const validation = createCommentSchema.safeParse(values);

  if (!validation.success) {
    return {
      errors: validation.error.flatten().fieldErrors,
      values: { content: values.content },
    };
  }

  try {
    await createComment(taskId, user.id, validation.data.content);
  } catch (error) {
    console.error("Create comment error:", error);

    return {
      message: "Unable to add your comment. Please try again.",
      values: { content: values.content },
    };
  }

  revalidatePath(`/tasks/${taskId}`);
  redirect(`/tasks/${taskId}`);
}
export async function updateTaskStatusAction(
  taskId: string,
  status: string
): Promise<void> {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  if (!/^[1-9]\d*$/.test(taskId)) {
    throw new Error("Invalid task ID.");
  }

  const validation = updateTaskSchema.safeParse({ status });

  if (!validation.success) {
    throw new Error("Invalid task status.");
  }

  await updateTask(taskId, validation.data, user.id);

  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/projects");
}