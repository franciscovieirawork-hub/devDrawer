import { deleteSession, getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
    <div className="min-h-screen bg-[var(--background)]">
      <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--card)]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <h1 className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
            devdrawer
          </h1>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--muted-foreground)] hidden sm:inline">
              @{user.username}
            </span>
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
      <main className="max-w-7xl mx-auto p-6">{children}</main>
    </div>
  );
}
