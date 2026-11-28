import { redirect, notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getProjectById } from "@/lib/services/project-service";
import TaskForm from "@/components/task-form";

export default async function NewTaskPage({
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

  if (project.role === "viewer") {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <h1 className="mb-4 text-2xl font-bold">
          Permission denied
        </h1>
        <p className="text-gray-600">
          You have view-only access to this project and cannot
          create tasks.
        </p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Create task</h1>
      <p className="mb-6 text-gray-600">
        Project: {project.name}
      </p>

      <TaskForm projectId={projectId} />
    </main>
  );
}
