"use client"

import { motion } from "framer-motion"

interface StatCardProps {
  title: string
  value: number
  color: string
  textColor: string
  icon: string
  neomorphic?: boolean
}

export function StatCard({ title, value, color, textColor, icon, neomorphic = false }: StatCardProps) {
  return (
    <motion.div
      className={`rounded-xl p-6 ${color} ${
        neomorphic ? "shadow-neomorphic" : "border border-gray-600 shadow-md"
      } overflow-hidden relative`}
      whileHover={{
        y: -5,
        boxShadow: neomorphic
          ? "20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff"
          : "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
        scale: 1.02,
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <motion.div
        className={`absolute -right-4 -top-4 text-4xl ${neomorphic ? "opacity-40" : "opacity-20"}`}
        initial={{ rotate: -10, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.2,
        }}
      >
        {icon}
      </motion.div>

      <motion.h3
        className={`text-4xl font-bold mb-1 tracking-tight ${neomorphic ? "text-gray-800" : ""}`}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.1,
        }}
      >
        {value}
      </motion.h3>

      <motion.p
        className={`text-sm ${textColor}`}
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.2,
        }}
      >
        {title}
      </motion.p>
    </motion.div>
  )
}

