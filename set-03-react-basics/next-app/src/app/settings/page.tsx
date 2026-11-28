
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/lib/auth";

export default async function SettingsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <h1 className="mb-2 text-3xl font-bold">Settings</h1>

      <p className="mb-6 text-gray-600">
        View your account information.
      </p>

      <section className="rounded-lg border border-gray-200 p-6">
        <h2 className="mb-4 text-xl font-semibold">
          Account details
        </h2>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="font-medium">{user.name}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="font-medium">{user.email}</p>
          </div>
        </div>
      </section>
    </main>
  );
}
