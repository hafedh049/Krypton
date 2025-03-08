"use client"

import { useState, useEffect, useRef } from "react"
import { PlusCircle, Search, Plus, X, Hash } from "lucide-react"
import type { Task, Category, CategoryItem } from "@/types/todo"
import { TaskItem } from "@/components/task-item"
import { cn } from "@/lib/utils"
import { MarkdownEditor } from "@/components/markdown-editor"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CalendarView } from "./calendar/calendar-view"
import { Dashboard } from "./dashboard/dashboard"
import { ThemeToggle } from "./theme-toggle"

interface TodoAppProps {
  theme: "light" | "dark"
  toggleTheme: () => void
}

// Storage keys
const STORAGE_KEYS = {
  TASKS: "fancy-todo-tasks",
  CATEGORIES: "fancy-todo-categories",
  ACTIVE_CATEGORY: "fancy-todo-active-category",
  VIEW: "fancy-todo-view",
}

// Helper function to safely parse JSON from localStorage
const getStoredData = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === "undefined") return defaultValue

  try {
    const storedData = localStorage.getItem(key)
    if (!storedData) return defaultValue
    return JSON.parse(storedData) as T
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error)
    return defaultValue
  }
}

// Helper function to safely store data in localStorage
const storeData = <T,>(key: string, data: T): void => {
  if (typeof window === "undefined") return

  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error)
  }
}

// Helper function to prepare tasks for storage
const prepareTasksForStorage = (tasks: Task[]): any[] => {
  return tasks.map((task) => ({
    ...task,
    // Ensure text is properly stored with correct newlines
    text: task.text.replace(/\r\n/g, "\n"), // Normalize line endings
    createdAt: task.createdAt.toISOString(),
    scheduledTime: task.scheduledTime
      ? {
          ...task.scheduledTime,
          date: task.scheduledTime.date.toISOString(),
        }
      : undefined,
  }))
}

