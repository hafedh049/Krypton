"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import type { Task } from "@/types/todo"
import { format, subDays, isSameDay } from "date-fns"

interface TaskChartProps {
  tasks: Task[]
  lightTheme?: boolean
}

// Add shimmer animation
const shimmerAnimation = `
@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}
.animate-shimmer {
  animation: shimmer 2s infinite;
}
`

export function TaskChart({ tasks, lightTheme = false }: TaskChartProps) {
  const [chartData, setChartData] = useState<{ day: Date; count: number }[]>([])

  useEffect(() => {
    // Add the animation styles to the document
    const styleElement = document.createElement("style")
    styleElement.innerHTML = shimmerAnimation
    document.head.appendChild(styleElement)

    return () => {
      document.head.removeChild(styleElement)
    }
  }, [])

  useEffect(() => {
    // Generate data for the last 7 days
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(new Date(), 6 - i)
      const tasksForDay = tasks.filter((task) => {
        const taskDate = task.scheduledTime ? new Date(task.scheduledTime.date) : task.createdAt
        return isSameDay(taskDate, date)
      })
      return {
        day: date,
        count: tasksForDay.length,
      }
    })

    setChartData(last7Days)
  }, [tasks])

  // Calculate stats
  const totalTimeSpent = tasks.reduce((total, task) => {
    if (task.scheduledTime) {
      const startHour = Number.parseInt(task.scheduledTime.startTime.split(":")[0])
      const endHour = Number.parseInt(task.scheduledTime.endTime.split(":")[0])
      return total + (endHour - startHour)
    }
    return total
  }, 0)

  const completedTasks = tasks.filter((task) => task.completed).length
  const pendingTasks = tasks.length - completedTasks

  const maxValue = Math.max(...chartData.map((d) => d.count), 1) // Ensure we have a reasonable max

  return (
    <div className="pt-4">
      <div className="grid grid-cols-3 gap-4 mb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        >
          <h3 className={`text-2xl font-bold ${lightTheme ? "text-gray-800" : ""}`}>{totalTimeSpent}h</h3>
          <p className={`text-sm ${lightTheme ? "text-gray-500" : "text-gray-400"}`}>Time scheduled</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h3 className={`text-2xl font-bold ${lightTheme ? "text-gray-800" : ""}`}>{completedTasks}</h3>
          <p className={`text-sm ${lightTheme ? "text-gray-500" : "text-gray-400"}`}>Tasks completed</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 100 }}
        >
          <h3 className={`text-2xl font-bold ${lightTheme ? "text-gray-800" : ""}`}>{pendingTasks}</h3>
          <p className={`text-sm ${lightTheme ? "text-gray-500" : "text-gray-400"}`}>Tasks pending</p>
        </motion.div>
      </div>

      <div className="h-48 flex items-end justify-between gap-2 mb-2 relative">
        {/* Grid lines */}
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[0, 1, 2, 3].map((line) => (
            <div
              key={line}
              className={`w-full border-t ${lightTheme ? "border-gray-200" : "border-gray-600"} ${line === 0 ? "border-0" : ""}`}
            />
          ))}
        </div>

        {chartData.map((data, index) => (
          <div key={index} className="flex flex-col items-center flex-1 relative z-10">
            <motion.div
              className={`${
                lightTheme
                  ? "bg-gradient-to-t from-purple-500 to-purple-300 shadow-lg"
                  : "bg-gradient-to-t from-purple-700 to-purple-500"
              } rounded-t-md w-full relative group overflow-hidden`}
              initial={{ height: 0 }}
              animate={{ height: `${data.count ? (data.count / maxValue) * 100 : 5}%` }}
              transition={{
                duration: 0.8,
                delay: index * 0.1,
                type: "spring",
                stiffness: 100,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: lightTheme ? "0 4px 12px rgba(168, 85, 247, 0.4)" : "0 4px 12px rgba(168, 85, 247, 0.2)",
              }}
            >
              {/* Shiny effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-10 -translate-x-full animate-shimmer" />

              {/* Task count tooltip */}
              <motion.div
                className={`absolute -top-10 left-1/2 transform -translate-x-1/2 ${
                  lightTheme ? "bg-purple-500 text-white" : "bg-purple-600 text-white"
                } px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 0, y: 0 }}
                whileHover={{ opacity: 1, y: 0 }}
              >
                {data.count} tasks
                <div
                  className={`absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 ${
                    lightTheme ? "bg-purple-500" : "bg-purple-600"
                  }`}
                ></div>
              </motion.div>

              {/* Reflection effect */}
              <div
                className={`absolute inset-x-0 bottom-0 h-1/3 ${
                  lightTheme
                    ? "bg-gradient-to-t from-purple-300/30 to-transparent"
                    : "bg-gradient-to-t from-purple-700/30 to-transparent"
                }`}
              ></div>
            </motion.div>
            <div className={`text-xs ${lightTheme ? "text-gray-500" : "text-gray-400"} mt-2`}>
              {format(data.day, "EEE")}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

