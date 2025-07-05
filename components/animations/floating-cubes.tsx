"use client"

import { motion } from "framer-motion"
import { useEffect, useState } from "react"

export function FloatingCubes() {
  const [cubes, setCubes] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([])

  useEffect(() => {
    const newCubes = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 2,
    }))
    setCubes(newCubes)
  }, [])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {cubes.map((cube) => (
        <motion.div
          key={cube.id}
          className="absolute w-12 h-12 border border-[#00F0FF]/30 bg-[#00F0FF]/10 backdrop-blur-sm"
          style={{
            left: `${cube.x}%`,
            top: `${cube.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            rotateX: [0, 360],
            rotateY: [0, 360],
          }}
          transition={{
            duration: 6,
            delay: cube.delay,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  )
}
