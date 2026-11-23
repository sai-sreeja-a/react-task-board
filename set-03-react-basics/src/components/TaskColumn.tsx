import type { Task, TaskStatus } from "../types/task";
import TaskCard from "./TaskCard";
import EmptyState from "./EmptyState";

interface TaskColumnProps {
  title: string;
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
onMove: (id: number, status: TaskStatus) => void;
  loading: boolean;
  error?: string;
}

function TaskColumn({
  title,
  tasks,
  onEdit,
  onDelete,
  onMove,
  loading,
  error,
}: TaskColumnProps) {
  return (
    <section className="task-column">
      <h2>{title} ({tasks.length})</h2>

      {loading ? (
        <EmptyState message="Loading tasks..." />
      ) : error ? (
        <EmptyState message={error} />
      ) : tasks.length === 0 ? (
        <EmptyState message={`No tasks found in ${title}`} />
      ) : (
        tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onMove={onMove}
          />
        ))
      )}
    </section>
  );
}

export default TaskColumn;