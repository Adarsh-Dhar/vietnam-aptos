"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  DollarSign,
  Target,
  Award,
  ThumbsUp,
  ThumbsDown,
  Eye,
  Clock,
  Users,
  BarChart3,
  Coins,
  Filter,
  Search,
} from "lucide-react"
import { Input } from "@/components/ui/input"

const investmentOpportunities = [
  {
    id: 1,
    title: "AI-Powered Fitness App",
    founder: "Sarah Chen",
    description: "Personalized workout plans using machine learning algorithms",
    category: "Health Tech",
    targetMetric: "10,000 Users",
    currentProgress: 65,
    timeRemaining: "8 days",
    totalStaked: "2,450 APT",
    supportBets: 98,
    doubtBets: 52,
    odds: "2.3:1",
    riskLevel: "Medium",
    potentialReturn: "180%",
    validationScore: 8.2,
  },
  {
    id: 2,
    title: "Sustainable Food Delivery",
    founder: "Marcus Rodriguez",
    description: "Zero-waste delivery service with reusable packaging system",
    category: "Sustainability",
    targetMetric: "$50K Revenue",
    currentProgress: 42,
    timeRemaining: "12 days",
    totalStaked: "1,890 APT",
    supportBets: 34,
    doubtBets: 55,
    odds: "1.8:1",
    riskLevel: "High",
    potentialReturn: "220%",
    validationScore: 6.8,
  },
  {
    id: 3,
    title: "Blockchain Learning Platform",
    founder: "Alex Kim",
    description: "Interactive courses for Web3 development and DeFi education",
    category: "Education",
    targetMetric: "5,000 Students",
    currentProgress: 78,
    timeRemaining: "3 days",
    totalStaked: "3,200 APT",
    supportBets: 156,
    doubtBets: 28,
    odds: "3.1:1",
    riskLevel: "Low",
    potentialReturn: "150%",
    validationScore: 9.1,
  },
]

const portfolioStats = [
  { label: "Total Invested", value: "12.5K APT", change: "+2.1K", icon: DollarSign },
  { label: "Active Bets", value: "24", change: "+6", icon: Target },
  { label: "Success Rate", value: "72%", change: "+5%", icon: TrendingUp },
  { label: "Total Returns", value: "8.9K APT", change: "+1.2K", icon: Award },
]

export default function InvestorsPage() {
  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Investor Hub</h1>
              <p className="text-gray-400">Discover and validate promising startup ideas before they launch</p>
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="glass-card border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 bg-transparent"
              >
                <BarChart3 className="mr-2 h-4 w-4" />
                Portfolio
              </Button>
              <Button className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80">
                <Coins className="mr-2 h-4 w-4" />
                Place Bet
              </Button>
            </div>
          </div>
        </motion.div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {portfolioStats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="glass-card p-6 hover:neon-glow transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className="text-green-400 text-sm">{stat.change}</p>
                  </div>
                  <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-lg flex items-center justify-center">
                    <stat.icon className="h-6 w-6 text-[#00F0FF]" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Filters and Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <Card className="glass-card p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search projects..."
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-gray-400"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-card border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Category
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-card border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Risk Level
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="glass-card border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  Time Left
                </Button>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Investment Opportunities */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Investment Opportunities</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {investmentOpportunities.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="glass-card p-6 h-full group hover:neon-glow transition-all duration-300">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{project.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            project.riskLevel === "Low"
                              ? "border-green-500/50 text-green-400"
                              : project.riskLevel === "Medium"
                                ? "border-yellow-500/50 text-yellow-400"
                                : "border-red-500/50 text-red-400"
                          }
                        >
                          {project.riskLevel} Risk
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-2">by {project.founder}</p>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                      <Badge variant="outline" className="border-[#00F0FF]/50 text-[#00F0FF]">
                        {project.category}
                      </Badge>
                    </div>

                    <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="space-y-4">
                    {/* Progress */}
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-400">Target: {project.targetMetric}</span>
                        <span className="text-white">{project.currentProgress}%</span>
                      </div>
                      <Progress value={project.currentProgress} className="h-2" />
                    </div>

                    {/* Betting Stats */}
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

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Time Left</p>
                        <p className="text-white font-medium flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {project.timeRemaining}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Staked</p>
                        <p className="text-white font-medium">{project.totalStaked}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Potential Return</p>
                        <p className="text-green-400 font-medium">{project.potentialReturn}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Validation Score</p>
                        <p className="text-[#00F0FF] font-medium">{project.validationScore}/10</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                        <ThumbsUp className="mr-1 h-4 w-4" />
                        Support
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                      >
                        <ThumbsDown className="mr-1 h-4 w-4" />
                        Doubt
                      </Button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Market Insights */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Market Insights</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#00F0FF]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingUp className="h-8 w-8 text-[#00F0FF]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Trending Categories</h4>
                <p className="text-gray-400 text-sm">
                  AI/ML and Sustainability projects showing highest validation rates
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#8B5CF6]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users className="h-8 w-8 text-[#8B5CF6]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Community Growth</h4>
                <p className="text-gray-400 text-sm">1,247 active validators with 89% accuracy rate</p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-[#10B981]/20 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Award className="h-8 w-8 text-[#10B981]" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Top Performers</h4>
                <p className="text-gray-400 text-sm">Average ROI of 156% for successful validations</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}
