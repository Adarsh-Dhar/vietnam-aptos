"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Plus,
  TrendingUp,
  Users,
  DollarSign,
  Clock,
  BarChart3,
  Lightbulb,
  Rocket,
  Eye,
  Edit,
  Trash2,
} from "lucide-react"
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Form, FormItem, FormLabel, FormControl, FormMessage, FormField } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { useForm, Controller } from "react-hook-form"
import { useState } from "react"
import { createProject as createProjectOnChain, initializePlatform } from "@/lib/contract"

const founderProjects = [
  {
    id: 1,
    title: "AI-Powered Fitness App",
    description: "Personalized workout plans using machine learning algorithms",
    status: "Active",
    targetMetric: "10,000 Users",
    currentProgress: 65,
    validationPeriod: "30 days",
    timeRemaining: "8 days",
    totalStaked: "2,450 APT",
    supportPercentage: 68,
    category: "Health Tech",
    createdAt: "2024-01-15",
  },
  {
    id: 2,
    title: "Sustainable Food Delivery",
    description: "Zero-waste delivery service with reusable packaging system",
    status: "Pending",
    targetMetric: "$50K Revenue",
    currentProgress: 0,
    validationPeriod: "45 days",
    timeRemaining: "45 days",
    totalStaked: "0 APT",
    supportPercentage: 0,
    category: "Sustainability",
    createdAt: "2024-01-20",
  },
  {
    id: 3,
    title: "Blockchain Learning Platform",
    description: "Interactive courses for Web3 development and DeFi",
    status: "Completed",
    targetMetric: "5,000 Students",
    currentProgress: 100,
    validationPeriod: "60 days",
    timeRemaining: "Completed",
    totalStaked: "8,920 APT",
    supportPercentage: 84,
    category: "Education",
    createdAt: "2023-12-01",
  },
]

const stats = [
  { label: "Total Projects", value: "12", change: "+3", icon: Lightbulb },
  { label: "Success Rate", value: "75%", change: "+8%", icon: TrendingUp },
  { label: "Total Validation", value: "15.2K APT", change: "+2.1K", icon: DollarSign },
  { label: "Avg. Time to Market", value: "28 days", change: "-5 days", icon: Clock },
]

