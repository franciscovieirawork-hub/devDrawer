import { deleteSession, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  async function handleLogout() {
    "use server";
    await deleteSession();
    redirect("/login");
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] overflow-hidden">
      <header className="shrink-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <a
            href="/dashboard"
            className="text-lg font-semibold tracking-tight text-[var(--foreground)]"
          >
            devdrawer
          </a>
          <div className="flex items-center gap-3">
            <Link
              href="/profile"
              className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] hidden sm:inline transition-colors"
            >
              @{user.username}
            </Link>
            <ThemeToggle />
            <form action={handleLogout}>
              <button
                type="submit"
                className="h-9 px-3 text-sm font-medium text-[var(--destructive)] rounded-lg hover:bg-[var(--muted)] transition-colors"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="flex-1 flex flex-col min-h-0 max-w-7xl mx-auto p-6 w-full">
        {children}
      </main>
    </div>
  );
}
