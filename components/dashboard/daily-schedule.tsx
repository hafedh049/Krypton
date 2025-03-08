"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import type { Task } from "@/types/todo"
import { Plus, Clock } from "lucide-react"

interface DailyScheduleProps {
  tasks: Task[]
  lightTheme?: boolean
  show24Hours?: boolean
}

export function DailySchedule({ tasks, lightTheme = false, show24Hours = false }: DailyScheduleProps) {
  const [currentTime] = useState(new Date())

  // Get tasks for today
  const todayTasks = tasks.filter((task) => {
    if (!task.scheduledTime) return false
    const taskDate = new Date(task.scheduledTime.date)
    return taskDate.toDateString() === currentTime.toDateString()
  })

  // Hours to display - now using all 24 hours when show24Hours is true
  const hours = show24Hours ? Array.from({ length: 24 }, (_, i) => i) : [9, 10, 11, 12, 13, 14, 15, 16, 17]

  // Get tasks for a specific hour
  const getTasksForHour = (hour: number) => {
    return todayTasks.filter((task) => {
      if (!task.scheduledTime) return false
      const [startHour] = task.scheduledTime.startTime.split(":").map(Number)
      return startHour === hour
    })
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 10,
      },
    },
  }

  return (
    <motion.div className="space-y-4" variants={containerVariants} initial="hidden" animate="visible">
      {hours.map((hour) => {
        const hourTasks = getTasksForHour(hour)
        const formattedHour = hour % 12 || 12
        const amPm = hour >= 12 ? "pm" : "am"
        const isCurrentHour = new Date().getHours() === hour

        return (
          <motion.div key={hour} className="flex items-start gap-4" variants={itemVariants}>
            <div
              className={`w-16 text-sm pt-2 ${
                isCurrentHour
                  ? lightTheme
                    ? "text-purple-600 font-medium"
                    : "text-purple-400 font-medium"
                  : lightTheme
                    ? "text-gray-500"
                    : "text-gray-400"
              }`}
            >
              {formattedHour} {amPm}
            </div>
            <div className="flex-1">
              {hourTasks.length > 0 ? (
                hourTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    className={`p-3 rounded-lg mb-2 ${
                      lightTheme
                        ? task.completed
                          ? "bg-gray-100 shadow-inner"
                          : "bg-purple-50 shadow-neomorphic-sm"
                        : task.completed
                          ? "bg-gray-700/70"
                          : "bg-purple-900/30"
                    } ${
                      lightTheme
                        ? "border border-gray-200 hover:border-purple-300"
                        : "border border-gray-600 hover:border-purple-500"
                    } transition-colors`}
                    whileHover={{
                      scale: 1.02,
                      boxShadow: lightTheme
                        ? "inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff"
                        : "0 5px 15px -5px rgba(0, 0, 0, 0.3)",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    <h4 className={`font-medium text-sm ${lightTheme ? "text-gray-800" : ""}`}>
                      {task.text.split("\n")[0]}
                    </h4>
                    {task.scheduledTime && (
                      <p
                        className={`text-xs ${lightTheme ? "text-gray-500" : "text-gray-400"} flex items-center gap-1 mt-1`}
                      >
                        <Clock className="h-3 w-3" />
                        {task.scheduledTime.startTime} - {task.scheduledTime.endTime}
                      </p>
                    )}
                  </motion.div>
                ))
              ) : (
                <motion.div
                  className={`border border-dashed ${
                    lightTheme ? "border-gray-300 text-gray-500" : "border-gray-600 text-gray-400"
                  } rounded-lg p-3 flex items-center justify-center h-12`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  whileHover={{
                    borderColor: lightTheme ? "rgba(168, 85, 247, 0.3)" : "rgba(168, 85, 247, 0.5)",
                    backgroundColor: lightTheme ? "rgba(168, 85, 247, 0.05)" : "rgba(168, 85, 247, 0.05)",
                  }}
                >
                  <div className="flex items-center gap-2 text-sm">
                    <Plus className="h-4 w-4" />
                    No tasks scheduled
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )
      })}
    </motion.div>
  )
}

