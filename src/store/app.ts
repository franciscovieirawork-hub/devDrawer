import { create } from "zustand";
import { persist } from "zustand/middleware";

type Theme = "light" | "dark";

interface AppStore {
  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  getThemeImage: () => string;

  // Global loader
  isLoading: boolean;
  setLoading: (loading: boolean) => void;

  // Hydration flag
  hydrated: boolean;
  setHydrated: (hydrated: boolean) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === "light" ? "dark" : "light" }),
      getThemeImage: () => {
        const currentTheme = get().theme;
        return currentTheme === "dark"
          ? "/assets/intro_lightmode.png"
          : "/assets/intro_darkmode.png";
      },

      isLoading: false,
      setLoading: (isLoading) => set({ isLoading }),

      hydrated: false,
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "devdrawer-app",
      partialize: (state) => ({ theme: state.theme }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
    }
  )
);
