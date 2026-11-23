
import { useEffect, useState } from "react";
import type { Task, TaskStatus } from "../types/task";

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

  // LOAD TASKS FROM BACKEND
  // LOAD TASKS FROM BACKEND
useEffect(() => {
  const loadTasks = async () => {
    try {
      setLoading(true);

    const result = await getTasks({
  page,
  limit: pageSize,
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
}, [page, pageSize, status, sortOrder, search]);
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
        const newTask = await createTask(title, description);

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
        <button onClick={openAddForm}>+ Add Task</button>
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

      {error && (
        <p className="error-message" role="alert">
          {error}
        </p>
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
