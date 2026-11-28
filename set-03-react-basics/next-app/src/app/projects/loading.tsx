export default function ProjectsLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mt-3 h-4 w-72 animate-pulse rounded bg-gray-200" />
      </div>

      <p className="text-gray-500">Loading your projects...</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="h-36 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    </main>
  );
}