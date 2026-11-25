import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Task, TaskStatus } from "../types/task";
import {
  getProjects,
  createProject,
  updateProject,
  deleteProject,
  getProjectMembers,
  addProjectMember,
  updateProjectMemberRole,
  removeProjectMember,
} from "../services/projectApi";
import type {
  Project,
  ProjectMember,
} from "../services/projectApi";
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask as deleteTaskApi,
  moveTask as moveTaskApi,
} from "../services/taskApi";

import TaskColumns from "./TaskColumns";
import TaskForm from "./TaskForm";
import TaskFilters from "./TaskFilters";

function TaskBoard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTasks, setTotalTasks] = useState(0);

  const pageSize = 10;
  
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

const [projects, setProjects] = useState<Project[]>([]);
const [showMembers, setShowMembers] = useState(false);
const [memberEmail, setMemberEmail] = useState("");
const [memberRole, setMemberRole] = useState<"member" | "viewer">("member");
const [memberSaving, setMemberSaving] = useState(false);
const [projectMembers, setProjectMembers] = useState<ProjectMember[]>([]);
const [membersLoading, setMembersLoading] = useState(false);
const [membersError, setMembersError] = useState<string | null>(null);
const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
const [editingProject, setEditingProject] = useState<Project | null>(null);
const [editProjectName, setEditProjectName] = useState("");
const [editProjectDescription, setEditProjectDescription] = useState("");
const [projectUpdating, setProjectUpdating] = useState(false);
const [showProjectForm, setShowProjectForm] = useState(false);
const [newProjectName, setNewProjectName] = useState("");
const [newProjectDescription, setNewProjectDescription] = useState("");
const [projectSaving, setProjectSaving] = useState(false);
const handleCreateProject = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!newProjectName.trim()) {
    setError("Project name is required");
    return;
  }

  try {
    setProjectSaving(true);

    const project = await createProject(
      newProjectName.trim(),
      newProjectDescription.trim()
    );

    setProjects((previous) => [...previous, project]);
    setSelectedProjectId(project.id);
    setPage(1);

    setNewProjectName("");
    setNewProjectDescription("");
    setShowProjectForm(false);
    setError(null);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to create project"
    );
  } finally {
    setProjectSaving(false);
  }
};
const handleUpdateProject = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (!editingProject) return;

  if (!editProjectName.trim()) {
    setError("Project name is required");
    return;
  }

  try {
    setProjectUpdating(true);

    const updated = await updateProject(
      editingProject.id,
      editProjectName.trim(),
      editProjectDescription.trim()
    );

    setProjects((previous) =>
      previous.map((project) =>
        project.id === updated.id ? updated : project
      )
    );

    setEditingProject(null);
    setEditProjectName("");
    setEditProjectDescription("");
    setError(null);
  } catch (err) {
    setError(
      err instanceof Error ? err.message : "Failed to update project"
    );
  } finally {
    setProjectUpdating(false);
  }
};
const [projectsLoading, setProjectsLoading] = useState(true);


useEffect(() => {
  const loadProjects = async () => {
    try {
      setProjectsLoading(true);

      const result = await getProjects();

      setProjects(result);

      if (result.length > 0) {
        setSelectedProjectId(result[0].id);
      } else {
        setError("You don't have any projects. Please create a project first.");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load projects"
      );
    } finally {
      setProjectsLoading(false);
    }
  };

  loadProjects();
}, 
[]);
useEffect(() => {
  if (!showMembers || selectedProjectId === null) {
    setProjectMembers([]);
    return;
  }

  const loadMembers = async () => {
    try {
      setMembersLoading(true);
      setMembersError(null);

      const result = await getProjectMembers(selectedProjectId);

      setProjectMembers(result);
    } catch (err) {
      setMembersError(
        err instanceof Error
          ? err.message
          : "Failed to load project members"
      );
    } finally {
      setMembersLoading(false);
    }
  };

  loadMembers();
}, [showMembers, selectedProjectId]);

