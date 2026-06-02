"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ShieldCheck, MessageCircle, ArrowRight } from "lucide-react";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 bg-[#0E0E0E] overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#1E88FF]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#F7B500]/10 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 max-w-2xl text-left"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-black font-heading leading-tight mb-6 text-white tracking-tight">
              Are you financially safe... <br />
              <span className="text-[#F7B500] font-sans font-extrabold tracking-wide uppercase block mt-2 text-3xl sm:text-4xl md:text-5xl">
                ya risk mein ho?
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-[#B5B5B5] mb-8 leading-relaxed max-w-lg font-medium">
              Take our quick, independent 2-minute financial check to discover how secure your future is and get your personalized roadmap.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <Link href="/test">
                <Button className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-[#1E88FF] hover:bg-[#1E88FF]/90 text-white rounded-full flex items-center justify-center gap-2 hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 shadow-[0_8px_30px_rgb(30,136,255,0.25)] border-none">
                  Start Free Test
                  <ArrowRight size={18} />
                </Button>
              </Link>
              <Link href="#chat">
                <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-base font-bold text-white border border-white/[0.08] hover:border-white/20 hover:bg-white/[0.02] bg-[#121212]/50 rounded-full flex items-center justify-center gap-2 transition-colors">
                  <MessageCircle size={18} />
                  Talk to Bhai
                </Button>
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs font-semibold text-[#B5B5B5] uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#F7B500]/20 flex items-center justify-center text-[#F7B500]">
                  <ShieldCheck size={14} />
                </div>
                <span>Tested by 5000+ users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#F7B500]/20 flex items-center justify-center text-[#F7B500]">
                  <ShieldCheck size={14} />
                </div>
                <span>100% Free & Unbiased</span>
              </div>
            </div>
          </motion.div>

          {/* Right Mascot Illustration */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-5 relative flex justify-center items-center"
          >
            {/* Ambient golden aura behind character */}
            <div className="absolute w-[350px] h-[350px] sm:w-[450px] sm:h-[450px] bg-gradient-to-tr from-[#F7B500]/20 to-[#1E88FF]/10 rounded-full blur-[80px] -z-10 pointer-events-none" />
            
            <div className="relative w-full max-w-[400px] aspect-[4/5] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
              <Image 
                src="/images/pointing.png" 
                alt="Bharosa Bhai welcoming you" 
                fill
                priority
                className="object-contain transform hover:scale-[1.02] transition-transform duration-500"
              />
              
              {/* Floating element 1 */}
              <motion.div 
                animate={{ y: [0, -8, 0] }} 
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-1/4 -left-8 bg-[#171717]/85 backdrop-blur border border-white/[0.08] px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]"
              >
                <span className="text-green-500 font-extrabold">↑</span> High Returns
              </motion.div>
              
              {/* Floating element 2 */}
              <motion.div 
                animate={{ y: [0, 8, 0] }} 
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-1/4 -right-6 bg-[#171717]/85 backdrop-blur border border-white/[0.08] px-4 py-2.5 rounded-2xl text-xs font-bold text-white flex items-center gap-2 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.3)]"
              >
                <span className="text-[#F7B500] font-extrabold">₹</span> Tax Saved
              </motion.div>
            </div>
          </motion.div>
          
        </div>
      </div>
    </section>
  );
}
