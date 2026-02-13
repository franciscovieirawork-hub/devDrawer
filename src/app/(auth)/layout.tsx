"use client";

import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAppStore } from "@/store/app";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const themeImage = useAppStore((appStore) => appStore.getThemeImage());
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 py-12 relative">
      {/* Grain overlay */}
      <div className="grain" />

      {/* Theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10 w-full lg:w-[85%] max-w-7xl flex flex-col lg:flex-row items-center lg:items-center gap-12 lg:gap-16">
        {/* Left column - Logo & Image */}
        <div className="w-full lg:w-[55%] flex flex-col items-center lg:items-start lg:justify-center">
          {/* Logo */}
          <h1 className="text-4xl lg:text-5xl font-semibold tracking-tight text-[var(--foreground)] mb-4 lg:mb-8">
            devdrawer
          </h1>

          {/* Image */}
          <div className="w-full flex justify-center lg:justify-start mb-4 lg:mb-6">
            <img
              src={themeImage}
              alt="DevDrawer"
              className="w-full max-w-sm lg:max-w-md xl:max-w-lg h-auto object-contain rounded-lg shadow-2xl"
            />
          </div>

          {/* Footer */}
          <p className="text-xs lg:text-sm text-[var(--muted-foreground)] tracking-wider uppercase">
            plan. draw. build.
          </p>
        </div>

        {/* Right column - Form */}
        <div className="w-full lg:w-[45%] max-w-md lg:max-w-none flex-shrink-0 flex flex-col items-center lg:items-start">
          <div className="w-full">{children}</div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
