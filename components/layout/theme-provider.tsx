"use client"

import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react"

type Theme = "light" | "dark" | "system"
type ResolvedTheme = "light" | "dark"

interface ThemeContextValue {
  theme: Theme
  setTheme: (theme: Theme) => void
  resolvedTheme: ResolvedTheme
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => {},
  resolvedTheme: "light",
})

export function useTheme() {
  return useContext(ThemeContext)
}

// useLayoutEffect no cliente (aplica tema antes do paint), useEffect no servidor (no-op seguro)
const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

function getResolved(theme: Theme): ResolvedTheme {
  if (theme !== "system") return theme
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
}

function applyTheme(resolved: ResolvedTheme) {
  const root = document.documentElement
  root.classList.remove("light", "dark")
  root.classList.add(resolved)
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light")

  // Lê localStorage e aplica o tema ANTES do primeiro paint (sem FOUC)
  useIsomorphicLayoutEffect(() => {
    const stored = (localStorage.getItem("theme") as Theme | null) ?? "system"
    const resolved = getResolved(stored)
    setThemeState(stored)
    setResolvedTheme(resolved)
    applyTheme(resolved)
  }, [])

  // Reaplicar quando o tema muda (manualmente ou pelo sistema)
  useIsomorphicLayoutEffect(() => {
    const resolved = getResolved(theme)
    setResolvedTheme(resolved)
    applyTheme(resolved)

    if (theme === "system") {
      const mq = window.matchMedia("(prefers-color-scheme: dark)")
      const handle = (e: MediaQueryListEvent) => {
        const r: ResolvedTheme = e.matches ? "dark" : "light"
        setResolvedTheme(r)
        applyTheme(r)
      }
      mq.addEventListener("change", handle)
      return () => mq.removeEventListener("change", handle)
    }
  }, [theme])

  function setTheme(t: Theme) {
    setThemeState(t)
    localStorage.setItem("theme", t)
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
