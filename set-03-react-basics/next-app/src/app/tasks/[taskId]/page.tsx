import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getTaskById } from "@/lib/services/task-service";
import { getProjectById } from "@/lib/services/project-service";
import { getTaskComments } from "@/lib/services/comment-service";
import CommentForm from "@/components/comment-form";
import TaskEditForm from "@/components/task-edit-form";
import DeleteTaskButton from "@/components/delete-task-button";
export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ taskId: string }>;
}) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const { taskId } = await params;

  if (!/^[1-9]\d*$/.test(taskId)) {
    notFound();
  }

  const task = await getTaskById(taskId, user.id);

  if (!task) {
    notFound();
  }

  const [project, comments] = await Promise.all([
    getProjectById(task.projectId, user.id),
    getTaskComments(taskId, user.id),
  ]);

  if (!project) {
    notFound();
  }

  const statusLabels: Record<string, string> = {
    todo: "To do",
    "in-progress": "In progress",
    done: "Done",
  };

  return (
    <main className="mx-auto w-full max-w-3xl p-6">
      <Link
        href={`/projects/${project.id}`}
        className="mb-6 inline-block text-sm text-blue-600 hover:underline"
      >
        ← Back to {project.name}
      </Link>

      <section className="rounded-lg border border-gray-200 p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-3xl font-bold">{task.title}</h1>

          <span className="rounded-full bg-gray-100 px-3 py-1 text-sm">
            {statusLabels[task.status] ?? task.status}
          </span>
        </div>

        <h2 className="mb-2 font-semibold">Description</h2>

        <p className="whitespace-pre-wrap text-gray-700">
          {task.description || "No description provided."}
        </p>

        <div className="mt-6 border-t border-gray-200 pt-4 text-sm text-gray-500">
          <p>
            Created: {new Date(task.createdAt).toLocaleString()}
          </p>
          <p>
            Last updated: {new Date(task.updatedAt).toLocaleString()}
          </p>
        </div>
      </section>
      {project.role !== "viewer" && (
        <section className="mt-8 rounded-lg border border-gray-200 p-6">
          <h2 className="mb-4 text-2xl font-bold">Edit task</h2>
                             <TaskEditForm task={task} />

          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="mb-3 font-semibold text-red-600">
              Danger zone
            </h3>
            <DeleteTaskButton taskId={task.id} />
          </div>
        </section>
      )}

      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">
          Comments ({comments.length})
        </h2>

        {comments.length === 0 ? (
          <p className="mb-5 text-gray-500">
            No comments yet. Start the conversation!
          </p>
        ) : (
          <div className="mb-6 space-y-4">
            {comments.map((comment) => (
              <article
                key={comment.id}
                className="rounded-lg border border-gray-200 p-4"
              >
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <p className="font-semibold">{comment.userName}</p>
                  <time
                    dateTime={comment.createdAt}
                    className="text-sm text-gray-500"
                  >
                    {new Date(comment.createdAt).toLocaleString()}
                  </time>
                </div>

                <p className="whitespace-pre-wrap text-gray-700">
                  {comment.content}
                </p>
              </article>
            ))}
          </div>
        )}

        <div className="rounded-lg border border-gray-200 p-5">
          <CommentForm taskId={taskId} />
        </div>
      </section>

    </main>
  );
}
