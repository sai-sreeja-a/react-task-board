import Link from "next/link";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import { getUserProjects } from "@/lib/services/project-service";

export default async function ProjectsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const projects = await getUserProjects(user.id);

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="mt-2 text-gray-600">
            Manage your projects and tasks.
          </p>
        </div>

        <Link
          href="/projects/new"
          className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          New project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-lg border border-gray-200 p-8 text-center">
          <h2 className="mb-2 text-xl font-semibold">
            No projects yet
          </h2>
          <p className="mb-4 text-gray-600">
            Create your first project to get started.
          </p>
          <Link
            href="/projects/new"
            className="text-blue-600 hover:underline"
          >
            Create a project
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="rounded-lg border border-gray-200 p-5 transition hover:border-blue-400 hover:shadow-sm"
            >
              <h2 className="mb-2 text-xl font-semibold">
                {project.name}
              </h2>

              <p className="mb-4 line-clamp-3 text-sm text-gray-600">
                {project.description || "No description"}
              </p>

              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs capitalize">
                {project.role}
              </span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
