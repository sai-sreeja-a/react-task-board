
"use client";

import { useOptimistic, useState, useTransition } from "react";

import { updateTaskStatusAction } from "@/lib/actions/tasks";

type TaskStatus = "todo" | "in-progress" | "done";

interface TaskStatusControlProps {
  taskId: string;
  status: TaskStatus;
}

export default function TaskStatusControl({
  taskId,
  status,
}: TaskStatusControlProps) {
  const [optimisticStatus, setOptimisticStatus] =
    useOptimistic(status);

  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");

  const statusLabels: Record<TaskStatus, string> = {
    todo: "To do",
    "in-progress": "In progress",
    done: "Done",
  };

  function handleStatusChange(
    event: React.ChangeEvent<HTMLSelectElement>
  ) {
    const newStatus = event.target.value as TaskStatus;

    setError("");

    startTransition(async () => {
      setOptimisticStatus(newStatus);

      try {
        await updateTaskStatusAction(taskId, newStatus);
      } catch {
        setError("Unable to update status. Please try again.");
      }
    });
  }

  return (
    <div className="mb-4 space-y-2">
      <label
        htmlFor="task-status"
        className="block text-sm font-medium text-gray-700"
      >
        Task status
      </label>

      <select
        id="task-status"
        value={optimisticStatus}
        onChange={handleStatusChange}
        disabled={isPending}
        className="rounded-md border border-gray-300 px-3 py-2 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <option value="todo">To do</option>
        <option value="in-progress">In progress</option>
        <option value="done">Done</option>
      </select>

      {isPending && (
        <p className="text-sm text-gray-500" role="status">
          Saving status...
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      <p className="text-sm text-gray-600">
        Current status: {statusLabels[optimisticStatus]}
      </p>
    </div>
  );
}
