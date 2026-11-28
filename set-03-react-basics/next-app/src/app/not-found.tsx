import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl p-6 text-center">
      <h1 className="mb-3 text-4xl font-bold">404</h1>

      <h2 className="mb-4 text-2xl font-semibold">
        Page not found
      </h2>

      <p className="mb-6 text-gray-600">
       The page or resource you&apos;re looking for doesn&apos;t exist,
or you don&apos;t have permission to access it.
      </p>

      <Link
        href="/projects"
        className="inline-block rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
      >
        Go to projects
      </Link>
    </main>
  );
}