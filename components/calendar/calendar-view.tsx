"use client"

import React from "react"
import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { format, addWeeks, subWeeks, startOfWeek, addDays, isSameDay } from "date-fns"
import { cn } from "@/lib/utils"
import type { Task } from "@/types/todo"
import { CreateEventModal } from "./create-event-modal"

interface CalendarViewProps {
  tasks: Task[]
  onAddTask: (task: Task) => void
  lightTheme?: boolean
}

export function CalendarView({ tasks, onAddTask, lightTheme = false }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedTime, setSelectedTime] = useState<Date | null>(null)

  const weekStart = startOfWeek(currentDate)
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const nextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1))
  }

  const prevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1))
  }

  const handleTimeClick = (hour: number, day: Date) => {
    const selectedDate = new Date(day)
    selectedDate.setHours(hour)
    setSelectedTime(selectedDate)
    setShowCreateModal(true)
  }

  const getTasksForTimeSlot = (hour: number, day: Date) => {
    return tasks.filter((task) => {
      if (!task.scheduledTime) return false
      const taskDate = task.scheduledTime.date
      const [taskHour] = task.scheduledTime.startTime.split(":").map(Number)
      return isSameDay(taskDate, day) && taskHour === hour
    })
  }

  return (
    <div
      className={`flex flex-col h-full rounded-lg border ${
        lightTheme ? "bg-white border-gray-200 shadow-neomorphic" : "bg-gray-800 bg-opacity-90 border-gray-700"
      }`}
    >
      {/* Calendar Header */}
      <div
        className={`p-4 border-b ${
          lightTheme ? "border-gray-200" : "border-gray-700"
        } flex items-center justify-between`}
      >
        <div className="flex items-center gap-4">
          <h2 className={`text-xl font-semibold ${lightTheme ? "text-gray-800" : "text-white"}`}>Calendar</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={prevWeek}
              className={`p-2 rounded-full ${
                lightTheme
                  ? "hover:bg-gray-100 text-gray-500 hover:text-gray-700 shadow-neomorphic-sm"
                  : "hover:bg-gray-700 text-gray-400 hover:text-white"
              } transition-colors`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className={lightTheme ? "text-gray-700 font-medium" : "text-gray-200 font-medium"}>
              {format(weekStart, "MMMM d")} - {format(addDays(weekStart, 6), "MMMM d, yyyy")}
            </span>
            <button
              onClick={nextWeek}
              className={`p-2 rounded-full ${
                lightTheme
                  ? "hover:bg-gray-100 text-gray-500 hover:text-gray-700 shadow-neomorphic-sm"
                  : "hover:bg-gray-700 text-gray-400 hover:text-white"
              } transition-colors`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            lightTheme
              ? "bg-purple-500 hover:bg-purple-600 text-white shadow-neomorphic-sm"
              : "bg-purple-600 hover:bg-purple-700 text-white"
          }`}
        >
          <Plus className="w-4 h-4" />
          <span>Create Event</span>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        <div className="grid grid-cols-[auto,1fr] h-full">
          {/* Time Labels */}
          <div className={`border-r ${lightTheme ? "border-gray-200" : "border-gray-700"}`}>
            <div
              className={`sticky top-0 h-14 ${lightTheme ? "bg-white" : "bg-gray-800 bg-opacity-90"} border-b ${
                lightTheme ? "border-gray-200" : "border-gray-700"
              }`}
            />
            {hours.map((hour) => (
              <div
                key={hour}
                className={`h-20 px-4 border-b ${
                  lightTheme ? "border-gray-200" : "border-gray-700"
                } flex items-center justify-end text-sm ${lightTheme ? "text-gray-500" : "text-gray-400"}`}
              >
                {format(new Date().setHours(hour), "ha")}
              </div>
            ))}
          </div>

          {/* Days and Events */}
          <div className="grid grid-cols-7 flex-1">
            {/* Day Headers */}
            <div
              className={`col-span-7 grid grid-cols-7 sticky top-0 z-10 ${
                lightTheme ? "bg-white" : "bg-gray-900"
              } border-b ${lightTheme ? "border-gray-200" : "border-gray-700"}`}
            >
              {days.map((day) => (
                <div
                  key={day.toISOString()}
                  className={`h-14 border-r ${
                    lightTheme ? "border-gray-200" : "border-gray-700"
                  } flex flex-col items-center justify-center`}
                >
                  <div className={`text-sm ${lightTheme ? "text-gray-500" : "text-gray-400"}`}>
                    {format(day, "EEE")}
                  </div>
                  <div className={`text-lg font-semibold ${lightTheme ? "text-gray-800" : "text-white"}`}>
                    {format(day, "d")}
                  </div>
                </div>
              ))}
            </div>

            {/* Time Slots and Events */}
            {hours.map((hour) => (
              <React.Fragment key={hour}>
                {days.map((day) => {
                  const tasksInSlot = getTasksForTimeSlot(hour, day)
                  return (
                    <div
                      key={`${day.toISOString()}-${hour}`}
                      className={`relative h-20 border-r border-b ${
                        lightTheme ? "border-gray-200" : "border-gray-700"
                      } group`}
                      onClick={() => handleTimeClick(hour, day)}
                    >
                      <div
                        className={`absolute inset-0 ${
                          lightTheme
                            ? "bg-gray-50/0 group-hover:bg-gray-50/50"
                            : "bg-gray-800/0 group-hover:bg-gray-800/50"
                        } transition-colors`}
                      />
                      <AnimatePresence>
                        {tasksInSlot.map((task) => (
                          <motion.div
                            key={task.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className={cn(
                              "absolute inset-x-0 mx-1 p-2 rounded-lg shadow-lg cursor-pointer",
                              lightTheme
                                ? task.completed
                                  ? "bg-gray-200 shadow-neomorphic-inner"
                                  : "bg-purple-100 shadow-neomorphic-sm"
                                : task.completed
                                  ? "bg-gray-700"
                                  : "bg-purple-600",
                            )}
                          >
                            <div
                              className={`text-sm font-medium ${lightTheme ? "text-gray-800" : "text-white"} truncate`}
                            >
                              {task.text.split("\n")[0]}
                            </div>
                            {task.scheduledTime && (
                              <div className={`text-xs ${lightTheme ? "text-gray-600" : "text-gray-200"}`}>
                                {task.scheduledTime.startTime} - {task.scheduledTime.endTime}
                              </div>
                            )}
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Create Event Modal */}
      <CreateEventModal
        isOpen={showCreateModal}
        onClose={() => {
          setShowCreateModal(false)
          setSelectedTime(null)
        }}
        onCreateTask={onAddTask}
        initialDate={selectedTime}
        lightTheme={lightTheme}
      />
    </div>
  )
}