export default function FoundersPage() {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState(founderProjects)
  const form = useForm({
    defaultValues: {
      name: "Test Project",
      description: "A project created with Move test defaults.",
      aptosContract: "0x1000000000000000000000000000000000000000000000000000000000000001",
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      listingFee: 10,
      targetHolders: "1000",
      deadline: new Date(Date.now() + 86400 * 10 * 1000), // 10 days from now
      categories: ["Health Tech"],
    },
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)

  const handleCreateProject = async (data: any) => {
    setLoading(true)
    setError("")
    try {
      // 0. Initialize platform
      try {
        await initializePlatform();
      } catch (initErr) {
        setError("Failed to initialize platform: " + (initErr));
        setLoading(false);
        return;
      }
      // 1. Call contract
      const targetHolders = data.targetHolders ? parseInt(data.targetHolders, 10) : undefined;
      const deadline = data.deadline ? Math.floor(data.deadline.getTime() / 1000) : undefined; // UNIX seconds

      // Validate and pad hex string for contract address
      function isValidHex(str: string) {
        return /^0x[0-9a-fA-F]+$/.test(str);
      }
      function padHexAddress(str: string) {
        if (!str.startsWith("0x")) return str;
        const hex = str.slice(2);
        if (hex.length > 64) return null; // too long
        return "0x" + hex.padStart(64, "0");
      }
      if (!isValidHex(data.aptosContract)) {
        setError("Aptos Contract Address must be a valid hex string (e.g., 0x1234...)");
        setLoading(false);
        return;
      }
      const paddedContract = padHexAddress(data.aptosContract);
      if (!paddedContract) {
        setError("Aptos Contract Address is too long (max 64 hex chars after 0x)");
        setLoading(false);
        return;
      }
      const nftContract = paddedContract;
      const metadataUri = data.coverImage;
      if (typeof metadataUri !== "string" || !metadataUri.startsWith("http")) {
        setError("Cover Image URL must be a valid URL string (starting with http...)");
        setLoading(false);
        return;
      }

      if (!targetHolders || !deadline || !nftContract || !metadataUri) {
        setError("Missing required fields for contract call");
        setLoading(false);
        return;
      }

      const txHash = await createProjectOnChain({
        targetHolders,
        deadline,
        nftContract,
        metadataUri,
      });

      // 2. Add to DB
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({
          ...data,
          targetHolders,
          deadline: data.deadline ? data.deadline.toISOString() : undefined,
          contractTxHash: txHash, // Optionally store tx hash
        }),
      });

      if (!res.ok) {
        let errMsg = `Error: ${res.status}`;
        try {
          const err = await res.json();
          errMsg += err.error ? ` - ${err.error}` : "";
        } catch (e) {}
        setError(errMsg);
        setLoading(false);
        return;
      }
      const newProject = await res.json();
      setProjects([newProject, ...projects]);
      setOpen(false);
      form.reset();
    } catch (e) {
      let errMsg = "Failed to create project";
      if (typeof e === "object" && e && "message" in e) {
        errMsg += ": " + (e as any).message;
      } else if (typeof e === "string") {
        errMsg += ": " + e;
      }
      setError(errMsg);
      console.error("Project creation error:", e);
    } finally {
      setLoading(false);
    }
  }

  const handleEditProject = async (data: any) => {
    setLoading(true)
    setError("")
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null
      const res = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({
          ...data,
          targetHolders: data.targetHolders ? parseInt(data.targetHolders, 10) : undefined,
          deadline: data.deadline ? data.deadline.toISOString() : undefined,
        }),
      })
      if (!res.ok) {
        let errMsg = `Error: ${res.status}`
        try {
          const err = await res.json()
          errMsg += err.error ? ` - ${err.error}` : ""
        } catch (e) {}
        setError(errMsg)
        setLoading(false)
        return
      }
      const updated = await res.json()
      setProjects(projects.map(p => p.id === updated.id ? updated : p))
      setEditOpen(false)
      setSelectedProject(null)
      form.reset()
    } catch (e) {
      setError("Failed to update project")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async () => {
    setLoading(true)
    setError("")
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null
      const res = await fetch(`/api/projects/${projectToDelete.id}`, {
        method: "DELETE",
        headers: {
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        }
      })
      if (!res.ok) {
        let errMsg = `Error: ${res.status}`
        try {
          const err = await res.json()
          errMsg += err.error ? ` - ${err.error}` : ""
        } catch (e) {}
        setError(errMsg)
        setLoading(false)
        return
      }
      setProjects(projects.filter(p => p.id !== projectToDelete.id))
      setDeleteConfirmOpen(false)
      setProjectToDelete(null)
    } catch (e) {
      setError("Failed to delete project")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async (data: any) => {
    setLoading(true)
    setError("")
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({
          ...data,
          targetHolders: data.targetHolders ? parseInt(data.targetHolders, 10) : undefined,
          deadline: data.deadline ? data.deadline.toISOString() : undefined,
          status: "PENDING_VALIDATION"
        }),
      })
      if (!res.ok) {
        let errMsg = `Error: ${res.status}`
        try {
          const err = await res.json()
          errMsg += err.error ? ` - ${err.error}` : ""
        } catch (e) {}
        setError(errMsg)
        setLoading(false)
        return
      }
      const newProject = await res.json()
      setProjects([newProject, ...projects])
      setOpen(false)
      form.reset()
    } catch (e) {
      setError("Failed to save draft")
    } finally {
      setLoading(false)
    }
  }

  const handlePublishDraft = async (project: any) => {
    setLoading(true)
    setError("")
    try {
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        },
        body: JSON.stringify({ status: "ACTIVE" }),
      })
      if (!res.ok) {
        let errMsg = `Error: ${res.status}`
        try {
          const err = await res.json()
          errMsg += err.error ? ` - ${err.error}` : ""
        } catch (e) {}
        setError(errMsg)
        setLoading(false)
        return
      }
      const updated = await res.json()
      setProjects(projects.map(p => p.id === updated.id ? updated : p))
    } catch (e) {
      setError("Failed to publish draft")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0F2B] particle-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Founder Dashboard</h1>
              <p className="text-gray-400">Validate your startup ideas with blockchain-powered community feedback</p>
            </div>
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80"
                >
                  <Plus className="mr-2 h-5 w-5" />
                  Submit New Project
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Submit New Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateProject)} className="space-y-4">
                    <FormField name="name" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Name</FormLabel>
                        <FormControl>
                          <Input placeholder="AI-Powered Fitness App" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="description" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Describe your project..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="aptosContract" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Aptos Contract Address</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="coverImage" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cover Image URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="listingFee" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Listing Fee (APT)</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField name="targetHolders" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Holders</FormLabel>
                        <FormControl>
                          <Input placeholder="10000" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Controller
                      name="deadline"
                      control={form.control}
                      rules={{ required: "Deadline is required" }}
                      render={({ field, fieldState }) => (
                        <FormItem>
                          <FormLabel>Deadline</FormLabel>
                          <FormControl>
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={date => {
                                if (date) field.onChange(date)
                              }}
                              defaultMonth={field.value || new Date()}
                              className="rounded-md border"
                            />
                          </FormControl>
                          {!field.value && (
                            <p className="text-sm text-red-500">Please select a deadline date.</p>
                          )}
                          <FormMessage>{fieldState.error?.message}</FormMessage>
                        </FormItem>
                      )}
                    />
                    <FormField name="categories" control={form.control} render={({ field }) => (
                      <FormItem>
                        <FormLabel>Categories</FormLabel>
                        <FormControl>
                          <Select onValueChange={val => field.onChange([val])}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Health Tech">Health Tech</SelectItem>
                              <SelectItem value="Sustainability">Sustainability</SelectItem>
                              <SelectItem value="Education">Education</SelectItem>
                              <SelectItem value="DeFi">DeFi</SelectItem>
                              <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    {error && <div className="text-red-500 text-sm">{error}</div>}
                    <DialogFooter>
                      <Button type="submit" className="w-full bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6]" disabled={loading || !form.getValues("deadline")}>
                        {loading ? "Submitting..." : "Submit Project"}
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
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

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <Card className="glass-card p-6 h-full">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-white">{project.title}</h3>
                        <Badge
                          variant="outline"
                          className={
                            project.status === "Active"
                              ? "border-green-500/50 text-green-400"
                              : project.status === "Completed"
                                ? "border-blue-500/50 text-blue-400"
                                : "border-yellow-500/50 text-yellow-400"
                          }
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                      <Badge variant="outline" className="border-[#00F0FF]/50 text-[#00F0FF]">
                        {project.category}
                      </Badge>
                    </div>

                    <div className="flex gap-1 ml-2">
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => {
                        setEditOpen(true);
                        setSelectedProject(project);
                        const resetData: any = { ...project };
                        if ((project as any).deadline && !isNaN(Date.parse((project as any).deadline))) {
                          resetData.deadline = new Date((project as any).deadline);
                        } else {
                          delete resetData.deadline;
                        }
                        form.reset(resetData);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-gray-400 hover:text-red-400" onClick={() => { setDeleteConfirmOpen(true); setProjectToDelete(project) }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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

                    {/* Metrics */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-400">Time Remaining</p>
                        <p className="text-white font-medium">{project.timeRemaining}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Total Staked</p>
                        <p className="text-white font-medium">{project.totalStaked}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Support Rate</p>
                        <p className="text-green-400 font-medium">{project.supportPercentage}%</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Created</p>
                        <p className="text-white font-medium">{new Date(project.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-white/10">
                      <Button size="sm" className="flex-1 bg-[#00F0FF]/20 text-[#00F0FF] hover:bg-[#00F0FF]/30">
                        <BarChart3 className="mr-1 h-4 w-4" />
                        Analytics
                      </Button>
                      {project.status === "Completed" && (
                        <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                          <Rocket className="mr-1 h-4 w-4" />
                          Launch
                        </Button>
                      )}
                      {project.status === "PENDING_VALIDATION" && (
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700" onClick={() => handlePublishDraft(project)}>
                          Publish
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
          <Card className="glass-card p-6">
            <h3 className="text-xl font-bold text-white mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="glass-card border-[#00F0FF]/50 text-[#00F0FF] hover:bg-[#00F0FF]/10 h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <Plus className="h-6 w-6" />
                <span>Submit New Project</span>
                <span className="text-xs text-gray-400">Get community validation</span>
              </Button>

              <Button
                variant="outline"
                className="glass-card border-[#8B5CF6]/50 text-[#8B5CF6] hover:bg-[#8B5CF6]/10 h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <BarChart3 className="h-6 w-6" />
                <span>View Analytics</span>
                <span className="text-xs text-gray-400">Track performance</span>
              </Button>

              <Button
                variant="outline"
                className="glass-card border-[#10B981]/50 text-[#10B981] hover:bg-[#10B981]/10 h-auto p-4 flex flex-col items-center gap-2 bg-transparent"
              >
                <Users className="h-6 w-6" />
                <span>Community Hub</span>
                <span className="text-xs text-gray-400">Connect with investors</span>
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Edit Project Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Project</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(handleEditProject)} className="space-y-4">
                <FormField name="name" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="AI-Powered Fitness App" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="description" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe your project..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="aptosContract" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Aptos Contract Address</FormLabel>
                    <FormControl>
                      <Input placeholder="0x..." {...field} disabled />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="coverImage" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cover Image URL</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="listingFee" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Listing Fee (APT)</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField name="targetHolders" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target Holders</FormLabel>
                    <FormControl>
                      <Input placeholder="10000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Controller
                  name="deadline"
                  control={form.control}
                  rules={{ required: "Deadline is required" }}
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={date => {
                            if (date) field.onChange(date)
                          }}
                          defaultMonth={field.value || new Date()}
                          className="rounded-md border"
                        />
                      </FormControl>
                      {!field.value && (
                        <p className="text-sm text-red-500">Please select a deadline date.</p>
                      )}
                      <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                  )}
                />
                <FormField name="categories" control={form.control} render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categories</FormLabel>
                    <FormControl>
                      <Select onValueChange={val => field.onChange([val])} value={field.value?.[0] || ""}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Health Tech">Health Tech</SelectItem>
                          <SelectItem value="Sustainability">Sustainability</SelectItem>
                          <SelectItem value="Education">Education</SelectItem>
                          <SelectItem value="DeFi">DeFi</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                {error && <div className="text-red-500 text-sm">{error}</div>}
                <DialogFooter>
                  <Button type="submit" className="w-full bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6]" disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
