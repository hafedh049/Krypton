"use client"

import { Moon, Sun } from "lucide-react"

interface ThemeToggleProps {
  theme: "light" | "dark"
  toggleTheme: () => void
}

export function ThemeToggle({ theme, toggleTheme }: ThemeToggleProps) {
  const isLight = theme === "light"

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md transition-all duration-200 ${
        isLight
          ? "bg-white text-gray-700 shadow-neomorphic-sm hover:bg-gray-50"
          : "bg-gray-700 text-white hover:bg-gray-600"
      }`}
      aria-label={isLight ? "Switch to dark theme" : "Switch to light theme"}
    >
      {isLight ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  )
}

