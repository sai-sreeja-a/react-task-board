"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { registerAction } from "@/lib/actions/auth";
import type { AuthState } from "@/lib/actions/auth";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {pending ? "Creating account..." : "Create account"}
    </button>
  );
}

export default function SignupPage() {
  const initialState: AuthState = {};
  const [state, formAction] = useActionState(registerAction, initialState);

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <h1 className="text-3xl font-bold text-gray-900">
          Create your account
        </h1>

        <p className="mt-2 text-sm text-gray-600">
          Get started with your Task Board.
        </p>

        <form action={formAction} className="mt-8 space-y-5">
          {state.errors?.form?.map((error) => (
            <p
              key={error}
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          ))}

          <div>
            <label
              htmlFor="name"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Full name
            </label>

            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              defaultValue={state.values?.name ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-invalid={Boolean(state.errors?.name?.length)}
              aria-describedby="name-error"
            />

            {state.errors?.name?.map((error) => (
              <p
                key={error}
                id="name-error"
                className="mt-1 text-sm text-red-600"
              >
                {error}
              </p>
            ))}
          </div>

          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email address
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              defaultValue={state.values?.email ?? ""}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-invalid={Boolean(state.errors?.email?.length)}
              aria-describedby="email-error"
            />

            {state.errors?.email?.map((error) => (
              <p
                key={error}
                id="email-error"
                className="mt-1 text-sm text-red-600"
              >
                {error}
              </p>
            ))}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              maxLength={72}
              required
              className="w-full rounded-lg border border-gray-300 px-3 py-3 text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              aria-invalid={Boolean(state.errors?.password?.length)}
              aria-describedby="password-error"
            />

            {state.errors?.password?.map((error) => (
              <p
                key={error}
                id="password-error"
                className="mt-1 text-sm text-red-600"
              >
                {error}
              </p>
            ))}

            <p className="mt-1 text-xs text-gray-500">
              Use at least 8 characters.
            </p>
          </div>

          <SubmitButton />
        </form>

        <p className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-blue-600 hover:text-blue-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
