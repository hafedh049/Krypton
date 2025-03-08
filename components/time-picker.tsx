"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface TimePickerProps {
  onTimeSelect: (date: Date, startTime: string, endTime: string) => void
  onClose: () => void
  lightTheme?: boolean
}

export function TimePicker({ onTimeSelect, onClose, lightTheme = false }: TimePickerProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [customStartTime, setCustomStartTime] = useState("")
  const [customEndTime, setCustomEndTime] = useState("")

  const hours = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0")
    return `${hour}:00`
  })

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time)
    const [startHour] = time.split(":")
    const endHour = ((Number.parseInt(startHour) + 1) % 24).toString().padStart(2, "0")
    setCustomStartTime(time)
    setCustomEndTime(`${endHour}:00`)
  }

  const handleSave = () => {
    if (selectedDate && customStartTime && customEndTime) {
      onTimeSelect(selectedDate, customStartTime, customEndTime)
    }
  }

  return (
    <div
      className={`${
        lightTheme ? "bg-white border border-gray-200 shadow-neomorphic" : "bg-gray-800 border border-gray-700"
      } rounded-lg overflow-hidden`}
    >
      <div className={`p-4 border-b ${lightTheme ? "border-gray-200" : "border-gray-700"}`}>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className={`rounded-md ${
            lightTheme ? "border border-gray-200 shadow-neomorphic-sm" : "border border-gray-700"
          }`}
          classNames={{
            months: "space-y-4",
            month: "space-y-4",
            caption: "flex justify-center pt-1 relative items-center",
            caption_label: `text-sm font-medium ${lightTheme ? "text-gray-800" : "text-gray-100"}`,
            nav: "space-x-1 flex items-center",
            nav_button: `h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 ${
              lightTheme ? "hover:bg-gray-100" : "hover:bg-gray-700"
            } rounded-md`,
            nav_button_previous: "absolute left-1",
            nav_button_next: "absolute right-1",
            table: "w-full border-collapse space-y-1",
            head_row: "flex",
            head_cell: `${lightTheme ? "text-gray-500" : "text-gray-400"} rounded-md w-8 font-normal text-[0.8rem]`,
            row: "flex w-full mt-2",
            cell: cn(
              "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-gray-700 rounded-md",
              "first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
              lightTheme && "[&:has([aria-selected])]:bg-purple-50",
            ),
            day: `h-8 w-8 p-0 font-normal ${lightTheme ? "text-gray-700" : "text-gray-300"} aria-selected:opacity-100 ${
              lightTheme ? "hover:bg-gray-100" : "hover:bg-gray-700"
            } rounded-md`,
            day_range_end: "day-range-end",
            day_selected: lightTheme
              ? "bg-purple-500 text-white hover:bg-purple-600 hover:text-white focus:bg-purple-600 focus:text-white"
              : "bg-purple-600 text-gray-50 hover:bg-purple-700 hover:text-gray-50 focus:bg-purple-700 focus:text-gray-50",
            day_today: lightTheme ? "bg-gray-100 text-gray-900" : "bg-gray-700 text-gray-50",
            day_outside: "opacity-50",
            day_disabled: "opacity-50 cursor-not-allowed",
            day_hidden: "invisible",
          }}
          components={{
            IconLeft: ({ ...props }) => <ChevronLeft className="h-4 w-4" />,
            IconRight: ({ ...props }) => <ChevronRight className="h-4 w-4" />,
          }}
        />
      </div>

      <div className={`p-4 border-b ${lightTheme ? "border-gray-200" : "border-gray-700"}`}>
        <div className="grid grid-cols-6 gap-2 mb-4 max-h-48 overflow-y-auto pr-1 custom-scrollbar">
          {hours.map((time) => (
            <button
              key={time}
              onClick={() => handleTimeSelect(time)}
              className={cn(
                "p-2 text-sm rounded-md text-center",
                selectedTime === time
                  ? lightTheme
                    ? "bg-purple-500 text-white shadow-neomorphic-sm"
                    : "bg-purple-600 text-white"
                  : lightTheme
                    ? "bg-white text-gray-700 shadow-neomorphic-sm hover:bg-gray-50"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600",
              )}
            >
              {time}
            </button>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className={`block text-sm font-medium ${lightTheme ? "text-gray-700" : "text-gray-300"} mb-1`}>
                Start Time
              </label>
              <input
                type="time"
                value={customStartTime}
                onChange={(e) => setCustomStartTime(e.target.value)}
                className={`w-full p-2 rounded-md focus:outline-none ${
                  lightTheme
                    ? "bg-white border border-gray-200 text-gray-800 focus:ring-2 focus:ring-purple-400 shadow-neomorphic-sm"
                    : "bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500"
                }`}
              />
            </div>
            <div className="flex-1">
              <label className={`block text-sm font-medium ${lightTheme ? "text-gray-700" : "text-gray-300"} mb-1`}>
                End Time
              </label>
              <input
                type="time"
                value={customEndTime}
                onChange={(e) => setCustomEndTime(e.target.value)}
                className={`w-full p-2 rounded-md focus:outline-none ${
                  lightTheme
                    ? "bg-white border border-gray-200 text-gray-800 focus:ring-2 focus:ring-purple-400 shadow-neomorphic-sm"
                    : "bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-purple-500"
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 flex justify-end gap-2">
        <button
          onClick={onClose}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            lightTheme ? "text-gray-700 hover:bg-gray-100 shadow-neomorphic-sm" : "text-gray-300 hover:bg-gray-700"
          }`}
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            lightTheme
              ? "bg-purple-500 text-white hover:bg-purple-600 shadow-neomorphic-sm"
              : "bg-purple-600 text-white hover:bg-purple-700"
          }`}
        >
          Set time
        </button>
      </div>
    </div>
  )
}