export function TodoApp({ theme, toggleTheme }: TodoAppProps) {
  const [date, setDate] = useState("")
  const [tasks, setTasks] = useState<Task[]>([])
  const [categories, setCategories] = useState<CategoryItem[]>([])
  const [activeCategory, setActiveCategory] = useState<Category>("today")
  const [newTaskText, setNewTaskText] = useState("")
  const [showNewTaskEditor, setShowNewTaskEditor] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState("")
  const [newCategoryIcon, setNewCategoryIcon] = useState("📁")
  const [searchQuery, setSearchQuery] = useState("")
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [view, setView] = useState<"tasks" | "calendar" | "dashboard">("tasks")
  const [isInitialized, setIsInitialized] = useState(false)

  const mainContentRef = useRef<HTMLDivElement>(null)

  // Initialize with sample data or load from localStorage
  useEffect(() => {
    const initialCategories: CategoryItem[] = [
      { id: "home", name: "Home", icon: "🏠" },
      { id: "completed", name: "Completed", icon: "✅" },
      { id: "today", name: "Today", icon: "📅" },
      { id: "personal", name: "Personal", icon: "👤" },
      { id: "work", name: "Work", icon: "💼" },
    ]

    const initialTasks: Task[] = [
      {
        id: "1",
        text: "# Client Meeting Preparation\n\n- Finish the sales presentation\n- Prepare talking points\n- Review client history\n\n**Meeting at 2 PM**",
        completed: false,
        category: "today",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        scheduledTime: {
          date: new Date(),
          startTime: "14:00",
          endTime: "15:00",
        },
      },
      {
        id: "2",
        text: "Send follow-up emails to potential leads",
        completed: false,
        category: "today",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
      },
      {
        id: "3",
        text: "## Q4 Marketing Budget\n\n- Review department requests\n- Allocate resources\n- Prepare presentation for board\n\n> Remember to focus on ROI metrics",
        completed: true,
        category: "today",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
      },
      {
        id: "4",
        text: "Attend the team meeting at 10:30 AM",
        completed: true,
        category: "today",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
      },
      {
        id: "5",
        text: "# Exercise Plan\n\n1. 10 min warm-up\n2. 15 min cardio\n3. 15 min strength\n\n*Remember to stretch afterward*",
        completed: false,
        category: "personal",
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3), // 3 days ago
      },
    ]

    // Load data from localStorage or use initial data
    const storedTasks = getStoredData<Task[]>(STORAGE_KEYS.TASKS, [])
    const storedCategories = getStoredData<CategoryItem[]>(STORAGE_KEYS.CATEGORIES, [])
    const storedActiveCategory = getStoredData<Category>(STORAGE_KEYS.ACTIVE_CATEGORY, "today")
    const storedView = getStoredData<"tasks" | "calendar" | "dashboard">(STORAGE_KEYS.VIEW, "tasks")

    // Parse dates from stored tasks and ensure markdown text is properly formatted
    const parsedTasks =
      storedTasks.length > 0
        ? storedTasks.map((task) => ({
            ...task,
            // Ensure text is properly formatted with correct newlines
            text: task.text.replace(/\\n/g, "\n"),
            createdAt: new Date(task.createdAt),
            scheduledTime: task.scheduledTime
              ? { ...task.scheduledTime, date: new Date(task.scheduledTime.date) }
              : undefined,
          }))
        : initialTasks

    setTasks(parsedTasks)
    setCategories(storedCategories.length > 0 ? storedCategories : initialCategories)
    setActiveCategory(storedActiveCategory)
    setView(storedView)

    // Set current date
    const now = new Date()
    const options: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }
    setDate(now.toLocaleDateString("en-US", options))

    setIsInitialized(true)
  }, [])

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return

    storeData(STORAGE_KEYS.TASKS, prepareTasksForStorage(tasks))
    storeData(STORAGE_KEYS.CATEGORIES, categories)
    storeData(STORAGE_KEYS.ACTIVE_CATEGORY, activeCategory)
    storeData(STORAGE_KEYS.VIEW, view)
  }, [tasks, categories, activeCategory, view, isInitialized])

  const toggleTaskCompletion = (taskId: string) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, completed: !task.completed } : task)))
  }

  const addNewTask = (markdown: string, scheduledTime?: { date: Date; startTime: string; endTime: string }) => {
    if (markdown.trim()) {
      // If no scheduled time is provided, use current date and time
      let taskScheduledTime = scheduledTime

      if (!taskScheduledTime) {
        const now = new Date()
        const currentHour = now.getHours()
        const nextHour = (currentHour + 1) % 24

        taskScheduledTime = {
          date: now,
          startTime: `${currentHour.toString().padStart(2, "0")}:00`,
          endTime: `${nextHour.toString().padStart(2, "0")}:00`,
        }
      }

      const newTask: Task = {
        id: Date.now().toString(),
        text: markdown,
        completed: false,
        category: activeCategory,
        createdAt: new Date(),
        scheduledTime: taskScheduledTime,
      }
      setTasks([...tasks, newTask])
      setNewTaskText("")
      setShowNewTaskEditor(false)
    }
  }

  const addNewCategory = () => {
    if (newCategoryName.trim()) {
      const newCategory: CategoryItem = {
        id: newCategoryName.toLowerCase().replace(/\s+/g, "-"),
        name: newCategoryName,
        icon: newCategoryIcon,
      }
      setCategories([...categories, newCategory])
      setNewCategoryName("")
      setNewCategoryIcon("📁")
      setShowNewCategoryModal(false)
    }
  }

  const filteredTasks = tasks.filter((task) => {
    // First filter by category
    const matchesCategory = activeCategory === "completed" ? task.completed : task.category === activeCategory

    // Then filter by search query if one exists
    const matchesSearch = searchQuery ? task.text.toLowerCase().includes(searchQuery.toLowerCase()) : true

    return matchesCategory && matchesSearch
  })

  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // Less than a day
    if (diff < 1000 * 60 * 60 * 24) {
      const hours = Math.floor(diff / (1000 * 60 * 60))
      if (hours < 1) {
        const minutes = Math.floor(diff / (1000 * 60))
        return minutes < 1 ? "Just now" : `${minutes}m ago`
      }
      return `${hours}h ago`
    }

    // Less than a week
    if (diff < 1000 * 60 * 60 * 24 * 7) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      return `${days}d ago`
    }

    // Format as date
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })
  }

  const isLight = theme === "light"

  // Get greeting based on time of day
  const getGreeting = () => {
    const hours = new Date().getHours()
    if (hours >= 5 && hours < 12) {
      return "Good Morning"
    } else if (hours >= 12 && hours < 17) {
      return "Good Afternoon"
    } else if (hours >= 17 && hours < 22) {
      return "Good Evening"
    } else {
      return "Good Night"
    }
  }

  return (
    <div
      className={`fixed inset-0 flex flex-col overflow-hidden rounded-xl ${
        isLight ? "bg-gray-50 border border-gray-200 shadow-neomorphic" : "bg-gray-800 border border-gray-700"
      }`}
    >
      <div
        className={`p-4 sm:p-6 border-b flex-shrink-0 ${
          isLight ? "bg-white border-gray-200 shadow-neomorphic-sm" : "bg-gray-800 border-gray-700"
        }`}
      >
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1
              className={`text-xl sm:text-2xl font-bold flex items-center gap-2 ${
                isLight ? "text-gray-800" : "text-white"
              }`}
            >
              {getGreeting()}
              <span role="img" aria-label="waving hand" className="animate-wave">
                👋
              </span>
            </h1>
            <p className={`text-sm sm:text-base ${isLight ? "text-gray-500" : "text-gray-400"}`}>It&apos;s {date}</p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-initial">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${
                  isLight ? "text-gray-400" : "text-gray-500"
                }`}
              />
              <input
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 ${
                  isLight
                    ? "bg-white border border-gray-200 text-gray-800 shadow-neomorphic-sm"
                    : "bg-gray-700 border border-gray-600 text-white"
                }`}
              />
            </div>
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          </div>
        </div>

        <div className="mt-4 sm:mt-6">
          <div
            className={`light-bulb-tip p-3 sm:p-4 rounded-lg border mb-4 ${
              isLight ? "bg-white border-gray-200 shadow-neomorphic-sm" : "bg-gray-700 border-gray-600"
            }`}
          >
            <p className="flex items-start gap-2">
              <span role="img" aria-label="light bulb" className="text-xl">
                💡
              </span>
              <span className={`text-sm ${isLight ? "text-gray-600" : "text-gray-300"}`}>
                Are you tired of juggling multiple tasks and deadlines? Our To-Do app helps you boost your productivity.
                Whether it&apos;s work-related projects, household chores, or personal goals, we&apos;ve got you
                covered.
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewTaskEditor(true)}
              className={`p-2 rounded-full ${
                isLight ? "hover:bg-gray-100 text-purple-500 shadow-neomorphic-sm" : "hover:bg-gray-700 text-gray-300"
              }`}
            >
              <PlusCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => setShowNewTaskEditor(true)}
              className={`flex-1 p-2 text-left border rounded-lg focus:outline-none ${
                isLight
                  ? "bg-white border-gray-200 text-gray-500 hover:bg-gray-50 shadow-neomorphic-sm"
                  : "bg-gray-700 border-gray-600 text-gray-400 hover:bg-gray-600"
              }`}
            >
              New Task...
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div
          className={`w-64 border-r p-4 overflow-y-auto hidden md:block ${
            isLight ? "bg-white border-gray-200 shadow-neomorphic-sm" : "bg-gray-800 border-gray-700"
          }`}
        >
          <div className="space-y-1">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "w-full flex items-center justify-between p-2 rounded-lg text-left",
                  isLight ? "text-gray-700" : "text-gray-300",
                  activeCategory === category.id
                    ? isLight
                      ? "bg-purple-50 shadow-neomorphic-inner"
                      : "bg-gray-700"
                    : isLight
                      ? "hover:bg-gray-50 shadow-neomorphic-sm"
                      : "hover:bg-gray-700/50",
                )}
              >
                <div className="flex items-center gap-2">
                  <span role="img" aria-label={category.name}>
                    {category.icon}
                  </span>
                  <span>{category.name}</span>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    isLight ? "bg-white text-gray-700 shadow-neomorphic-sm" : "bg-gray-600 text-gray-300"
                  }`}
                >
                  {category.id === "completed"
                    ? tasks.filter((t) => t.completed).length
                    : tasks.filter((t) => t.category === category.id).length}
                </span>
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowNewCategoryModal(true)}
            className={`mt-4 w-full flex items-center justify-center gap-2 p-2 rounded-lg border border-dashed focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${
              isLight
                ? "border-gray-300 text-gray-500 hover:bg-gray-50 focus:ring-offset-white shadow-neomorphic-sm"
                : "border-gray-600 text-gray-400 hover:bg-gray-700/50 focus:ring-offset-gray-800"
            }`}
            type="button"
          >
            <Plus className="h-4 w-4" />
            <span>New Category</span>
          </button>
        </div>

        {/* Mobile category selector */}
        <div
          className={`md:hidden p-2 border-b flex overflow-x-auto ${
            isLight ? "bg-white border-gray-200 shadow-neomorphic-sm" : "bg-gray-800 border-gray-700"
          }`}
        >
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={cn(
                "flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full mr-2",
                activeCategory === category.id
                  ? isLight
                    ? "bg-purple-50 shadow-neomorphic-inner"
                    : "bg-gray-700"
                  : isLight
                    ? "bg-white border border-gray-200 shadow-neomorphic-sm"
                    : "bg-gray-800 border border-gray-700",
              )}
            >
              <span role="img" aria-label={category.name}>
                {category.icon}
              </span>
              <span className={isLight ? "text-gray-700 text-sm" : "text-gray-300 text-sm"}>{category.name}</span>
            </button>
          ))}
          <button
            onClick={() => setShowNewCategoryModal(true)}
            className={`flex-shrink-0 flex items-center gap-1 px-3 py-1 rounded-full ${
              isLight ? "bg-white border border-gray-200 shadow-neomorphic-sm" : "bg-gray-800 border border-gray-700"
            }`}
            type="button"
          >
            <Plus className={isLight ? "h-4 w-4 text-gray-500" : "h-4 w-4 text-gray-400"} />
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* View Toggle */}
          <div
            className={`p-4 border-b flex items-center gap-4 ${
              isLight ? "bg-white border-gray-200 shadow-neomorphic-sm" : "bg-gray-800 border-gray-700"
            }`}
          >
            <button
              onClick={() => setView("tasks")}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                view === "tasks"
                  ? isLight
                    ? "bg-purple-500 text-white shadow-neomorphic-sm"
                    : "bg-purple-600 text-white"
                  : isLight
                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-neomorphic-sm"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white",
              )}
            >
              Tasks
            </button>
            <button
              onClick={() => setView("calendar")}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                view === "calendar"
                  ? isLight
                    ? "bg-purple-500 text-white shadow-neomorphic-sm"
                    : "bg-purple-600 text-white"
                  : isLight
                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-neomorphic-sm"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white",
              )}
            >
              Calendar
            </button>
            <button
              onClick={() => setView("dashboard")}
              className={cn(
                "px-4 py-2 rounded-lg transition-colors",
                view === "dashboard"
                  ? isLight
                    ? "bg-purple-500 text-white shadow-neomorphic-sm"
                    : "bg-purple-600 text-white"
                  : isLight
                    ? "text-gray-500 hover:bg-gray-100 hover:text-gray-700 shadow-neomorphic-sm"
                    : "text-gray-400 hover:bg-gray-700 hover:text-white",
              )}
            >
              Dashboard
            </button>
          </div>

          {/* View Content */}
          <div
            className={`flex-1 overflow-hidden p-4 ${
              isLight ? "bg-gray-50 bg-opacity-70" : "bg-gray-800 bg-opacity-90"
            }`}
          >
            {view === "tasks" ? (
              <div className={`h-full overflow-y-auto custom-scrollbar ${isLight ? "light-theme" : ""}`}>
                <h2
                  className={`text-lg font-semibold mb-4 flex items-center gap-2 ${
                    isLight ? "text-gray-800" : "text-white"
                  }`}
                >
                  <span role="img" aria-label={categories.find((c) => c.id === activeCategory)?.name || ""}>
                    {categories.find((c) => c.id === activeCategory)?.icon}
                  </span>
                  {categories.find((c) => c.id === activeCategory)?.name}
                </h2>

                <div className="space-y-3">
                  {filteredTasks.length > 0 ? (
                    filteredTasks.map((task) => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        onToggle={() => toggleTaskCompletion(task.id)}
                        formattedDate={formatDate(task.createdAt)}
                        lightTheme={isLight}
                      />
                    ))
                  ) : (
                    <div
                      className={`text-center py-12 rounded-lg ${
                        isLight ? "bg-white shadow-neomorphic" : "bg-gray-800"
                      }`}
                    >
                      <Hash className={`h-12 w-12 mx-auto mb-4 ${isLight ? "text-gray-300" : "text-gray-600"}`} />
                      <p className={isLight ? "text-gray-500" : "text-gray-400"}>No tasks in this category</p>
                      <button
                        onClick={() => setShowNewTaskEditor(true)}
                        className={`mt-4 px-4 py-2 rounded-lg text-white ${
                          isLight
                            ? "bg-purple-500 hover:bg-purple-600 shadow-neomorphic-sm"
                            : "bg-purple-600 hover:bg-purple-700"
                        }`}
                      >
                        Create a task
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : view === "calendar" ? (
              <CalendarView tasks={tasks} onAddTask={(task) => setTasks([...tasks, task])} lightTheme={isLight} />
            ) : (
              <Dashboard
                tasks={tasks}
                categories={categories}
                userName={"User"}
                onAddTask={() => setShowNewTaskEditor(true)}
                lightTheme={isLight}
              />
            )}
          </div>
        </div>
      </div>

      {/* New Task Editor Modal */}
      {showNewTaskEditor && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border ${
              isLight ? "bg-white border-gray-200 shadow-neomorphic" : "bg-gray-800 border-gray-700"
            }`}
          >
            <div
              className={`p-4 border-b flex justify-between items-center ${
                isLight ? "border-gray-200" : "border-gray-700"
              }`}
            >
              <h3 className={`text-lg font-medium ${isLight ? "text-gray-800" : "text-white"}`}>Create New Task</h3>
              <button
                onClick={() => setShowNewTaskEditor(false)}
                className={isLight ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-white"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              <MarkdownEditor
                initialValue={newTaskText}
                onSave={addNewTask}
                onCancel={() => setShowNewTaskEditor(false)}
                lightTheme={isLight}
              />
            </div>
          </div>
        </div>
      )}

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div
            className={`rounded-lg w-full max-w-md overflow-hidden border ${
              isLight ? "bg-white border-gray-200 shadow-neomorphic" : "bg-gray-800 border-gray-700"
            }`}
          >
            <div
              className={`p-4 border-b flex justify-between items-center ${
                isLight ? "border-gray-200" : "border-gray-700"
              }`}
            >
              <h3 className={`text-lg font-medium ${isLight ? "text-gray-800" : "text-white"}`}>Create New Category</h3>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className={isLight ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-white"}
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-lg text-2xl ${isLight ? "bg-white shadow-neomorphic-sm" : "bg-gray-700"}`}>
                  {newCategoryIcon}
                </div>
                <Input
                  placeholder="Category name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className={
                    isLight
                      ? "bg-white border-gray-200 text-gray-800 shadow-neomorphic-sm"
                      : "bg-gray-700 border-gray-600 text-white"
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addNewCategory()
                    }
                  }}
                />
              </div>
              <div>
                <label className={`text-sm mb-2 block ${isLight ? "text-gray-500" : "text-gray-400"}`}>
                  Select Icon
                </label>
                <div
                  className={`grid grid-cols-8 gap-2 p-2 rounded-lg ${
                    isLight ? "bg-white shadow-neomorphic-sm" : "bg-gray-700"
                  }`}
                >
                  {["📁", "🏠", "💼", "📚", "🎮", "🎯", "🛒", "🎓", "🏋️", "🎨", "🎬", "🍔", "🌎", "🚗", "💰", "❤️"].map(
                    (icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setNewCategoryIcon(icon)}
                        className={cn(
                          "h-8 w-8 flex items-center justify-center rounded",
                          newCategoryIcon === icon
                            ? isLight
                              ? "bg-purple-100 shadow-neomorphic-inner"
                              : "bg-purple-600"
                            : isLight
                              ? "hover:bg-gray-100 shadow-neomorphic-sm"
                              : "hover:bg-gray-600",
                        )}
                      >
                        <span role="img">{icon}</span>
                      </button>
                    ),
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  onClick={() => setShowNewCategoryModal(false)}
                  variant="outline"
                  className={
                    isLight
                      ? "border-gray-200 text-gray-700 hover:bg-gray-50 shadow-neomorphic-sm"
                      : "border-gray-600 text-gray-300 hover:bg-gray-700"
                  }
                >
                  Cancel
                </Button>
                <Button
                  onClick={addNewCategory}
                  className={
                    isLight
                      ? "bg-purple-500 hover:bg-purple-600 text-white shadow-neomorphic-sm"
                      : "bg-purple-600 hover:bg-purple-700 text-white"
                  }
                >
                  Create Category
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

