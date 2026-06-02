"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export function CTASection() {
  return (
    <section className="py-24 bg-[#0E0E0E] relative overflow-hidden">
      {/* Decorative radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#F7B500]/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#171717] to-[#0D0D0D] border border-white/[0.08] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-[0_15px_40px_rgba(0,0,0,0.4)] glow-primary">
          
          {/* Subtle grid lines background overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Left Column: Mascot pointing at the text */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="md:col-span-4 flex justify-center items-center"
            >
              <div className="relative w-full max-w-[220px] aspect-[4/5] drop-shadow-[0_15px_30px_rgba(0,0,0,0.5)]">
                <Image 
                  src="/images/pointing.png" 
                  alt="Bharosa Bhai guiding you" 
                  fill
                  className="object-contain transform scale-x-[-1]" // Flipping character so it points to the right towards the text
                />
              </div>
            </motion.div>

            {/* Right Column: CTA details */}
            <div className="md:col-span-8 space-y-6 text-center md:text-left">
              <h2 className="text-3xl md:text-5xl font-black font-heading text-white leading-tight">
                Abhi bhi <span className="text-[#F7B500] italic">soch rahe ho?</span>
              </h2>
              
              <p className="text-base md:text-lg text-[#B5B5B5] leading-relaxed font-semibold">
                Financial freedom kal nahi, aaj start hoti hai. Take our fast, independent, 100% free financial test to secure your family's future in just 2 minutes.
              </p>
              
              <div className="flex flex-col sm:flex-row items-center gap-4 pt-2 justify-center md:justify-start">
                <Link href="/test" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-14 px-8 text-base font-extrabold bg-[#F7B500] hover:bg-[#F7B500]/95 text-black rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_8px_25px_rgba(247,181,0,0.35)] border-none">
                    Start Free Test
                    <ArrowRight size={18} />
                  </Button>
                </Link>
                
                <div className="flex items-center gap-2 text-xs font-bold text-[#B5B5B5] uppercase tracking-wider">
                  <ShieldCheck size={16} className="text-[#F7B500]" />
                  <span>No credit card required</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
