"use client"
import { X } from "lucide-react"
import { format } from "date-fns"
import type { Task } from "@/types/todo"
import { MarkdownEditor } from "../markdown-editor"

interface CreateEventModalProps {
  isOpen: boolean
  onClose: () => void
  onCreateTask: (task: Task) => void
  initialDate?: Date | null
  lightTheme?: boolean
}

export function CreateEventModal({
  isOpen,
  onClose,
  onCreateTask,
  initialDate,
  lightTheme = false,
}: CreateEventModalProps) {
  if (!isOpen) return null

  const handleSave = (markdown: string, scheduledTime?: { date: Date; startTime: string; endTime: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      text: markdown,
      completed: false,
      category: "today",
      createdAt: new Date(),
      scheduledTime: scheduledTime || {
        date: initialDate || new Date(),
        startTime: format(initialDate || new Date(), "HH:00"),
        endTime: format(new Date(Date.now() + 3600000), "HH:00"),
      },
    }
    onCreateTask(newTask)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div
        className={`rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border ${
          lightTheme ? "bg-white border-gray-200 shadow-neomorphic" : "bg-gray-800 border-gray-700"
        }`}
      >
        <div
          className={`p-4 border-b ${
            lightTheme ? "border-gray-200" : "border-gray-700"
          } flex justify-between items-center`}
        >
          <h3 className={`text-lg font-medium ${lightTheme ? "text-gray-800" : "text-white"}`}>Create Event</h3>
          <button
            onClick={onClose}
            className={lightTheme ? "text-gray-500 hover:text-gray-700" : "text-gray-400 hover:text-white"}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
          <MarkdownEditor
            initialValue=""
            onSave={handleSave}
            onCancel={onClose}
            initialDate={initialDate}
            lightTheme={lightTheme}
          />
        </div>
      </div>
    </div>
  )
}

