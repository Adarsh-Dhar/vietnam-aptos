"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Lightbulb, Users, TrendingUp, Rocket } from "lucide-react"

const journeySteps = [
  {
    icon: Lightbulb,
    title: "Submit Idea",
    description: "Founders submit their startup concepts with target metrics",
    color: "#00F0FF",
  },
  {
    icon: Users,
    title: "Community Validation",
    description: "Investors place bets on success probability",
    color: "#8B5CF6",
  },
  {
    icon: TrendingUp,
    title: "Real-time Tracking",
    description: "Live metrics show validation progress and odds",
    color: "#10B981",
  },
  {
    icon: Rocket,
    title: "Launch Decision",
    description: "Data-driven go/no-go decisions with investor backing",
    color: "#F59E0B",
  },
]

export function ValidationJourney() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            The Validation Journey
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            From idea to launch, every step is validated by real market signals
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {journeySteps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              whileHover={{ y: -10, scale: 1.05 }}
            >
              <Card className="glass-card p-6 h-full text-center group hover:neon-glow transition-all duration-300">
                <motion.div
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${step.color}20`, border: `2px solid ${step.color}` }}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <step.icon className="h-8 w-8" style={{ color: step.color }} />
                </motion.div>

                <h3 className="text-xl font-bold mb-3 text-white">{step.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{step.description}</p>

                <motion.div
                  className="w-full h-1 mt-4 rounded-full bg-gray-700"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 1, delay: index * 0.3 }}
                  style={{ transformOrigin: "left" }}
                >
                  <motion.div
                    className="h-full rounded-full"
                    style={{ backgroundColor: step.color }}
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    transition={{ duration: 0.8, delay: index * 0.3 + 0.5 }}
                    style={{ transformOrigin: "left" }}
                  />
                </motion.div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
