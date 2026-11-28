
export default function Loading() {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
      <p className="mt-4 text-gray-500" role="status">
        Loading page...
      </p>
    </main>
  );
}
