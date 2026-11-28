import Link from "next/link";
import { redirect, notFound } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import {
  getProjectById,
} from "@/lib/services/project-service";
import { getAllTasks } from "@/lib/services/task-service";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { projectId } = await params;

  if (!/^[1-9]\d*$/.test(projectId)) {
    notFound();
  }

  const project = await getProjectById(projectId, user.id);

  if (!project) {
    notFound();
  }

  const result = await getAllTasks(
    {
      page: 1,
      limit: 100,
      projectId,
      sortBy: "createdAt",
      order: "desc",
    },
    user.id
  );

  const tasks = result.tasks;

  const statusLabels: Record<string, string> = {
    todo: "To do",
    "in-progress": "In progress",
    done: "Done",
  };

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <Link
        href="/projects"
        className="mb-4 inline-block text-sm text-blue-600 hover:underline"
      >
        ← Back to projects
      </Link>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{project.name}</h1>
          <p className="mt-2 text-gray-600">
            {project.description || "No project description"}
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Your role: {project.role}
          </p>
        </div>

        {project.role !== "viewer" && (
          <Link
            href={`/projects/${projectId}/tasks/new`}
            className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            New task
          </Link>
        )}
      </div>

      <section>
        <h2 className="mb-4 text-2xl font-semibold">
          Tasks ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <div className="rounded-lg border border-gray-200 p-8 text-center">
            <h3 className="mb-2 text-xl font-semibold">
              No tasks yet
            </h3>
            <p className="text-gray-600">
              This project doesn&apos;t have any tasks yet.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task) => (
              <Link
                key={task.id}
                href={`/tasks/${task.id}`}
                className="block rounded-lg border border-gray-200 p-4 transition hover:border-blue-400 hover:shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">{task.title}</h3>

                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs">
                    {statusLabels[task.status] ?? task.status}
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-600">
                  {task.description || "No description"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
