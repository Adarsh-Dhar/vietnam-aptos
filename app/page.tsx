"use client"

import { motion } from "framer-motion"
import { HeroSection } from "@/components/landing/hero-section"
import { ValidationJourney } from "@/components/landing/validation-journey"
import { FeatureShowcase } from "@/components/landing/feature-showcase"
import { CTASection } from "@/components/landing/cta-section"

export default function LandingPage() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen particle-bg"
    >
      <HeroSection />
      <ValidationJourney />
      <FeatureShowcase />
      <CTASection />
    </motion.div>
  )
}
