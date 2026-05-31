import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export type ThemeMode = 'light' | 'dark' | 'system'

interface ThemeState {
  mode: ThemeMode
  setMode: (mode: ThemeMode) => void
}

/** Resolve 'system' to the OS preference, then toggle the `dark` class on <html>. */
export function applyTheme(mode: ThemeMode): void {
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = mode === 'dark' || (mode === 'system' && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

/**
 * Persisted theme preference (localStorage). On the web we apply the theme by
 * toggling a `dark` class on <html> (Tailwind's dark variant) instead of a
 * provider. `applyTheme` runs on every set and once on rehydrate.
 */
export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'light',
      setMode: (mode) => {
        applyTheme(mode)
        set({ mode })
      },
    }),
    {
      name: 'theme-preference',
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        applyTheme(state?.mode ?? 'light')
      },
    },
  ),
)
