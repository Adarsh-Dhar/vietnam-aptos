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
  RefreshCw,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { useState, useEffect } from "react"
import { Slider } from "@/components/ui/slider"
import { useWallet } from "@/components/wallet/wallet-provider"
import { jwtDecode } from "jwt-decode"
import { 
  placeBetEnhanced, 
  claimPayoutEnhanced, 
  getProject, 
  getBetDetails, 
  calculatePotentialPayout,
  getUserPortfolio,
  getPlatformStats,
  getAptBalance,
  getAllProjects
} from "@/lib/contract"

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
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [projectStatus, setProjectStatus] = useState<any>(null)
  const [betError, setBetError] = useState<string | null>(null)

  // Contract state
  const [contractProjects, setContractProjects] = useState<any[]>([])
  const [contractLoading, setContractLoading] = useState(false)
  const [userContractBets, setUserContractBets] = useState<any[]>([])
  const [contractError, setContractError] = useState<string | null>(null)
  const [isClaimingPayout, setIsClaimingPayout] = useState(false)
  const [claimingProjectId, setClaimingProjectId] = useState<number | null>(null)

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
    // Log all contract projects on page load
    getAllProjects().then((projects) => {
      console.log('Contract projects:', projects)
    }).catch((err) => {
      console.error('Error fetching contract projects:', err)
    })
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

  // Fetch contract data when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchContractData()
    }
  }, [isConnected, address])

  // Fetch wallet balance when wallet connects
  useEffect(() => {
    if (isConnected && address) {
      (async () => {
        const balance = await getAptBalance(address)
        console.log("Wallet balance:", balance)
        setWalletBalance(balance)
      })()
    }
  }, [isConnected, address])

  // Fetch project status when modal opens
  useEffect(() => {
    async function fetchStatus() {
      if (selectedProject && selectedProject.contractProjectId && selectedProject.contractProjectId > 0) {
        try {
          const status = await getProject(selectedProject.contractProjectId)
          setProjectStatus(status)
        } catch {
          setProjectStatus(null)
        }
      } else {
        setProjectStatus(null)
      }
    }
    fetchStatus()
  }, [selectedProject])

  const fetchContractData = async () => {
    if (!isConnected || !address) return
    
    setContractLoading(true)
    setContractError(null)
    
    try {
      // Get user's contract portfolio
      const userBets = await getUserPortfolio(address)
      setUserContractBets(userBets)
      
      // Get platform stats from contract
      const platformStats = await getPlatformStats()
      console.log("Platform stats from contract:", platformStats)
      
    } catch (error) {
      console.error("Error fetching contract data:", error)
      setContractError("Failed to fetch contract data. Please try again.")
    } finally {
      setContractLoading(false)
    }
  }

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
    setBetError(null)
    if (!selectedProject || !isConnected || !address) return
    
    setIsPlacingBet(true)
    try {
      // Get the contract project ID from the database project
      const project = projects.find(p => p.id === projectId)
      if (!project) {
        setBetError("Project not found")
        throw new Error("Project not found")
      }
      
      let contractProjectId: number | undefined
      
      if (project.contractProjectId) {
        // Use the stored contract project ID
        contractProjectId = project.contractProjectId
      } else {
        // Fallback: try to get from platform stats and use mapping
        try {
          const platformStats = await getPlatformStats()
          if (platformStats && Array.isArray(platformStats) && platformStats[0]) {
            const projectIndex = projects.findIndex(p => p.id === projectId)
            contractProjectId = projectIndex + 1
          } else {
            throw new Error("Could not get platform stats")
          }
        } catch (error) {
          console.error("Error getting platform stats:", error)
          // Use a simple fallback: use the project's position in the list + 1
          const projectIndex = projects.findIndex(p => p.id === projectId)
          contractProjectId = projectIndex + 1
          console.log("Using fallback contract project ID:", contractProjectId)
        }
      }
      
      // Ensure we have a valid contract project ID
      if (!contractProjectId || isNaN(contractProjectId) || contractProjectId <= 0) {
        setBetError("Invalid contract project ID. Please ensure the project exists on the blockchain.")
        throw new Error("Invalid contract project ID")
      }
      
      console.log("Using contract project ID:", contractProjectId)
      console.log("Type of contractProjectId:", typeof contractProjectId)
      
      // Fetch project status from contract
      let contractStatus
      try {
        console.log("Calling getProject with:", contractProjectId)
        contractStatus = await getProject(contractProjectId)
        console.log("Project status received:", contractStatus)
      } catch (error) {
        console.error("Error fetching project from contract:", error)
        setBetError("Project does not exist on-chain.")
        throw new Error("Project does not exist on-chain.")
      }
      
      // Check deadline
      const deadline = contractStatus && typeof contractStatus[2] === 'number' ? contractStatus[2] * 1000 : 0 // contract returns seconds
      if (deadline && Date.now() > deadline) {
        setBetError("Project deadline has passed.")
        throw new Error("Project deadline has passed.")
      }
      
      // Check if project is active (status[5] == 0 means active)
      if (contractStatus && contractStatus[5] !== 0) {
        setBetError("Project is not active.")
        throw new Error("Project is not active.")
      }
      
      // Check wallet balance
      if (walletBalance !== null && walletBalance < betAmount[0]) {
        setBetError("Insufficient APT balance.")
        throw new Error("Insufficient APT balance.")
      }
      
      // Check if user already bet (optional, if contract restricts)
      const userBet = userContractBets.find(bet => bet.projectId === contractProjectId)
      if (userBet) {
        setBetError("You have already placed a bet on this project.")
        throw new Error("Already bet")
      }
      
      const amount = betAmount[0] * 1000000 // Convert to octas (8 decimals)
      
      console.log("Placing bet on contract:", {
        projectId: contractProjectId,
        amount,
        betType
      })
      
      const txHash = await placeBetEnhanced({
        projectId: contractProjectId,
        amount,
        betType,
        onResult: (hash) => console.log("Contract bet placed:", hash)
      })
      
      console.log("Contract bet successful:", txHash)
      
      // Then update database
      const response = await fetch(`/api/projects/${projectId}/bets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: betAmount[0],
          type: betType,
          contractTxHash: txHash
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
        
        // Refresh contract data
        await fetchContractData()
        
        // Log the bet result
        console.log('Bet placed:', result)
        // Show success message
        alert(`Bet placed successfully! Transaction: ${txHash}`)
      } else {
        const error = await response.json()
        setBetError(error.error || "Unknown error")
        alert(`Error: ${error.error}`)
      }
    } catch (error: any) {
      if (error && error.message) setBetError(error.message)
      console.error("Bet placement error:", error)
    } finally {
      setIsPlacingBet(false)
    }
  }

  const handleClaimPayout = async (projectId: number) => {
    if (!isConnected || !address) {
      alert("Please connect your wallet to claim payouts")
      return
    }
    
    setIsClaimingPayout(true)
    setClaimingProjectId(projectId)
    
    try {
      // Get the contract project ID from the database project
      const project = projects.find(p => p.id === projectId.toString())
      if (!project) {
        throw new Error("Project not found")
      }
      
      let contractProjectId: number
      
      if (project.contractProjectId) {
        // Use the stored contract project ID
        contractProjectId = project.contractProjectId
      } else {
        // Fallback: use mapping approach
        const projectIndex = projects.findIndex(p => p.id === projectId.toString())
        contractProjectId = projectIndex + 1
        console.log("Using fallback contract project ID for payout:", contractProjectId)
      }
      
      if (!contractProjectId || isNaN(contractProjectId) || contractProjectId <= 0) {
        throw new Error(`Invalid contract project ID: ${contractProjectId}. Please ensure the project exists on the blockchain.`)
      }
      
      console.log("Claiming payout for project:", contractProjectId)
      
      const txHash = await claimPayoutEnhanced({
        projectId: contractProjectId,
        onResult: (hash) => console.log("Payout claimed:", hash)
      })
      
      console.log("Payout claimed successfully:", txHash)
      
      // Refresh contract data
      await fetchContractData()
      
      alert(`Payout claimed successfully! Transaction: ${txHash}`)
    } catch (error) {
      console.error("Payout claim error:", error)
      alert(`Failed to claim payout: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsClaimingPayout(false)
      setClaimingProjectId(null)
    }
  }

  const calculatePotentialReturn = (odds: number, amount: number) => {
    return (odds * amount).toFixed(2)
  }

  const getContractBetStatus = (projectId: string) => {
    if (!address || !userContractBets) return null
    
    // Get the contract project ID from the database project
    const project = projects.find(p => p.id === projectId)
    if (!project) return null
    
    let contractProjectId: number
    
    if (project.contractProjectId) {
      // Use the stored contract project ID
      contractProjectId = project.contractProjectId
    } else {
      // Fallback: use mapping approach
      const projectIndex = projects.findIndex(p => p.id === projectId)
      contractProjectId = projectIndex + 1
    }
    
    const userBet = userContractBets.find(bet => bet.projectId === contractProjectId)
    
    if (userBet) {
      return {
        amount: userBet.betDetails[0] / 1000000, // Convert from octas
        type: userBet.betDetails[1] === 1 ? 'SUPPORT' : 'DOUBT',
        claimed: userBet.betDetails[2]
      }
    }
    
    return null
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
                  onClick={fetchContractData}
                  disabled={contractLoading}
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${contractLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                {!isConnected && (
                  <Button
                    variant="outline"
                    className="glass-card border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 bg-transparent"
                    onClick={connect}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Connect Wallet
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Contract Status */}
        {isConnected && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass-card p-4 mb-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-white">Connected to Aptos Contract</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-gray-400 text-sm">Address:</span>
                  <span className="text-[#00F0FF] text-sm font-mono">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>
              </div>
              {contractError && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {contractError}
                </div>
              )}
            </Card>
          </motion.div>
        )}

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
                {projects.map((project, index) => {
                  const contractBetStatus = getContractBetStatus(project.id)
                  
                  return (
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
                                Risk
                              </Badge>
                              {contractBetStatus && (
                                <Badge
                                  variant="outline"
                                  className={`${
                                    contractBetStatus.type === 'SUPPORT' 
                                      ? 'border-green-500/50 text-green-400' 
                                      : 'border-red-500/50 text-red-400'
                                  }`}
                                >
                                  {contractBetStatus.type}
                                </Badge>
                              )}
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

                          {/* Contract Bet Status */}
                          {contractBetStatus && (
                            <div className="border border-[#00F0FF]/20 rounded-lg p-3 bg-[#00F0FF]/5">
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="text-sm text-gray-400">Your Bet</p>
                                  <p className="text-white font-medium">
                                    {contractBetStatus.amount} APT - {contractBetStatus.type}
                                  </p>
                                </div>
                                {contractBetStatus.claimed ? (
                                  <Badge className="bg-green-600">Claimed</Badge>
                                ) : (
                                  <Button
                                    size="sm"
                                    onClick={() => handleClaimPayout(parseInt(project.id))}
                                    disabled={isClaimingPayout && claimingProjectId === parseInt(project.id)}
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    {isClaimingPayout && claimingProjectId === parseInt(project.id) ? (
                                      <>
                                        <Zap className="mr-1 h-3 w-3 animate-spin" />
                                        Claiming...
                                      </>
                                    ) : (
                                      <>
                                        <Coins className="mr-1 h-3 w-3" />
                                        Claim
                                      </>
                                    )}
                                  </Button>
                                )}
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-4 border-t border-white/10">
                            {(() => {
                              const hasUserBet = userId && project.bets && project.bets.some((b: any) => b.userId === userId)
                              const hasContractBet = contractBetStatus
                              
                              return <>
                                <Button
                                  size="sm"
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                  onClick={() => {
                                    if (!hasUserBet && !hasContractBet) {
                                      setSelectedProject(project)
                                      setBetType('SUPPORT')
                                    }
                                  }}
                                  disabled={hasUserBet || hasContractBet}
                                >
                                  <ThumbsUp className="mr-1 h-4 w-4" />
                                  Support
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="flex-1 border-red-500 text-red-400 hover:bg-red-500/10 bg-transparent"
                                  onClick={() => {
                                    if (!hasUserBet && !hasContractBet) {
                                      setSelectedProject(project)
                                      setBetType('DOUBT')
                                    }
                                  }}
                                  disabled={hasUserBet || hasContractBet}
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
                  )
                })}
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
                {/* Show wallet balance and project status */}
                <div className="mb-2 flex flex-col gap-1">
                  {walletBalance !== null && (
                    <span className="text-sm text-gray-400">Wallet Balance: <span className="text-white font-mono">{walletBalance} APT</span></span>
                  )}
                  {projectStatus && (
                    <span className="text-sm text-gray-400">Project Deadline: <span className="text-white font-mono">{new Date(projectStatus[2] * 1000).toLocaleString()}</span></span>
                  )}
                  {projectStatus && (
                    <span className="text-sm text-gray-400">Project Status: <span className="text-white font-mono">{projectStatus[5] === 0 ? 'Active' : 'Ended'}</span></span>
                  )}
                  {!projectStatus && selectedProject && (
                    <span className="text-sm text-yellow-400">⚠️ Project status unavailable - will check on-chain before betting</span>
                  )}
                </div>
                {/* Show error if any */}
                {betError && (
                  <div className="mb-2 text-red-400 text-sm flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    {betError}
                  </div>
                )}
                
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
