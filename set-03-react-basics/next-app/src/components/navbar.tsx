import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions/auth";

export default async function Navbar() {
  const user = await getCurrentUser();

  if (!user) {
    return null;
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/projects"
          className="text-xl font-bold text-gray-900"
        >
          Task Board
        </Link>

        <div className="flex items-center gap-6">
          <Link
            href="/projects"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Projects
          </Link>

          <Link
            href="/settings"
            className="text-sm font-medium text-gray-700 hover:text-blue-600"
          >
            Settings
          </Link>

          <span className="text-sm text-gray-600">
            {user.name}
          </span>

          <form action={logoutAction}>
            <button
              type="submit"
              className="rounded-lg bg-gray-100 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-200"
            >
              Log out
            </button>
          </form>
        </div>
      </nav>
    </header>
  );
}
