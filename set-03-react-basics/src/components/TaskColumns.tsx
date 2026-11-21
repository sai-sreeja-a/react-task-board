
import type { Task, TaskStatus } from "../types/task";
import TaskColumn from "./TaskColumn";

interface TaskColumnsProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, status: TaskStatus) => void;
}

const columns: { title: string; status: TaskStatus }[] = [
  { title: "To do", status: "todo" },
  { title: "In progress", status: "in-progress" },
  { title: "Done", status: "done" },
];

function TaskColumns({
  tasks,
  onEdit,
  onDelete,
  onMove,
}: TaskColumnsProps) {
  return (
    <div className="task-board">
      {columns.map((column) => (
        <TaskColumn
          key={column.status}
          title={column.title}
          tasks={tasks.filter(
            (task) => task.status === column.status
          )}
          onEdit={onEdit}
          onDelete={onDelete}
          onMove={onMove}
          loading={false}
          
        />
      ))}
      
    </div>
  );
}

export default TaskColumns;
