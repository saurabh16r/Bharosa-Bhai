"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { Sparkles, ArrowRight, Check } from "lucide-react";

export function MeetBhaiSection() {
  const points = [
    "No product selling bias – advice is 100% independent and clean.",
    "Zero complex jargon – plain simple language you will easily understand.",
    "Goal-oriented recommendations tailored specifically to your family's safety.",
  ];

  return (
    <section id="about" className="py-24 bg-[#0E0E0E] relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-[20%] left-[-15%] w-[400px] h-[400px] bg-[#1E88FF]/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[20%] right-[-10%] w-[350px] h-[350px] bg-[#F7B500]/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Character Column */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-6 flex justify-center items-center relative"
          >
            {/* Soft backdrop golden glow matching mockup */}
            <div className="absolute w-[280px] h-[280px] sm:w-[380px] sm:h-[380px] bg-[#F7B500]/10 rounded-full blur-[80px] pointer-events-none" />
            
            <div className="relative w-full max-w-[340px] aspect-[4/5] drop-shadow-[0_25px_45px_rgba(0,0,0,0.6)]">
              <Image 
                src="/images/crossed_arms.png" 
                alt="Bharosa Bhai with arms crossed confidently" 
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Right Information Column */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-8"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 bg-[#F7B500]/10 border border-[#F7B500]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#F7B500] uppercase tracking-wider">
                <Sparkles size={14} />
                Meet Your Financial Friend
              </div>
              
              <h2 className="text-3xl md:text-5xl font-black font-heading tracking-tight text-white leading-tight">
                Meet <span className="text-[#1E88FF]">Bharosa Bhai</span>
              </h2>
              
              <p className="text-[#FF9F1A] text-lg font-bold font-sans tracking-wide">
                Tumhara apna personal financial dost.
              </p>
              
              <p className="text-[#B5B5B5] text-base md:text-lg leading-relaxed font-medium">
                Traditional advisors and banks try to sell you policies to make commissions. I don't sell any policies. My goal is only one: to tell you the 100% truth about your money in simple words.
              </p>
            </div>

            <ul className="space-y-4">
              {points.map((pt, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#1E88FF]/20 flex items-center justify-center text-[#1E88FF] shrink-0 mt-1">
                    <Check size={12} className="stroke-[3]" />
                  </div>
                  <span className="text-[#D1D5DB] text-sm md:text-base font-semibold leading-relaxed">
                    {pt}
                  </span>
                </li>
              ))}
            </ul>

            <div className="pt-2">
              <Link href="/test">
                <Button className="h-14 px-8 text-base font-bold bg-[#1E88FF] hover:bg-[#1E88FF]/95 text-white rounded-full flex items-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_8px_25px_rgba(30,136,255,0.2)] border-none">
                  Let's Start the Test
                  <ArrowRight size={18} />
                </Button>
              </Link>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
