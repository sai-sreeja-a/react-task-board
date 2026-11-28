
export default function TaskDetailLoading() {
  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <div className="mb-6 h-4 w-40 animate-pulse rounded bg-gray-200" />

      <section className="rounded-lg border border-gray-200 p-6">
        <div className="mb-4 h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-4 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-20 animate-pulse rounded bg-gray-100" />
      </section>

      <section className="mt-8">
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="h-24 animate-pulse rounded-lg border border-gray-200 bg-gray-100" />
      </section>

      <p className="mt-4 text-gray-500">Loading task details...</p>
    </main>
  );
}
