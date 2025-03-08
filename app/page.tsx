"use client"

import { useState, useEffect } from "react"
import { TodoApp } from "@/components/todo-app"

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light")

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light")
  }

  // Apply theme class to the document element
  useEffect(() => {
    const root = document.documentElement
    if (theme === "dark") {
      root.classList.add("dark-theme")
      root.classList.remove("light-theme")
    } else {
      root.classList.add("light-theme")
      root.classList.remove("dark-theme")
    }
  }, [theme])

  return (
    <main
      className={`min-h-screen p-4 flex items-center justify-center ${
        theme === "light"
          ? "bg-gradient-to-br from-gray-50 to-gray-100"
          : "bg-gradient-to-br from-gray-900 to-slate-900"
      }`}
    >
      <TodoApp theme={theme} toggleTheme={toggleTheme} />
    </main>
  )
}

