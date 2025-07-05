"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Users, Zap, Shield, BarChart3, Coins } from "lucide-react"

const features = [
  {
    icon: TrendingUp,
    title: "Real-time Validation",
    description: "Live market signals and investor sentiment tracking",
    badge: "Live Data",
    color: "#00F0FF",
  },
  {
    icon: Users,
    title: "Community Betting",
    description: "Investors stake APT tokens on startup success probability",
    badge: "Blockchain",
    color: "#8B5CF6",
  },
  {
    icon: Zap,
    title: "Instant Feedback",
    description: "Get market validation in hours, not months",
    badge: "Fast",
    color: "#10B981",
  },
  {
    icon: Shield,
    title: "Secure Transactions",
    description: "All bets and rewards handled by smart contracts",
    badge: "Secure",
    color: "#F59E0B",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Comprehensive metrics and performance tracking",
    badge: "Insights",
    color: "#EF4444",
  },
  {
    icon: Coins,
    title: "Token Rewards",
    description: "Earn APT tokens for successful predictions and validations",
    badge: "Rewards",
    color: "#06B6D4",
  },
]

export function FeatureShowcase() {
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
            Platform Features
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Powered by blockchain technology and community intelligence
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
            >
              <Card className="glass-card p-6 h-full group hover:neon-glow transition-all duration-300 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300"
                  style={{ backgroundColor: feature.color }}
                />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <motion.div
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${feature.color}20`, border: `1px solid ${feature.color}` }}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <feature.icon className="h-6 w-6" style={{ color: feature.color }} />
                    </motion.div>

                    <Badge variant="outline" className="border-white/20 text-white/80">
                      {feature.badge}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold mb-3 text-white group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-gray-400 group-hover:text-gray-300 transition-colors">{feature.description}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
