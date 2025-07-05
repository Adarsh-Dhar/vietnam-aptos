"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import Link from "next/link"

export function CTASection() {
  return (
    <section className="py-24 px-4">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          className="glass-card p-12 text-center relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-[#00F0FF]/10 to-[#8B5CF6]/10"
            animate={{
              background: [
                "linear-gradient(45deg, rgba(0,240,255,0.1) 0%, rgba(139,92,246,0.1) 100%)",
                "linear-gradient(45deg, rgba(139,92,246,0.1) 0%, rgba(0,240,255,0.1) 100%)",
              ],
            }}
            transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatType: "reverse" }}
          />

          <div className="relative z-10">
            <motion.div initial={{ y: 20, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
              <Sparkles className="h-12 w-12 text-[#00F0FF] mx-auto mb-6" />
            </motion.div>

            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent"
            >
              Ready to Validate?
            </motion.h2>

            <motion.p
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto"
            >
              Join thousands of founders and investors using blockchain technology to make smarter startup decisions.
            </motion.p>

            <motion.div
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Link href="/dashboard">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-[#00F0FF] to-[#8B5CF6] hover:from-[#00F0FF]/80 hover:to-[#8B5CF6]/80 text-white font-semibold group"
                >
                  Start Validating
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>

              <Link href="/marketplace">
                <Button
                  size="lg"
                  variant="outline"
                  className="glass-card border-white/30 text-white hover:bg-white/10 group bg-transparent"
                >
                  Explore Projects
                  <Sparkles className="ml-2 h-4 w-4 group-hover:rotate-180 transition-transform" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
