
"use client";

import { useEffect } from "react";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <h1 className="mb-3 text-2xl font-bold">
        Something went wrong
      </h1>

      <p className="mb-5 text-gray-600">
       We couldn&apos;t load this page. Please try again.
      </p>

      <button
        onClick={() => reset()}
        className="rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        Try again
      </button>
    </main>
  );
}
