"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/app";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = useAppStore((s) => s.theme);
  const hydrated = useAppStore((s) => s.hydrated);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  if (!hydrated) return null;

  return <>{children}</>;
}
