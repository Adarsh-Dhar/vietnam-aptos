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
import { useState, useEffect } from "react"
import { createProject as createProjectOnChain, initializePlatform } from "@/lib/contract"

// Helper to generate a random 64-char hex string
function generateRandomHex64() {
  const hex = Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return "0x" + hex;
}

export default function FoundersPage() {
  const [open, setOpen] = useState(false)
  const [projects, setProjects] = useState<any[]>([])
  const form = useForm({
    defaultValues: {
      name: "",
      description: "",
      aptosContract: generateRandomHex64(),
      coverImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
      listingFee: 10,
      targetHolders: "1000",
      deadline: new Date(Date.now() + 86400 * 10 * 1000), // 10 days from now
      categories: ["Health Tech"],
    },
  })
  const [loading, setLoading] = useState(false)
  const [loadingStep, setLoadingStep] = useState("")
  const [error, setError] = useState("")
  const [editOpen, setEditOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState<any>(null)
  const [projectsLoading, setProjectsLoading] = useState(true)
  const [stats, setStats] = useState<any[]>([])
  const [statsLoading, setStatsLoading] = useState(true)

  // Fetch projects from API
  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const jwt = typeof window !== "undefined" ? localStorage.getItem("jwt") : null;
      const res = await fetch("/api/projects", {
        headers: {
          ...(jwt ? { Authorization: `Bearer ${jwt}` } : {})
        }
      });
      
      if (res.ok) {
        const projectsData = await res.json();
        setProjects(projectsData);
      } else if (res.status === 401) {
        console.log("User not authenticated");
        setProjects([]);
      } else {
        console.error("Failed to fetch projects:", res.status);
      }
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setProjectsLoading(false);
    }
  };

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      setStatsLoading(true);
      const res = await fetch("/api/stats");
      
      if (res.ok) {
        const statsData = await res.json();
        // Transform stats data to match our display format
        const transformedStats = [
          { label: "Total Projects", value: statsData.totalProjects?.toString() || "0", change: "+0", icon: Lightbulb },
          { label: "Success Rate", value: `${statsData.avgSuccessRate?.toFixed(1) || 0}%`, change: "+0%", icon: TrendingUp },
          { label: "Total Volume", value: `${(statsData.totalVolume || 0).toFixed(1)} APT`, change: "+0", icon: DollarSign },
          { label: "Active Projects", value: statsData.activeProjects?.toString() || "0", change: "+0", icon: Clock },
        ];
        setStats(transformedStats);
      } else {
        console.error("Failed to fetch stats:", res.status);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Load projects and stats on component mount
  useEffect(() => {
    fetchProjects();
    fetchStats();
  }, []);

  const handleCreateProject = async (data: any) => {
    setLoading(true)
    setError("")
    setLoadingStep("Validating project data...")
    try {
      // 0. Initialize platform
      /*
      try {
        await initializePlatform();
      } catch (initErr) {
        setError("Failed to initialize platform: " + (initErr));
        setLoading(false);
        return;
      }
      */
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
      // Encode metadataUri as Uint8Array for contract call
      let metadataUri = typeof window !== "undefined" && window.TextEncoder
        ? new window.TextEncoder().encode(data.coverImage)
        : new TextEncoder().encode(data.coverImage);
      console.log("metadataUri for contract:", metadataUri, Array.isArray(metadataUri), metadataUri instanceof Uint8Array);
      if (typeof data.coverImage !== "string" || !data.coverImage.startsWith("http")) {
        setError("Cover Image URL must be a valid URL string (starting with http...)");
        setLoading(false);
        return;
      }

      if (!targetHolders || !deadline || !nftContract || !metadataUri) {
        setError("Missing required fields for contract call");
        setLoading(false);
        return;
      }

      // Log deadline and current time for debugging
      const currentTime = Math.floor(Date.now() / 1000);
      console.log("deadline:", deadline, "current_time:", currentTime, "min:", currentTime + 86400, "max:", currentTime + 2592000);

      // Log initialization status of Platform resource
      try {
        const moduleAddress = "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b"; // Module address
        const adminAddress = "0x3badada8a3331daea64d8b3b108dd609bda222f6cf4bb77463a31eed7cff517b"; // Admin address (profile address)
        const resourceType = `${moduleAddress}::main::Platform`;
        const nodeUrl = "https://fullnode.devnet.aptoslabs.com/v1";
        const res = await fetch(`${nodeUrl}/accounts/${adminAddress}/resource/${encodeURIComponent(resourceType)}`);
        if (res.ok) {
          const data = await res.json();
          console.log("Platform resource exists:", true, data);
        } else {
          console.log("Platform resource exists:", false, await res.text());
        }
      } catch (e) {
        console.log("Error checking Platform resource:", e);
      }

      // Step 1: Submit transaction to blockchain
      setLoadingStep("Submitting transaction to blockchain...")
      console.log("Submitting transaction to blockchain...");
      const txHash = await createProjectOnChain({
        targetHolders,
        deadline,
        nftContract,
        metadataUri,
      });

      console.log("Transaction submitted successfully:", txHash);

      // Step 2: Wait for transaction confirmation and then add to DB
      setLoadingStep("Waiting for transaction confirmation...")
      console.log("Waiting for transaction confirmation...");
      
      // The createProjectOnChain function already waits for confirmation, but let's add additional verification
      try {
        // Verify transaction was successful by checking if it exists on chain
        const nodeUrl = "https://fullnode.devnet.aptoslabs.com/v1";
        const txResponse = await fetch(`${nodeUrl}/transactions/by_hash/${txHash}`);
        
        if (!txResponse.ok) {
          throw new Error("Transaction not found on chain");
        }
        
        const txData = await txResponse.json();
        if (txData.vm_status !== "Executed successfully") {
          throw new Error(`Transaction failed: ${txData.vm_status}`);
        }
        
        console.log("Transaction confirmed successfully on chain");
      } catch (verificationError) {
        console.error("Transaction verification failed:", verificationError);
        setError("Transaction was submitted but verification failed. Please check your wallet for transaction status.");
        setLoading(false);
        setLoadingStep("");
        return;
      }

      // Step 3: Add to database only after transaction is confirmed
      setLoadingStep("Adding project to database...")
      console.log("Adding project to database...");
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
          contractTxHash: txHash, // Store the confirmed transaction hash
        }),
      });

      if (!res.ok) {
        let errMsg = `Database Error: ${res.status}`;
        try {
          const err = await res.json();
          if (err.error && err.error.includes('Unique constraint failed') && err.error.includes('aptosContract')) {
            errMsg = "A project with this Aptos contract address already exists. Please use a unique contract address.";
          } else {
            errMsg += err.error ? ` - ${err.error}` : "";
          }
        } catch (e) {}
        setError(errMsg + " (Transaction was successful on blockchain but failed to save to database)");
        setLoading(false);
        setLoadingStep("");
        return;
      }
      
      const newProject = await res.json();
      setProjects([newProject, ...projects]);
      setOpen(false);
      form.reset();
      
      console.log("Project created successfully:", newProject);
      
      // Refresh projects list to get the latest data
      await fetchProjects();
      
      // Refresh stats to get updated numbers
      await fetchStats();
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
      setLoadingStep("");
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
      
      // Refresh projects list to get the latest data
      await fetchProjects();
      
      // Refresh stats to get updated numbers
      await fetchStats();
    } catch (e) {
      setError("Failed to update project")
    } finally {
      setLoading(false);
      setLoadingStep("");
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
      
      // Refresh projects list to get the latest data
      await fetchProjects();
      
      // Refresh stats to get updated numbers
      await fetchStats();
    } catch (e) {
      setError("Failed to delete project")
    } finally {
      setLoading(false);
      setLoadingStep("");
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
      
      // Refresh projects list to get the latest data
      await fetchProjects();
      
      // Refresh stats to get updated numbers
      await fetchStats();
    } catch (e) {
      setError("Failed to save draft")
    } finally {
      setLoading(false);
      setLoadingStep("");
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
      
      // Refresh projects list to get the latest data
      await fetchProjects();
      
      // Refresh stats to get updated numbers
      await fetchStats();
    } catch (e) {
      setError("Failed to publish draft")
    } finally {
      setLoading(false);
      setLoadingStep("");
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
            <Dialog open={open} onOpenChange={(val) => {
              setOpen(val);
              if (val) {
                form.reset({
                  ...form.getValues(),
                  aptosContract: generateRandomHex64(),
                });
              }
            }}>
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
                          <Input placeholder="0x..." {...field} required />
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
                        {loading ? (loadingStep || "Submitting...") : "Submit Project"}
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
          {statsLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading stats...</p>
            </div>
          ) : stats.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">No stats available yet.</p>
            </div>
          ) : (
            stats.map((stat, index) => (
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
            ))
          )}
        </div>

        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>

          {projectsLoading ? (
            <div className="text-center py-10">
              <p className="text-gray-500">Loading your projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">You haven't submitted any projects yet. Start by submitting one!</p>
              <Button
                size="lg"
                className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80 mt-4"
                onClick={() => setOpen(true)}
              >
                <Plus className="mr-2 h-5 w-5" />
                Submit New Project
              </Button>
            </div>
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
                  <Card className="glass-card p-6 h-full">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-white">{project.name}</h3>
                          <Badge
                            variant="outline"
                            className={
                              project.status === "ACTIVE"
                                ? "border-green-500/50 text-green-400"
                                : project.status === "SUCCESS"
                                  ? "border-blue-500/50 text-blue-400"
                                  : project.status === "FAILURE"
                                    ? "border-red-500/50 text-red-400"
                                    : project.status === "PENDING_VALIDATION"
                                      ? "border-yellow-500/50 text-yellow-400"
                                      : "border-gray-500/50 text-gray-400"
                            }
                          >
                            {project.status === "ACTIVE" ? "Active" :
                             project.status === "SUCCESS" ? "Completed" :
                             project.status === "FAILURE" ? "Failed" :
                             project.status === "PENDING_VALIDATION" ? "Pending" :
                             project.status}
                          </Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{project.description}</p>
                        <Badge variant="outline" className="border-[#00F0FF]/50 text-[#00F0FF]">
                          {project.categories?.[0]?.name || "Other"}
                        </Badge>
                      </div>

                      <div className="flex gap-1 ml-2">
                        <Button size="sm" variant="ghost" className="text-gray-400 hover:text-white" onClick={() => {
                          setEditOpen(true);
                          setSelectedProject(project);
                          const resetData: any = { ...project };
                          if (project.deadline && !isNaN(Date.parse(project.deadline))) {
                            resetData.deadline = new Date(project.deadline);
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
                          <span className="text-gray-400">Target: {project.targetHolders} Holders</span>
                          <span className="text-white">{Math.round((project.currentHolders / project.targetHolders) * 100)}%</span>
                        </div>
                        <Progress value={(project.currentHolders / project.targetHolders) * 100} className="h-2" />
                      </div>

                      {/* Metrics */}
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-400">Time Remaining</p>
                          <p className="text-white font-medium">
                            {new Date(project.deadline) > new Date() 
                              ? `${Math.ceil((new Date(project.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days`
                              : "Expired"}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Total Pool</p>
                          <p className="text-white font-medium">{project.totalPool ? `${project.totalPool.toFixed(2)} APT` : "0 APT"}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Support Pool</p>
                          <p className="text-green-400 font-medium">{project.supportPool ? `${project.supportPool.toFixed(2)} APT` : "0 APT"}</p>
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
                        {project.status === "SUCCESS" && (
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
          )}
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
                    {loading ? (loadingStep || "Saving...") : "Save Changes"}
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
