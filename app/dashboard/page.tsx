"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, Users, DollarSign, Activity, Plus, Eye, ThumbsUp, ThumbsDown } from "lucide-react"

const mockProjects = [
  {
    id: 1,
    title: "AI-Powered Fitness App",
    description: "Personalized workout plans using machine learning",
    targetMetric: "10K Users",
    currentProgress: 65,
    totalBets: 150,
    supportBets: 98,
    doubtBets: 52,
    odds: "2.3:1",
    timeLeft: "5 days",
    category: "Health Tech",
  },
  {
    id: 2,
    title: "Sustainable Food Delivery",
    description: "Zero-waste delivery service with reusable packaging",
    targetMetric: "$50K Revenue",
    currentProgress: 42,
    totalBets: 89,
    supportBets: 34,
    doubtBets: 55,
    odds: "1.8:1",
    timeLeft: "12 days",
    category: "Sustainability",
  },
]

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg p-6">
      <div className="container mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Validation Dashboard</h1>
          <p className="text-gray-400">Track your projects and market validation in real-time</p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { icon: TrendingUp, label: "Active Projects", value: "12", change: "+3" },
            { icon: Users, label: "Total Validators", value: "1,247", change: "+89" },
            { icon: DollarSign, label: "APT Staked", value: "2,450", change: "+156" },
            { icon: Activity, label: "Success Rate", value: "68%", change: "+5%" },
          ].map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-green-400 text-sm">{stat.change}</p>
                  </div>
                  <stat.icon className="h-8 w-8 text-[#00F0FF]" />
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {mockProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              whileHover={{ y: -5 }}
            >
              <Card className="glass-card p-6 h-full">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-2">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                    <Badge variant="outline" className="border-[#00F0FF]/50 text-[#00F0FF]">
                      {project.category}
                    </Badge>
                  </div>
                  <Button size="sm" variant="ghost" className="text-gray-400">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Target: {project.targetMetric}</span>
                      <span className="text-white">{project.currentProgress}%</span>
                    </div>
                    <Progress value={project.currentProgress} className="h-2" />
                  </div>

                  <div className="flex justify-between items-center">
                    <div className="flex gap-4">
                      <div className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4 text-green-400" />
                        <span className="text-sm text-white">{project.supportBets}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4 text-red-400" />
                        <span className="text-sm text-white">{project.doubtBets}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Odds</p>
                      <p className="text-sm font-bold text-[#00F0FF]">{project.odds}</p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-sm text-gray-400">{project.timeLeft} left</span>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-green-600 hover:bg-green-700">
                        Support
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500 text-red-400 bg-transparent">
                        Doubt
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Add Project Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <Button
            size="lg"
            className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80"
          >
            <Plus className="mr-2 h-5 w-5" />
            Submit New Project
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