const handleAddMember = async (e: FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  if (selectedProjectId === null) {
    setMembersError("Please select a project");
    return;
  }

  if (!memberEmail.trim()) {
    setMembersError("Email is required");
    return;
  }

  try {
    setMemberSaving(true);
    setMembersError(null);

    const newMember = await addProjectMember(
      selectedProjectId,
      memberEmail.trim(),
      memberRole
    );

    setProjectMembers((previous) => [...previous, newMember]);
    setMemberEmail("");
  } catch (err) {
    setMembersError(
      err instanceof Error ? err.message : "Failed to add member"
    );
  } finally {
    setMemberSaving(false);
  }
};
const handleChangeMemberRole = async (
  memberId: number,
  role: "member" | "viewer"
) => {
  if (selectedProjectId === null) return;

  try {
    setMembersError(null);

    const updatedMember = await updateProjectMemberRole(
      selectedProjectId,
      memberId,
      role
    );

    setProjectMembers((previous) =>
  previous.map((member) =>
    member.userId === updatedMember.userId
      ? {
          ...member,
          role: updatedMember.role,
        }
      : member
  )
);
  } catch (err) {
    setMembersError(
      err instanceof Error ? err.message : "Failed to update member role"
    );
  }
};
const handleRemoveMember = async (memberId: number) => {
  if (selectedProjectId === null) return;

  const confirmed = window.confirm(
    "Are you sure you want to remove this project member?"
  );

  if (!confirmed) return;

  try {
    setMembersError(null);

    await removeProjectMember(selectedProjectId, memberId);

    setProjectMembers((previous) =>
      previous.filter((member) => member.userId !== memberId)
    );
  } catch (err) {
    setMembersError(
      err instanceof Error ? err.message : "Failed to remove member"
    );
  }
};
// LOAD TASKS FROM BACKEND
  // LOAD TASKS FROM BACKEND
