import { useMemo, useState } from "react";
import type { Task, TaskStatus } from "../types/task";
import useLocalStorage from "../hooks/useLocalStorage";
import TaskColumns from "./TaskColumns";
import TaskForm from "./TaskForm";
import TaskFilters from "./TaskFilters";


function TaskBoard() {
  const [tasks, setTasks, storageError] = useLocalStorage<Task[]>(
  "task-board",
  []
);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TaskStatus | "all">("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showForm, setShowForm] = useState(false);

  
const filteredTasks = useMemo(() => {
  const searchTerm = search.trim().toLowerCase();

  return tasks
    .filter((task) =>
      task.title.toLowerCase().includes(searchTerm)
    )
    .filter(
      (task) => status === "all" || task.status === status
    )
    .toSorted((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();

      return sortOrder === "newest"
        ? dateB - dateA
        : dateA - dateB;
    });
}, [tasks, search, status, sortOrder]);
console.log("Search:", search);
console.log("Filtered tasks:", filteredTasks);


  const saveTask = (title: string, description: string) => {
    const now = new Date().toISOString();

    if (editingTask) {
      setTasks((previous) =>
        previous.map((task) =>
          task.id === editingTask.id
            ? { ...task, title, description, updatedAt: now }
            : task
        )
      );
    } else {
      setTasks((previous) => [
        ...previous,
        {
          id: crypto.randomUUID(),
          title,
          description,
          status: "todo",
          createdAt: now,
          updatedAt: now,
        },
      ]);
    }

    setShowForm(false);
    setEditingTask(null);
  };

  const deleteTask = (id: string) => {
    setTasks((previous) => previous.filter((task) => task.id !== id));
  };

  const moveTask = (id: string, newStatus: TaskStatus) => {
    setTasks((previous) =>
      previous.map((task) =>
        task.id === id
          ? { ...task, status: newStatus, updatedAt: new Date().toISOString() }
          : task
      )
    );
  };

  const openEditForm = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

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
        onSearchChange={setSearch}
        onStatusChange={setStatus}
        onSortChange={setSortOrder}
      />
{storageError && (
  <p className="error-message" role="alert">
    {storageError}
  </p>
)}
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
  tasks={filteredTasks}
  onEdit={openEditForm}
  onDelete={deleteTask}
  onMove={moveTask}
/>
    </main>
  );
}

export default TaskBoard;