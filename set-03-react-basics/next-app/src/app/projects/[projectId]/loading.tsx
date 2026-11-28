
export default function ProjectDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-gray-200" />

      <div className="mb-3 h-8 w-64 animate-pulse rounded bg-gray-200" />
      <div className="mb-8 h-4 w-96 max-w-full animate-pulse rounded bg-gray-200" />

      <p className="mb-4 text-gray-500">Loading project tasks...</p>

      <div className="space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="h-20 animate-pulse rounded-lg border border-gray-200 bg-gray-100"
          />
        ))}
      </div>
    </main>
  );
}
