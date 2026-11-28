
"use client";

import { useFormStatus } from "react-dom";
import { deleteTaskAction } from "@/lib/actions/tasks";

function DeleteButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md border border-red-300 px-4 py-2 text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Deleting..." : "Delete task"}
    </button>
  );
}

export default function DeleteTaskButton({
  taskId,
}: {
  taskId: string;
}) {
  const action = deleteTaskAction.bind(null, taskId);

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (!window.confirm("Are you sure you want to delete this task?")) {
          event.preventDefault();
        }
      }}
    >
      <DeleteButton />
    </form>
  );
}
