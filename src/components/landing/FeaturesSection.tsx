"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { ShieldCheck, TrendingUp, Target } from "lucide-react";

const features = [
  {
    title: "Secure Karo",
    description: "Build an emergency fund & get adequate insurance to protect your family from life's unexpected events.",
    icon: ShieldCheck,
    color: "text-[#1E88FF]",
    bg: "bg-[#1E88FF]/10",
    border: "hover:border-[#1E88FF]/30 hover:shadow-[0_8px_30px_rgba(30,136,255,0.08)]",
  },
  {
    title: "Grow Karo",
    description: "Beat inflation and compound your savings with highly effective index and flexi-cap mutual funds.",
    icon: TrendingUp,
    color: "text-[#22C55E]",
    bg: "bg-[#22C55E]/10",
    border: "hover:border-[#22C55E]/30 hover:shadow-[0_8px_30px_rgba(34,197,94,0.08)]",
  },
  {
    title: "Plan Karo",
    description: "Define major life goals like buying a house, wedding, or child education and map correct SIPs.",
    icon: Target,
    color: "text-[#FF9F1A]",
    bg: "bg-[#FF9F1A]/10",
    border: "hover:border-[#FF9F1A]/30 hover:shadow-[0_8px_30px_rgba(255,159,26,0.08)]",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 bg-[#FFFFFF] text-[#121212]">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4 text-[#121212]"
          >
            Bhai ka Plan. <span className="text-[#FF9F1A] italic">Solid Returns.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#555555] text-lg font-medium"
          >
            A complete simplified framework to take you from financial confusion to financial freedom.
          </motion.p>
        </div>

        {/* 3 Core Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15, duration: 0.5 }}
            >
              <Card className={`h-full hover:-translate-y-2 transition-all duration-300 bg-[#FFFFFF] border border-[rgba(0,0,0,0.06)] shadow-sm rounded-3xl p-4 ${feature.border}`}>
                <CardHeader className="space-y-4">
                  <div className={`w-14 h-14 rounded-2xl ${feature.bg} flex items-center justify-center shrink-0`}>
                    <feature.icon className={`w-7 h-7 ${feature.color}`} />
                  </div>
                  <CardTitle className="text-2xl font-black text-[#121212]">{feature.title}</CardTitle>
                  <CardDescription className="text-sm md:text-base text-[#555555] leading-relaxed font-semibold">
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
