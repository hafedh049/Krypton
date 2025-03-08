"use client"

import { useState, useEffect } from "react"
import type { Task, CategoryItem } from "@/types/todo"
import { TaskChart } from "./task-chart"
import { DailySchedule } from "./daily-schedule"
import { StatCard } from "./stat-card"

interface DashboardProps {
  tasks: Task[]
  categories: CategoryItem[]
  userName: string
  onAddTask: () => void
  lightTheme?: boolean
}

export function Dashboard({ tasks, categories, userName, onAddTask, lightTheme = true }: DashboardProps) {
  const [greeting, setGreeting] = useState("Good morning")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMounted, setIsMounted] = useState(false)

  // Update greeting based on time of day
  useEffect(() => {
    const hours = new Date().getHours()
    if (hours < 12) {
      setGreeting("Good morning")
    } else if (hours < 18) {
      setGreeting("Good afternoon")
    } else {
      setGreeting("Good evening")
    }

    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(interval)
  }, [])

  // Calculate task statistics
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((task) => task.completed).length
  const inProgressTasks = tasks.filter(
    (task) => !task.completed && task.scheduledTime && new Date(task.scheduledTime.date) <= new Date(),
  ).length
  const pendingTasks = totalTasks - completedTasks - inProgressTasks
  const totalCategories = categories.length

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const fancyScrollbarStyles = `
  .fancy-scrollbar::-webkit-scrollbar {
    width: 10px;
    height: 10px;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-track {
    background: ${lightTheme ? "rgba(243, 244, 246, 0.7)" : "rgba(31, 41, 55, 0.7)"};
    border-radius: 10px;
    margin: 2px;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-thumb {
    background: ${lightTheme ? "rgba(168, 85, 247, 0.5)" : "rgba(168, 85, 247, 0.7)"};
    border-radius: 10px;
    border: 2px solid ${lightTheme ? "rgba(243, 244, 246, 0.7)" : "rgba(31, 41, 55, 0.7)"};
    transition: all 0.3s ease;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-thumb:hover {
    background: ${lightTheme ? "rgba(168, 85, 247, 0.7)" : "rgba(168, 85, 247, 0.9)"};
    cursor: pointer;
  }
  
  .fancy-scrollbar::-webkit-scrollbar-corner {
    background: transparent;
  }
`

  useEffect(() => {
    if (isMounted) {
      const styleElement = document.createElement("style")
      styleElement.innerHTML = fancyScrollbarStyles
      document.head.appendChild(styleElement)

      return () => {
        document.head.removeChild(styleElement)
      }
    }
  }, [lightTheme, isMounted])

  return (
    <div
      className={`h-full overflow-auto ${
        lightTheme ? "bg-gray-100 text-gray-800" : "bg-gray-800 bg-opacity-90 text-white"
      } rounded-lg p-6 custom-scrollbar fancy-scrollbar ${lightTheme ? "light-theme" : ""}`}
      style={{
        scrollbarWidth: "thin",
        scrollbarColor: lightTheme
          ? "rgba(168, 85, 247, 0.5) rgba(243, 244, 246, 0.7)"
          : "rgba(168, 85, 247, 0.7) rgba(31, 41, 55, 0.7)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Tasks"
            value={totalTasks}
            color={lightTheme ? "bg-white" : "bg-gray-700"}
            textColor={lightTheme ? "text-blue-600" : "text-blue-400"}
            icon="📊"
            neomorphic={lightTheme}
          />
          <StatCard
            title="Pending Tasks"
            value={pendingTasks}
            color={lightTheme ? "bg-white" : "bg-gray-700"}
            textColor={lightTheme ? "text-indigo-600" : "text-indigo-400"}
            icon="⏳"
            neomorphic={lightTheme}
          />
          <StatCard
            title="In Progress"
            value={inProgressTasks}
            color={lightTheme ? "bg-white" : "bg-gray-700"}
            textColor={lightTheme ? "text-purple-600" : "text-purple-400"}
            icon="🔄"
            neomorphic={lightTheme}
          />
          <StatCard
            title="Completed Tasks"
            value={completedTasks}
            color={lightTheme ? "bg-white" : "bg-gray-700"}
            textColor={lightTheme ? "text-green-600" : "text-green-400"}
            icon="✅"
            neomorphic={lightTheme}
          />
        </div>

        {/* Task Progress and Daily Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">Task Progress</h2>
              <select
                className={`
                  ${
                    lightTheme
                      ? "bg-white border-gray-200 text-gray-700 shadow-neomorphic-sm hover:bg-gray-50 focus:border-purple-300"
                      : "bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 focus:border-purple-500"
                  } 
                  border rounded-md px-3 py-2 text-sm transition-colors duration-200
                  focus:outline-none focus:ring-2 ${lightTheme ? "focus:ring-purple-300" : "focus:ring-purple-500"} focus:ring-opacity-50
                  appearance-none cursor-pointer
                `}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='${lightTheme ? "%236b7280" : "%239ca3af"}' strokeLinecap='round' strokeLinejoin='round' strokeWidth='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                  backgroundPosition: `right 0.5rem center`,
                  backgroundRepeat: `no-repeat`,
                  backgroundSize: `1.5em 1.5em`,
                  paddingRight: `2.5rem`,
                }}
              >
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            <div
              className={`${lightTheme ? "bg-white shadow-neomorphic border border-gray-100" : "bg-gray-700 border border-gray-600"} rounded-xl p-6`}
            >
              <TaskChart tasks={tasks} lightTheme={lightTheme} />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Daily Schedule{" "}
                <span
                  className={`text-xs px-2 py-1 rounded-full ${lightTheme ? "bg-purple-100 text-purple-700" : "bg-purple-900 text-purple-300"}`}
                >
                  24H
                </span>
              </h2>
            </div>
            <div
              className={`${lightTheme ? "bg-white shadow-neomorphic border border-gray-100" : "bg-gray-700 border border-gray-600"} rounded-xl p-6`}
            >
              <DailySchedule tasks={tasks} lightTheme={lightTheme} show24Hours={true} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

