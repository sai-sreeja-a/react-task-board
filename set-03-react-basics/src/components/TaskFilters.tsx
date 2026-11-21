import type { TaskStatus } from "../types/task";
type SortOrder = "newest" | "oldest";

interface TaskFiltersProps {
  search: string;
  status: TaskStatus | "all";
  sortOrder: SortOrder;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: TaskStatus | "all") => void;
  onSortChange: (value: SortOrder) => void;
}

function TaskFilters({
  search,
  status,
  sortOrder,
  onSearchChange,
  onStatusChange,
  onSortChange,
}: TaskFiltersProps) {
  return (
    <div className="task-filters">
      <input
        type="search"
        placeholder="Search tasks..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />

      <select
        value={status}
        onChange={(e) =>
          onStatusChange(e.target.value as TaskStatus | "all")
        }
      >
        <option value="all">All Statuses</option>
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={sortOrder}
        onChange={(e) =>
          onSortChange(e.target.value as "newest" | "oldest")
        }
      >
        <option value="newest">Newest first</option>
        <option value="oldest">Oldest first</option>
      </select>
    </div>
  );
}

export default TaskFilters;