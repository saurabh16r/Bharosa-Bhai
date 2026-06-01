"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ShieldCheck, MessageCircle } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#F7B500]/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading leading-tight mb-6 text-white">
              Are you financially safe... <br />
              <span className="text-[#F7B500]">ya risk mein ho?</span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#B5B5B5] mb-8 leading-relaxed max-w-lg">
              2-minute financial test lo aur jaan lo tumhari financial life kitni strong hai.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/test">
                <Button size="lg" className="w-full sm:w-auto glow-secondary">Start Free Test</Button>
              </Link>
              <Link href="#chat">
                <Button variant="outline" size="lg" className="w-full sm:w-auto gap-2">
                  <MessageCircle size={20} />
                  Talk to Bhai
                </Button>
              </Link>
            </div>
            
            <div className="flex items-center gap-6 text-sm font-medium text-[#B5B5B5]">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#F7B500]" />
                <span>5000+ users tested</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#F7B500]" />
                <span>100% free</span>
              </div>
            </div>
          </motion.div>

          {/* Right Mascot Illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative hidden md:block"
          >
            {/* Mascot Placeholder */}
            <div className="w-full max-w-md mx-auto aspect-[3/4] bg-gradient-to-b from-[#1E88FF]/20 to-transparent rounded-3xl border border-[rgba(255,255,255,0.08)] flex items-center justify-center p-8 relative">
              <div className="text-center">
                <div className="w-32 h-32 bg-[#F7B500] rounded-full mx-auto mb-6 flex items-center justify-center text-6xl font-bold text-[#0E0E0E]">
                  B
                </div>
                <h3 className="text-2xl font-heading font-bold text-white mb-2">Bharosa Bhai</h3>
                <p className="text-[#B5B5B5]">Mascot Illustration Placeholder</p>
              </div>
              
              {/* Floating element 1 */}
              <motion.div 
                animate={{ y: [0, -10, 0] }} 
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                className="absolute top-10 -left-6 glass px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2"
              >
                <span className="text-[#1E88FF] text-lg">↑</span> +15% Returns
              </motion.div>
              
              {/* Floating element 2 */}
              <motion.div 
                animate={{ y: [0, 10, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-20 -right-8 glass px-4 py-2 rounded-xl text-sm font-medium text-white flex items-center gap-2"
              >
                <span className="text-[#F7B500]">₹</span> Tax Saved
              </motion.div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
