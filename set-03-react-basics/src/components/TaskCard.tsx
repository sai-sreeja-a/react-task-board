import type { Task, TaskStatus } from "../types/task";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

// Keep these declarations outside the component
const nextStatus: Record<TaskStatus, TaskStatus> = {
  todo: "in-progress",
  "in-progress": "done",
  done: "todo",
};

const nextLabel: Record<TaskStatus, string> = {
  todo: "Start task →",
  "in-progress": "Complete task →",
  done: "Move to To do",
};

function TaskCard({ task, onEdit, onDelete, onMove }: TaskCardProps) {
  return (
    <article className="task-card">
      <h3>{task.title}</h3>
      <p>{task.description || "No description provided."}</p>

      <small>
        Created: {new Date(task.createdAt).toLocaleDateString()}
      </small>

      <div className="task-actions">
        <button onClick={() => onEdit(task)}>Edit</button>
        <button onClick={() => onDelete(task.id)}>Delete</button>
        <button onClick={() => onMove(task.id, nextStatus[task.status])}>
          {nextLabel[task.status]}
        </button>
      </div>
    </article>
  );
}

export default TaskCard;