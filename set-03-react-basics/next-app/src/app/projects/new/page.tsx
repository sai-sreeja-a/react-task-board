import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";
import ProjectForm from "@/components/project-form";

export default async function NewProjectPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Create a New Project
        </h1>

        <p className="mt-2 text-gray-600">
          Give your project a name and an optional description.
        </p>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <ProjectForm />
      </div>
    </main>
  );
}