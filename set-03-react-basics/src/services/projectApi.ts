
const API_URL = "http://localhost:5000/api/projects";

export interface Project {
  id: number;
  name: string;
  description: string | null;
  role: string;
  createdAt: string;
}
export interface ProjectMember {
  userId: number;
  name: string;
  email: string;
  role: "owner" | "member" | "viewer";
  joinedAt: string;
}

export const getProjects = async (): Promise<Project[]> => {
  const response = await fetch(API_URL, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch projects");
  }

  return result.data;
};
export const createProject = async (
  name: string,
  description: string
): Promise<Project> => {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, description }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to create project");
  }

  return result.data;
};
export const updateProject = async (
  id: number,
  name: string,
  description: string
): Promise<Project> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ name, description }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update project");
  }

  return result.data;
};
export const getProjectMembers = async (
  projectId: number
): Promise<ProjectMember[]> => {
  const response = await fetch(`${API_URL}/${projectId}/members`, {
    method: "GET",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to fetch project members");
  }

  return result.data;
};
export const addProjectMember = async (
  projectId: number,
  email: string,
  role: "member" | "viewer"
): Promise<ProjectMember> => {
  const response = await fetch(`${API_URL}/${projectId}/members`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ email, role }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to add project member");
  }

  return result.data;
};
export const updateProjectMemberRole = async (
  projectId: number,
  memberId: number,
  role: "member" | "viewer"
): Promise<ProjectMember> => {
  const response = await fetch(
    `${API_URL}/${projectId}/members/${memberId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ role }),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to update member role");
  }

  return result.data;
};
export const removeProjectMember = async (
  projectId: number,
  memberId: number
): Promise<void> => {
  const response = await fetch(
    `${API_URL}/${projectId}/members/${memberId}`,
    {
      method: "DELETE",
      credentials: "include",
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to remove project member");
  }
};
export const deleteProject = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || "Failed to delete project");
  }
};