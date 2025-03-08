"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { ReactNode } from "react"

interface NotificationItemProps {
  notification: {
    id: string
    type: string
    message: string
    time: string
    icon: ReactNode
    user: {
      name: string
      image: string
    }
  }
}

export function NotificationItem({ notification }: NotificationItemProps) {
  return (
    <motion.div
      className="flex gap-3 p-3 rounded-lg hover:bg-gray-700/50 transition-colors"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
      whileHover={{ x: 5 }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={notification.user.image} alt={notification.user.name} />
        <AvatarFallback>{notification.user.name[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1">
        <div className="flex justify-between">
          <h4 className="font-medium text-sm">
            Automation <span className="text-gray-500 dark:text-gray-400 font-normal">• {notification.time}</span>
          </h4>
        </div>
        <p className="text-sm text-gray-300">{notification.message}</p>
      </div>
    </motion.div>
  )
}

