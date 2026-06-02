"use client";

import * as React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { HelpCircle, ChevronRight } from "lucide-react";

export function ConfusedSection() {
  const painPoints = [
    {
      question: "Paisa aa raha hai, par ja kahan raha hai?",
      description: "Understand your cash flows, savings rate, and where your leakages are.",
      color: "bg-[#FFEDED] text-[#FF4D4D]"
    },
    {
      question: "Mutual funds sahi hain, par kaunse wale?",
      description: "Cut through the noise and get direct recommendation matching your exact goals.",
      color: "bg-[#FFF4E5] text-[#FF9F1A]"
    },
    {
      question: "Tax bachana hai, but kaise?",
      description: "Explore legal deductions under NPS, 80C, 80D, and build wealth simultaneously.",
      color: "bg-[#E6F9F0] text-[#22C55E]"
    }
  ];

  return (
    <section className="py-24 bg-[#FFFFFF] text-[#121212] overflow-hidden">
      <div className="container mx-auto px-4 md:px-6">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-black font-heading tracking-tight mb-4 text-[#121212]"
          >
            Sach batao... thoda <span className="text-[#FF9F1A] italic">confused</span> ho na?
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-[#555555] text-lg font-medium"
          >
            Don't worry, finance ki baatein hum sabko thodi uljhi hui lagti hain. Let's make it simple.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center max-w-6xl mx-auto">
          
          {/* Left Character Column */}
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 flex justify-center items-center"
          >
            <div className="relative w-full max-w-[320px] aspect-[4/5] drop-shadow-[0_15px_30px_rgba(0,0,0,0.1)]">
              <Image 
                src="/images/confused.png" 
                alt="Bharosa Bhai looking confused scratching head" 
                fill
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Right Pain Points Column */}
          <div className="lg:col-span-7 space-y-6">
            {painPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                className="flex items-start gap-4 p-6 rounded-2xl bg-[#F8F9FA] hover:bg-[#F3F4F6] border border-[rgba(0,0,0,0.04)] shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer"
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${point.color} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <HelpCircle size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold text-[#121212] mb-1.5 flex items-center justify-between">
                    {point.question}
                    <ChevronRight size={18} className="text-[#B5B5B5] group-hover:translate-x-1 transition-transform" />
                  </h3>
                  <p className="text-sm md:text-base text-[#555555] leading-relaxed font-medium">
                    {point.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

        </div>

      </div>
    </section>
  );
}
