import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 relative">
      {/* Grain overlay */}
      <div className="grain" />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full max-w-md flex flex-col items-center">
        {/* Logo */}
        <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)] mb-12">
          devdrawer
        </h1>

        {/* Card */}
        {children}

        {/* Footer */}
        <p className="mt-10 text-xs text-[var(--muted-foreground)] tracking-wide">
          plan. draw. build.
        </p>
      </div>
    </div>
  );
}
