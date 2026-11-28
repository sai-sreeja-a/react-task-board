"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createCommentAction,
  type CommentActionState,
} from "@/lib/actions/tasks";

const initialState: CommentActionState = {};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {pending ? "Posting..." : "Add comment"}
    </button>
  );
}

export default function CommentForm({
  taskId,
}: {
  taskId: string;
}) {
  const action = createCommentAction.bind(null, taskId);

  const [state, formAction] = useActionState(
    action,
    initialState
  );

  return (
    <form action={formAction} className="space-y-3">
      <div>
        <label htmlFor="content" className="mb-1 block font-medium">
          Your comment
        </label>

        <textarea
          id="content"
          name="content"
          rows={3}
          maxLength={2000}
          required
          defaultValue={state.values?.content ?? ""}
          placeholder="Write a comment..."
          className="w-full rounded-md border border-gray-300 px-3 py-2"
        />

        {state.errors?.content && (
          <p className="mt-1 text-sm text-red-600">
            {state.errors.content[0]}
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