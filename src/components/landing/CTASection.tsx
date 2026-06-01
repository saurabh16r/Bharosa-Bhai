"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

export function CTASection() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-[#171717] to-[#0A0A0A] border border-[rgba(255,255,255,0.08)] rounded-[2.5rem] p-8 md:p-16 relative overflow-hidden text-center glow-primary">
          {/* Background Decorative */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F7B500]/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#1E88FF]/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />
          
          <div className="relative z-10 max-w-2xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-bold font-heading mb-6 text-white leading-tight">
              Abhi bhi <span className="text-[#F7B500]">soch rahe ho?</span>
            </h2>
            <p className="text-lg md:text-xl text-[#B5B5B5] mb-10 leading-relaxed">
              Financial freedom kal nahi, aaj start hoti hai. Take the first step towards a secure future in just 2 minutes.
            </p>
            
            <Link href="/test">
              <Button size="lg" className="h-16 px-10 text-lg font-bold gap-3 rounded-full w-full sm:w-auto hover:scale-105 transition-transform duration-300">
                Start Free Test
                <ArrowRight className="w-6 h-6" />
              </Button>
            </Link>
            
            <p className="mt-6 text-sm text-[#B5B5B5]">
              No credit card required. 100% Free & Secure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
