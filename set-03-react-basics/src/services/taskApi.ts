
import type { Task, TaskStatus } from "../types/task";

const API_URL = "http://localhost:5000/api/tasks";

// GET ALL TASKS WITH SERVER-SIDE FILTERING AND PAGINATION

export interface GetTasksParams {
  page: number;
  limit: number;
  status?: TaskStatus | "all";
  search?: string;
  sortOrder: "newest" | "oldest";
}

export interface GetTasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const getTasks = async (
  params: GetTasksParams
): Promise<GetTasksResponse> => {
  const queryParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
    sortBy: "createdAt",
    order: params.sortOrder === "newest" ? "desc" : "asc",
  });

    if (params.status && params.status !== "all") {
    queryParams.set("status", params.status);
  }

  if (params.search?.trim()) {
    queryParams.set("search", params.search.trim());
  }

  const response = await fetch(`${API_URL}?${queryParams.toString()}`);

  if (!response.ok) {
    throw new Error("Failed to fetch tasks");
  }

  return await response.json();
};
// CREATE TASK
export const createTask = async (
  title: string,
  description: string,
  projectId: number = 1
): Promise<Task> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      projectId,
      title,
      description,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to create task");
  }

  const result = await response.json();

  return result.data;
};
// UPDATE TASK
export const updateTask = async (
  id: number,
  title: string,
  description: string
): Promise<Task> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ title, description }),
  });

  if (!response.ok) {
    throw new Error("Failed to update task");
  }

  const result = await response.json();

  return result.data;
};

// DELETE TASK
export const deleteTask = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error("Failed to delete task");
  }
};

// MOVE TASK
export const moveTask = async (
  id: number,
  status: TaskStatus
): Promise<Task> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    throw new Error("Failed to move task");
  }

  const result = await response.json();

  return result.data;
};
