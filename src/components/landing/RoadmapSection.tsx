"use client";

import * as React from "react";
import { motion } from "framer-motion";

const steps = [
  { month: "Month 1", title: "Emergency Fund", desc: "Build 6 months of living expenses in a liquid fund." },
  { month: "Month 2", title: "Health Insurance", desc: "Secure a comprehensive cover for your entire family." },
  { month: "Month 3", title: "Term Insurance", desc: "Protect your dependents with a pure term life cover." },
  { month: "Month 4", title: "Mutual Fund SIP", desc: "Start index funds or flexi-cap funds SIP for long term wealth." },
  { month: "Month 5", title: "Tax Planning", desc: "Optimize tax savings under 80C, 80D, and NPS." },
  { month: "Month 6", title: "Goal Planning", desc: "Align investments with specific life goals." },
];

export function RoadmapSection() {
  return (
    <section id="roadmap" className="py-24 bg-[#0E0E0E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
            6-Month <span className="text-[#1E88FF]">Financial Roadmap</span>
          </h2>
          <p className="text-[#B5B5B5] text-lg">
            Step-by-step guide to achieving complete financial security.
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical Line */}
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-[rgba(255,255,255,0.08)] -translate-x-1/2" />
          
          <div className="space-y-12">
            {steps.map((step, index) => (
              <motion.div 
                key={step.month}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`flex flex-col md:flex-row items-start md:items-center relative ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-[#F7B500] -translate-x-1/2 mt-6 md:mt-0 glow-primary z-10" />
                
                {/* Content Box */}
                <div className={`w-full md:w-1/2 pl-12 md:pl-0 ${index % 2 === 0 ? "md:pl-12" : "md:pr-12 text-left md:text-right"}`}>
                  <div className="glass p-6 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                    <span className="text-[#1E88FF] font-semibold text-sm mb-2 block">{step.month}</span>
                    <h3 className="text-xl font-bold text-white mb-2">{step.title}</h3>
                    <p className="text-[#B5B5B5] text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
