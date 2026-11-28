"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import {
  createProjectAction,
  type ProjectActionState,
} from "@/lib/actions/projects";

const initialState: ProjectActionState = {
  values: {
    name: "",
    description: "",
  },
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-lg bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Creating project..." : "Create project"}
    </button>
  );
}

export default function ProjectForm() {
  const [state, formAction] = useActionState(
    createProjectAction,
    initialState
  );

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Project name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          required
          maxLength={150}
          defaultValue={state.values?.name ?? ""}
          placeholder="Enter your project name"
          aria-invalid={Boolean(state.errors?.name)}
          aria-describedby={state.errors?.name ? "name-error" : undefined}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {state.errors?.name && (
          <p id="name-error" className="mt-2 text-sm text-red-600">
            {state.errors.name[0]}
          </p>
        )}
      </div>

      <div>
        <label
          htmlFor="description"
          className="mb-2 block text-sm font-medium text-gray-700"
        >
          Description
        </label>

        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={1000}
          defaultValue={state.values?.description ?? ""}
          placeholder="Describe your project (optional)"
          aria-invalid={Boolean(state.errors?.description)}
          aria-describedby={
            state.errors?.description ? "description-error" : undefined
          }
          className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />

        {state.errors?.description && (
          <p id="description-error" className="mt-2 text-sm text-red-600">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {state.message && (
        <p role="alert" className="text-sm text-red-600">
          {state.message}
        </p>
      )}

      <div className="flex items-center gap-4">
        <SubmitButton />

        <Link
          href="/projects"
          className="rounded-lg px-5 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}