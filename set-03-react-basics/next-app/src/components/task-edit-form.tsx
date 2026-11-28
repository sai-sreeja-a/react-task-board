"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  updateTaskAction,
  type TaskActionState,
} from "@/lib/actions/tasks";

interface TaskEditFormProps {
  task: {
    id: string;
    title: string;
    description: string;
    status: "todo" | "in-progress" | "done";
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

export default function TaskEditForm({ task }: TaskEditFormProps) {
  const updateAction = updateTaskAction.bind(null, task.id);

  const initialState: TaskActionState = {
    values: {
      title: task.title,
      description: task.description,
      status: task.status,
    },
  };

  const [state, formAction] = useActionState(
    updateAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label htmlFor="title" className="mb-1 block font-medium">
          Task title
        </label>

        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={100}
          defaultValue={state.values?.title ?? task.title}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        {state.errors?.title && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.title[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="mb-1 block font-medium">
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={500}
          defaultValue={state.values?.description ?? task.description}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        {state.errors?.description && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="status" className="mb-1 block font-medium">
          Status
        </label>

        <select
          id="status"
          name="status"
          defaultValue={state.values?.status ?? task.status}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        >
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>

        {state.errors?.status && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.status[0]}
          </p>
        )}
      </div>

      {state.message && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <SubmitButton />
    </form>
  );
}