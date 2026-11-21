
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import type { Task } from "../types/task";

interface TaskFormProps {
  initialTask?: Task | null;
  onSave: (title: string, description: string) => void;
  onCancel: () => void;
}

function TaskForm({ initialTask, onSave, onCancel }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    setTitle(initialTask?.title ?? "");
    setDescription(initialTask?.description ?? "");
  }, [initialTask]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim()) return;

    onSave(title.trim(), description.trim());
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2>{initialTask ? "Edit Task" : "Add New Task"}</h2>

      <input
        type="text"
        placeholder="Enter task title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />

      <textarea
        placeholder="Enter task description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <div className="form-actions">
        <button type="submit">
          {initialTask ? "Update Task" : "Add Task"}
        </button>
        <button type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}

export default TaskForm;
