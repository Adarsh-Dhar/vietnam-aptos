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
  Zap,
  Timer,
  Wallet,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/components/wallet/wallet-provider"
import { jwtDecode } from "jwt-decode"

// Remove the hardcoded portfolioStats array

export default function InvestorsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [betAmount, setBetAmount] = useState([10])
  const [betType, setBetType] = useState<'SUPPORT' | 'DOUBT'>('SUPPORT')
  const [isPlacingBet, setIsPlacingBet] = useState(false)
  const [betProjects, setBetProjects] = useState<string[]>([])
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const { isConnected, address, connect } = useWallet()
  const [portfolioStats, setPortfolioStats] = useState<any>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProjects() {
      setLoading(true)
      try {
        const res = await fetch('/api/projects')
        if (res.ok) {
          const data = await res.json()
          setProjects(data)
        }
      } catch (e) {
        // Optionally handle error
      } finally {
        setLoading(false)
      }
    }
    fetchProjects()
    // Check if token exists
    if (typeof window !== 'undefined' && localStorage.getItem('token')) {
      setIsAuthenticated(true)
      // Decode token to get user id
      const token = localStorage.getItem('token')
      try {
        const decoded: any = jwtDecode(token!)
        setUserId(decoded.id)
        const userId = decoded.id
        // Fetch portfolio stats
        setStatsLoading(true)
        fetch(`/api/users/${userId}/bets`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
          .then(res => res.json())
          .then(data => {
            setPortfolioStats(data.portfolio)
            setStatsLoading(false)
          })
          .catch(() => setStatsLoading(false))
      } catch {}
    }
  }, [])

  // Auth function (auto-auth on wallet connect)
  const handleAuthenticate = async () => {
    if (!isConnected || !address) return
    setIsAuthenticating(true)
    try {
      const signature = 'dummy-signature' // TODO: Replace with real signature logic
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ aptosAddress: address, signature })
      })
      if (res.ok) {
        const data = await res.json()
        localStorage.setItem('token', data.token)
        setIsAuthenticated(true)
      }
    } catch {}
    setIsAuthenticating(false)
  }

  // Auto-authenticate on wallet connect or page load
  useEffect(() => {
    if (isConnected && address && !isAuthenticated && !localStorage.getItem('token')) {
      handleAuthenticate()
    }
  }, [isConnected, address])

  const handlePlaceBet = async (projectId: string) => {
    if (!selectedProject) return
    
    setIsPlacingBet(true)
    try {
      const response = await fetch(`/api/projects/${projectId}/bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: betAmount[0],
          type: betType
        })
      })

      if (response.ok) {
        const result = await response.json()
        setSelectedProject(null) // Close modal after bet
        setBetProjects((prev) => [...prev, projectId]) // Mark project as betted
        setSelectedProject((prev: any) => ({
          ...prev,
          supportPool: result.updatedPools.supportPool,
          doubtPool: result.updatedPools.doubtPool,
          totalPool: result.updatedPools.totalPool,
          supportOdds: result.odds
        }))
        
        // Log the bet result
        console.log('Bet placed:', result)
        // Show success message
        alert(`Bet placed successfully! Odds: ${result.odds}:1`)
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to place bet. Please try again.')
    } finally {
      setIsPlacingBet(false)
    }
  }

  const calculatePotentialReturn = (odds: number, amount: number) => {
    return (odds * amount).toFixed(2)
  }

  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
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
                {/* Only Portfolio button remains; wallet connect is in navbar */}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Portfolio Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsLoading ? (
            <div className="col-span-4 text-center text-gray-400 py-8">Loading portfolio stats...</div>
          ) : portfolioStats ? (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                <Card className="glass-card p-6 hover:neon-glow transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Invested</p>
                      <p className="text-2xl font-bold text-white">{portfolioStats.totalInvested} APT</p>
                      <p className="text-green-400 text-sm">+{portfolioStats.totalInvested - (portfolioStats.totalPayouts || 0)}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-[#00F0FF]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card p-6 hover:neon-glow transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Active Bets</p>
                      <p className="text-2xl font-bold text-white">{portfolioStats.activeBets}</p>
                      <p className="text-green-400 text-sm">+{portfolioStats.activeBets}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-lg flex items-center justify-center">
                      <Target className="h-6 w-6 text-[#00F0FF]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass-card p-6 hover:neon-glow transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Success Rate</p>
                      <p className="text-2xl font-bold text-white">{portfolioStats.successRate}%</p>
                      <p className="text-green-400 text-sm">+{portfolioStats.successRate}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-[#00F0FF]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass-card p-6 hover:neon-glow transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Total Returns</p>
                      <p className="text-2xl font-bold text-white">{portfolioStats.totalPayouts} APT</p>
                      <p className="text-green-400 text-sm">+{portfolioStats.totalPayouts}</p>
                    </div>
                    <div className="w-12 h-12 bg-[#00F0FF]/20 rounded-lg flex items-center justify-center">
                      <Award className="h-6 w-6 text-[#00F0FF]" />
                    </div>
                  </div>
                </Card>
              </motion.div>
            </>
          ) : null}
        </div>

        {/* Filters and Search */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
        </div>

        {/* Investment Opportunities */}
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold text-white mb-6">Investment Opportunities</h2>

            {loading ? (
              <div className="text-center text-gray-400 py-12">Loading projects...</div>
            ) : projects.length === 0 ? (
              <div className="text-center text-gray-400 py-12">No projects found.</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {projects.map((project, index) => (
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
                            <h3 className="text-lg font-bold text-white">{project.name}</h3>
                            <Badge
                              variant="outline"
                              className="border-gray-500/50 text-gray-400"
                            >
                              {/* No riskLevel in backend, so leave blank or placeholder */}
                              Risk
                            </Badge>
                          </div>
                          <p className="text-gray-400 text-sm mb-2">by {project.creator?.username || 'Unknown'}</p>
                          <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                          <Badge variant="outline" className="border-[#00F0FF]/50 text-[#00F0FF]">
                            {project.categories && project.categories.length > 0 ? project.categories[0].name : 'Uncategorized'}
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
                            <span className="text-gray-400">Target: {project.targetHolders || '-'}</span>
                            <span className="text-white">{project.targetHolders && project.currentHolders ? Math.round((project.currentHolders / project.targetHolders) * 100) : 0}%</span>
                          </div>
                          <Progress value={project.targetHolders && project.currentHolders ? (project.currentHolders / project.targetHolders) * 100 : 0} className="h-2" />
                        </div>

                        {/* Betting Stats */}
                        <div className="flex justify-between items-center">
                          <div className="flex gap-4">
                            <div className="flex items-center gap-1">
                              <ThumbsUp className="h-4 w-4 text-green-400" />
                              <span className="text-sm text-white">{project.bets?.filter((b: any) => b.type === 'SUPPORT').length || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ThumbsDown className="h-4 w-4 text-red-400" />
                              <span className="text-sm text-white">{project.bets?.filter((b: any) => b.type === 'DOUBT').length || 0}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-gray-400">Odds</p>
                            <p className="text-sm font-bold text-[#00F0FF]">{project.totalPool && project.supportPool ? ((project.totalPool / (project.supportPool + 1)).toFixed(2)) : '1.00'}</p>
                          </div>
                        </div>

                        {/* Key Metrics */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Time Left</p>
                            <p className="text-white font-medium flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {/* Calculate days left from deadline */}
                              {project.deadline ? `${Math.max(0, Math.ceil((new Date(project.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))} days` : '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-400">Total Staked</p>
                            <p className="text-white font-medium">{project.totalPool ? `${project.totalPool} APT` : '0 APT'}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Potential Return</p>
                            <p className="text-green-400 font-medium">-</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Validation Score</p>
                            <p className="text-[#00F0FF] font-medium">-</p>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-4 border-t border-white/10">
                          {/* Check if user has already bet on this project */}
                          {(() => {
                            const hasUserBet = userId && project.bets && project.bets.some((b: any) => b.userId === userId)
                            return <>
                          <Button
                            size="sm"
                            className="flex-1 bg-green-600 hover:bg-green-700"
                            onClick={() => {
                              if (!hasUserBet) {
                                setSelectedProject(project)
                                setBetType('SUPPORT')
                              }
                            }}
                            disabled={hasUserBet}
                          >
                            <ThumbsUp className="mr-1 h-4 w-4" />
                            Support
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                            onClick={() => {
                              if (!hasUserBet) {
                                setSelectedProject(project)
                                setBetType('DOUBT')
                              }
                            }}
                            disabled={hasUserBet}
                          >
                            <ThumbsDown className="mr-1 h-4 w-4" />
                            Doubt
                          </Button>
                            </>
                          })()}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

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

        {/* Betting Modal */}
        {selectedProject && userId && selectedProject.bets && !selectedProject.bets.some((b: any) => b.userId === userId) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedProject(null)}>
            <div 
              className="bg-[#0A0F2B] border border-white/20 rounded-lg p-6 w-full max-w-md mx-4"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
              >
                <h3 className="text-xl font-bold text-white mb-4">Place Your Bet</h3>
                <p className="text-gray-400 mb-4">{selectedProject.title}</p>
                
                <div className="space-y-4">
                  {/* Bet Type Selection */}

                  {/* Bet Amount */}
                  <div className="space-y-2">
                    <label className="text-sm text-gray-400">Bet Amount (APT)</label>
                    <Slider
                      value={betAmount}
                      onValueChange={setBetAmount}
                      max={100}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Amount: {betAmount[0]} APT</span>
                      <span className="text-green-400">
                        Potential Return: {calculatePotentialReturn(2.5, betAmount[0])} APT
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6]"
                      onClick={() => handlePlaceBet(selectedProject.id)}
                      disabled={isPlacingBet}
                    >
                      {isPlacingBet ? (
                        <>
                          <Zap className="mr-2 h-4 w-4 animate-spin" />
                          Placing Bet...
                        </>
                      ) : (
                        <>
                          <Coins className="mr-2 h-4 w-4" />
                          Place Bet
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedProject(null)}
                      className="border-white/20 text-white hover:bg-white/10"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
