"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Form, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { ThumbsUp, ThumbsDown, Eye } from "lucide-react"
import { useForm } from "react-hook-form"
import { useWallet } from "@/components/wallet/wallet-provider"
import { placeBet } from "@/lib/contract";

interface Project {
  id: string
  name: string
  description: string
  targetHolders: number
  currentHolders: number
  deadline: string
  status: string
  supportPool: number
  doubtPool: number
  totalPool: number
  categories: { name: string }[]
  selectedNFT?: { imageUrl?: string; tokenName?: string; collectionName?: string }
  creator: { username?: string }
}

type BetType = "SUPPORT" | "DOUBT"

export default function InvestorsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [betting, setBetting] = useState<string | null>(null)
  const [betError, setBetError] = useState<string | null>(null)
  const [betSuccess, setBetSuccess] = useState<string | null>(null)
  const { isConnected, connect } = useWallet()

  useEffect(() => {
    fetch("/api/projects")
      .then(res => res.json())
      .then(data => {
        setProjects(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load projects.")
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg p-6">
      <div className="container mx-auto">
        <div className="mb-8" style={{ opacity: 0, transform: 'translateY(20px)', animation: 'fadeInUp 0.5s forwards' }}>
          <h1 className="text-4xl font-bold text-white mb-2">Invest in Startups</h1>
          <p className="text-gray-400">Back projects you believe in. Bet APT in favour or against their success.</p>
        </div>
        {loading ? (
          <div className="text-center text-gray-400 py-20">Loading projects...</div>
        ) : error ? (
          <div className="text-center text-red-400 py-20">{error}</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {projects.map((project, index) => {
              const progress = Math.min(100, (project.currentHolders / project.targetHolders) * 100)
              const timeLeft = (() => {
                const now = new Date()
                const deadline = new Date(project.deadline)
                const diff = deadline.getTime() - now.getTime()
                if (diff <= 0) return "Ended"
                const days = Math.floor(diff / (1000 * 60 * 60 * 24))
                const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
                return `${days}d ${hours}h left`
              })()
              return (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                >
                  <Card className="glass-card p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{project.name}</h3>
                        <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                        <div className="flex gap-2 mb-2">
                          {project.categories.map(cat => (
                            <Badge key={cat.name} variant="outline" className="border-[#00F0FF]/50 text-[#00F0FF]">
                              {cat.name}
                            </Badge>
                          ))}
                        </div>
                        {project.selectedNFT?.imageUrl && (
                          <img src={project.selectedNFT.imageUrl} alt="NFT" className="w-16 h-16 rounded-lg mb-2 border border-white/10" />
                        )}
                        <div className="text-xs text-gray-500">By {project.creator?.username || "Founder"}</div>
                      </div>
                      <Button size="sm" variant="ghost" className="text-gray-400">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-400">Target: {project.targetHolders} Holders</span>
                          <span className="text-white">{progress.toFixed(0)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4 text-green-400" />
                            <span className="text-sm text-white">{project.supportPool} APT</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsDown className="h-4 w-4 text-red-400" />
                            <span className="text-sm text-white">{project.doubtPool} APT</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-400">Total Pool</p>
                          <p className="text-sm font-bold text-[#00F0FF]">{project.totalPool} APT</p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-white/10">
                        <span className="text-sm text-gray-400">{timeLeft}</span>
                        {isConnected ? (
                          <BetForm
                            projectId={project.id}
                            disabled={betting === project.id}
                            onStart={() => { setBetting(project.id); setBetError(null); setBetSuccess(null); }}
                            onEnd={() => setBetting(null)}
                            onError={msg => setBetError(msg)}
                            onSuccess={msg => setBetSuccess(msg)}
                          />
                        ) : (
                          <Button size="sm" className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] text-white" onClick={connect}>
                            Connect Wallet to Bet
                          </Button>
                        )}
                      </div>
                      {betError && betting === project.id && (
                        <div className="text-sm text-red-400 mt-2">{betError}</div>
                      )}
                      {betSuccess && betting === project.id && (
                        <div className="text-sm text-green-400 mt-2">{betSuccess}</div>
                      )}
                    </div>
                  </Card>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

function BetForm({ projectId, disabled, onStart, onEnd, onError, onSuccess }: {
  projectId: string
  disabled?: boolean
  onStart: () => void
  onEnd: () => void
  onError: (msg: string) => void
  onSuccess: (msg: string) => void
}) {
  const form = useForm<{ amount: string; type: BetType }>({
    defaultValues: { amount: "", type: "SUPPORT" },
  })

  const onSubmit = async (values: { amount: string; type: BetType }) => {
    console.log("BetForm onSubmit called", values);
    onStart();
    try {
      // Validate projectId, default to 1 if invalid
      let pid = Number(projectId);
      if (!pid || isNaN(pid)) pid = 1;
      // Validate amount
      const amt = Math.floor(parseFloat(values.amount) * 1_000_000);
      if (!amt || isNaN(amt) || amt <= 0) throw new Error("Invalid amount. Enter a positive number.");
      // Validate bet type
      const btype = values.type === "SUPPORT" ? 1 : values.type === "DOUBT" ? 2 : null;
      if (btype !== 1 && btype !== 2) throw new Error("Invalid bet type");

      // Check wallet
      let wallet;
      try {
        wallet = (window as any).aptos;
        if (!wallet) throw new Error("Aptos wallet not found. Please install or connect your wallet.");
      } catch (err) {
        console.error("Wallet not found", err);
        throw new Error("Aptos wallet not found. Please install or connect your wallet.");
      }

      // Log before sending tx
      console.log("Calling placeBet with", { projectId: pid, amount: amt, betType: btype });

      await placeBet({
        projectId: pid,
        amount: amt,
        betType: btype,
      });

      onSuccess("Bet placed on-chain!");
      form.reset();
    } catch (e: any) {
      console.error("BetForm error", e);
      onError(e.message || "Failed to place bet on-chain.");
    } finally {
      onEnd();
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-2 w-full">
        <div className="flex gap-2 w-full">
          <FormItem className="w-24">
            <FormLabel>Amount</FormLabel>
            <FormControl>
              <Input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="APT"
                disabled={disabled}
                {...form.register("amount", { required: true, min: 0.01 })}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
          <FormItem className="w-28">
            <FormLabel>Type</FormLabel>
            <FormControl>
              <Select
                value={form.watch("type")}
                onValueChange={val => form.setValue("type", val as BetType)}
                disabled={disabled}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SUPPORT">Favour</SelectItem>
                  <SelectItem value="DOUBT">Against</SelectItem>
                </SelectContent>
              </Select>
            </FormControl>
            <FormMessage />
          </FormItem>
        </div>
        <Button type="submit" size="lg" className="w-full bg-green-600 hover:bg-green-700 text-white mt-2" disabled={disabled}>
          Bet
        </Button>
      </form>
    </Form>
  )
}
