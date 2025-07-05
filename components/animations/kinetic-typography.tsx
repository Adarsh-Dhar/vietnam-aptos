"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface KineticTypographyProps {
  text: string
  className?: string
  delay?: number
}

export function KineticTypography({ text, className, delay = 0 }: KineticTypographyProps) {
  const words = text.split(" ")

  return (
    <div className={cn("overflow-hidden", className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.1,
            ease: "easeOut",
          }}
          className="inline-block mr-4"
        >
          {word}
        </motion.span>
      ))}
    </div>
  )
}
