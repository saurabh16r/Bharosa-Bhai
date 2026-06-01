"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ShieldCheck, TrendingUp, Target, Landmark, HeartHandshake, Coins } from "lucide-react";

const features = [
  {
    title: "Secure Karo",
    description: "Build an emergency fund & get adequate insurance to protect your family.",
    icon: ShieldCheck,
    color: "text-[#1E88FF]",
    bg: "bg-[#1E88FF]/10",
  },
  {
    title: "Grow Karo",
    description: "Beat inflation with smart mutual funds and stock investments.",
    icon: TrendingUp,
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
  },
  {
    title: "Plan Karo",
    description: "Define goals like buying a house or children's education & map your investments.",
    icon: Target,
    color: "text-[#F7B500]",
    bg: "bg-[#F7B500]/10",
  },
  {
    title: "Save Tax",
    description: "Legally minimize your tax outgo using ELSS, 80C, 80D, and NPS.",
    icon: Landmark,
    color: "text-[#A855F7]",
    bg: "bg-[#A855F7]/10",
  },
  {
    title: "Retire Smart",
    description: "Start early to build a massive corpus for a peaceful retirement life.",
    icon: HeartHandshake,
    color: "text-[#EC4899]",
    bg: "bg-[#EC4899]/10",
  },
  {
    title: "Build Wealth",
    description: "Create compounding machines that make money while you sleep.",
    icon: Coins,
    color: "text-[#EAB308]",
    bg: "bg-[#EAB308]/10",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white"
          >
            Bhai ka Plan. <span className="text-[#F7B500]">Solid Returns.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#B5B5B5] text-lg"
          >
            A complete framework to take you from financial confusion to financial freedom.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:-translate-y-2 transition-transform duration-300 border-[rgba(255,255,255,0.05)] hover:border-[rgba(247,181,0,0.3)] hover:glow-primary bg-[#121212]">
                <CardHeader>
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center mb-4`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-xl mb-2">{feature.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