useEffect(() => {
  const loadTasks = async () => {
    try {
      setLoading(true);

    const result = await getTasks({
  page,
  limit: pageSize,
  projectId: selectedProjectId ?? undefined,
  status,
  search,
  sortOrder,
});

      setTasks(result.tasks);
      setTotalPages(result.totalPages);
      setTotalTasks(result.total);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load tasks"
      );
    } finally {
      setLoading(false);
    }
  };

  loadTasks();
}, [page, pageSize, status, sortOrder, search, selectedProjectId]);
  // SEARCH, FILTER AND SORT
  // SEARCH TASKS LOCALLY

  // CREATE OR UPDATE TASK
  const saveTask = async (title: string, description: string) => {
    try {
      if (editingTask) {
        const updatedTask = await updateTask(
          editingTask.id,
          title,
          description
        );

        setTasks((previous) =>
          previous.map((task) =>
            task.id === updatedTask.id ? updatedTask : task
          )
        );
      } else {
        if (selectedProjectId === null) {
  throw new Error("Please select a project before creating a task");
}

const newTask = await createTask(
  title,
  description,
  selectedProjectId
);

        setTasks((previous) => [...previous, newTask]);
      }

      setShowForm(false);
      setEditingTask(null);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save task"
      );
    }
  };

  // DELETE TASK
  const deleteTask = async (id: number) => {
    try {
      await deleteTaskApi(id);

      setTasks((previous) =>
        previous.filter((task) => task.id !== id)
      );

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete task"
      );
    }
  };

  // MOVE TASK
  const moveTask = async (id: number, newStatus: TaskStatus) => {
    try {
      const updatedTask = await moveTaskApi(id, newStatus);

      setTasks((previous) =>
        previous.map((task) =>
          task.id === id ? updatedTask : task
        )
      );

      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to move task"
      );
    }
  };

  // OPEN EDIT FORM
  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // OPEN ADD FORM
  const openAddForm = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  return (
    <main className="board-container">
      
<header className="board-header">
  <h1>My Task Board</h1>

  <div>
    <button
  type="button"
  onClick={() => setShowProjectForm(!showProjectForm)}
>
  + New Project
</button>
    <label htmlFor="projectSelect">Project: </label>

    <select
      id="projectSelect"
      value={selectedProjectId ?? ""}
onChange={(e) => {
  setSelectedProjectId(Number(e.target.value));
  setPage(1);
}}
      disabled={projectsLoading || projects.length === 0}
    >
     
      {projects.map((project) => (
        <option key={project.id} value={project.id}>
          {project.name}
        </option>
      ))}
    </select>
 <button
  type="button"
  onClick={() => {
    const project = projects.find(
      (item) => item.id === selectedProjectId
    );

    if (project) {
      setEditingProject(project);
      setEditProjectName(project.name);
      setEditProjectDescription(project.description ?? "");
    }
  }}
  disabled={selectedProjectId === null || projectsLoading}
>
  Edit Project
</button>
    <button
      onClick={openAddForm}
      disabled={projectsLoading || selectedProjectId === null}
    >
      + Add Task
    </button>
    <button
  type="button"
  onClick={() => setShowMembers((previous) => !previous)}
  disabled={selectedProjectId === null || projectsLoading}
>
  {showMembers ? "Hide Members" : "Manage Members"}
</button>
  </div>
</header>


      <TaskFilters
  search={search}
  status={status}
  sortOrder={sortOrder}
  onSearchChange={(value) => {
  setSearch(value);
  setPage(1);
}}
  onStatusChange={(value) => {
    setStatus(value);
    setPage(1);
  }}
  onSortChange={(value) => {
    setSortOrder(value);
    setPage(1);
  }}
/>
{showProjectForm && (
  <form onSubmit={handleCreateProject} className="project-form">
    <h2>Create New Project</h2>

    <div>
      <label htmlFor="newProjectName">Project Name</label>
      <input
        id="newProjectName"
        type="text"
        value={newProjectName}
        onChange={(e) => setNewProjectName(e.target.value)}
        maxLength={150}
        placeholder="Enter project name"
        required
      />
    </div>

    <div>
      <label htmlFor="newProjectDescription">Description</label>
      <textarea
        id="newProjectDescription"
        value={newProjectDescription}
        onChange={(e) => setNewProjectDescription(e.target.value)}
        placeholder="Enter project description (optional)"
      />
    </div>

    <button type="submit" disabled={projectSaving}>
      {projectSaving ? "Creating..." : "Create Project"}
    </button>

    <button
      type="button"
      onClick={() => setShowProjectForm(false)}
      disabled={projectSaving}
    >
      Cancel
    </button>
  </form>
)}
  {editingProject && (
  <form onSubmit={handleUpdateProject} className="project-form">
    <h2>Edit Project</h2>

    <div>
      <label htmlFor="editProjectName">Project Name</label>
      <input
        id="editProjectName"
        type="text"
        value={editProjectName}
        onChange={(e) => setEditProjectName(e.target.value)}
        maxLength={150}
        required
      />
    </div>

    <div>
      <label htmlFor="editProjectDescription">Description</label>
      <textarea
        id="editProjectDescription"
        value={editProjectDescription}
        onChange={(e) => setEditProjectDescription(e.target.value)}
      />
    </div>

    <button type="submit" disabled={projectUpdating}>
      {projectUpdating ? "Updating..." : "Save Changes"}
    </button>

    <button
      type="button"
      onClick={() => setEditingProject(null)}
      disabled={projectUpdating}
    >
      Cancel
    </button>
    <button
  type="button"
  onClick={async () => {
    if (!selectedProjectId) return;

    const confirmed = window.confirm(
      "Are you sure you want to delete this project?"
    );

    if (!confirmed) return;

    try {
      await deleteProject(selectedProjectId);

// Reload projects from the backend
const refreshedProjects = await getProjects();

setProjects(refreshedProjects);

if (refreshedProjects.length > 0) {
  setSelectedProjectId(refreshedProjects[0].id);
} else {
  setSelectedProjectId(null);
  setTasks([]);
}

setPage(1);
setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete project"
      );
    }
  }}
  disabled={selectedProjectId === null || projectsLoading}
>
  Delete Project
</button>
  </form>

)}

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
      )}
      {showMembers && (
  <section className="project-members">
    <h2>Project Members</h2>
<form onSubmit={handleAddMember} className="project-member-form">
  <label htmlFor="memberEmail">Member email</label>
  <input
    id="memberEmail"
    type="email"
    value={memberEmail}
    onChange={(e) => setMemberEmail(e.target.value)}
    placeholder="Enter user's email"
    required
  />

  <label htmlFor="memberRole">Role</label>
  <select
    id="memberRole"
    value={memberRole}
    onChange={(e) =>
      setMemberRole(e.target.value as "member" | "viewer")
    }
  >
    <option value="member">Member</option>
    <option value="viewer">Viewer</option>
  </select>

  <button type="submit" disabled={memberSaving}>
    {memberSaving ? "Adding..." : "Add Member"}
  </button>
</form>
    {membersLoading && <p>Loading members...</p>}

    {membersError && (
      <p className="error-message" role="alert">
        {membersError}
      </p>
    )}

    {!membersLoading && !membersError && (
      <ul>
        {projectMembers.map((member) => (
  <li key={member.userId}>
    {member.name} ({member.email}) — {member.role}

    {member.role !== "owner" && (
      <>
        <select
          value={member.role}
          onChange={(e) =>
            handleChangeMemberRole(
              member.userId,
              e.target.value as "member" | "viewer"
            )
          }
        >
          <option value="member">Member</option>
          <option value="viewer">Viewer</option>
        </select>

        <button
          type="button"
          onClick={() => handleRemoveMember(member.userId)}
        >
          Remove
        </button>
      </>
    )}
  </li>
))}
      </ul>
    )}
  </section>
)}

      {loading && <p>Loading tasks...</p>}

      {showForm && (
        <TaskForm
          initialTask={editingTask}
          onSave={saveTask}
          onCancel={() => {
            setShowForm(false);
            setEditingTask(null);
          }}
        />
      )}
      <TaskColumns
        tasks={tasks}
        onEdit={openEditForm}
        onDelete={deleteTask}
        onMove={moveTask}
      />
      <div className="pagination">
  <p>
    Showing page {page} of {totalPages} | Total tasks: {totalTasks}
  </p>

  <button
    onClick={() => setPage((previous) => previous - 1)}
    disabled={page === 1}
  >
    Previous
  </button>

  <button
    onClick={() => setPage((previous) => previous + 1)}
    disabled={page === totalPages}
  >
    Next
  </button>
</div>
    </main>
  );
}

export default TaskBoard;
