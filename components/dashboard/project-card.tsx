"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Plus } from "lucide-react"

interface TeamMember {
  id: string
  name: string
  image: string
}

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description: string
    progress: number
    totalTasks: number
    team: TeamMember[]
  }
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progressColor = project.progress < 30 ? "bg-red-500" : project.progress < 70 ? "bg-purple-500" : "bg-green-500"

  return (
    <motion.div
      className="bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-700"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)" }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <h3 className="font-bold text-lg mb-1">{project.name}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{project.description}</p>

      <div className="flex justify-between items-center mb-2">
        <div className="flex -space-x-2">
          {project.team.map((member) => (
            <Avatar key={member.id} className="border-2 border-gray-800 h-8 w-8">
              <AvatarImage src={member.image} alt={member.name} />
              <AvatarFallback>{member.name[0]}</AvatarFallback>
            </Avatar>
          ))}
          <div className="h-8 w-8 rounded-full bg-purple-900/30 flex items-center justify-center border-2 border-gray-800">
            <Plus className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {project.progress}%<span className="text-xs ml-1">{project.totalTasks} tasks</span>
        </div>
      </div>

      <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${progressColor}`}
          initial={{ width: 0 }}
          animate={{ width: `${project.progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  )
}

