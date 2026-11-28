"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createTaskAction,
  type TaskActionState,
} from "@/lib/actions/tasks";

const initialState: TaskActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Task"}
    </button>
  );
}

export default function TaskForm({
  projectId,
}: {
  projectId: string;
}) {
  const [state, formAction] = useActionState(
    createTaskAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-5">
      <input type="hidden" name="projectId" value={projectId} />

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
  defaultValue={state.values?.title ?? ""}
  aria-invalid={Boolean(state.errors?.title)}
  aria-describedby={state.errors?.title ? "title-error" : undefined}
  className="w-full rounded-md border border-gray-300 px-3 py-2"
  placeholder="Enter task title"
/>
      {state.errors?.title && (
  <p
    id="title-error"
    className="mt-1 text-sm text-red-600"
  >
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
          defaultValue={state.values?.description ?? ""}
          className="w-full rounded-md border border-gray-300 px-3 py-2"
          placeholder="Describe the task"
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
          defaultValue={state.values?.status ?? "todo"}
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

      <div className="flex items-center gap-3">
        <SubmitButton />
        <Link
          href={`/projects/${projectId}`}
          className="rounded-md border border-gray-300 px-5 py-2 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}