"use client";

import * as React from "react";
import { Check, X } from "lucide-react";

export function ComparisonSection() {
  return (
    <section className="py-24 bg-[#0A0A0A]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
            Why <span className="text-[#F7B500]">Bharosa Bhai?</span>
          </h2>
          <p className="text-[#B5B5B5] text-lg">
            See how we stack up against traditional financial advisors and bank agents.
          </p>
        </div>

        <div className="max-w-4xl mx-auto overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="p-4 border-b border-[rgba(255,255,255,0.08)] text-[#B5B5B5] font-medium w-1/3">Features</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.08)] text-white font-semibold text-center w-1/4">Bank Agents</th>
                <th className="p-4 border-b border-[rgba(255,255,255,0.08)] text-white font-semibold text-center w-1/4">Traditional Advisor</th>
                <th className="p-4 border-b border-[#F7B500] text-[#F7B500] font-bold text-center w-1/4 text-lg bg-[#F7B500]/5 rounded-t-xl">Bharosa Bhai</th>
              </tr>
            </thead>
            <tbody>
              {[
                { feature: "Bias-Free Advice", bank: false, advisor: false, bb: true },
                { feature: "No Hidden Commissions", bank: false, advisor: false, bb: true },
                { feature: "Easy to Understand", bank: false, advisor: true, bb: true },
                { feature: "100% Digital & Instant", bank: false, advisor: false, bb: true },
                { feature: "Personalized Roadmap", bank: false, advisor: true, bb: true },
              ].map((row, index) => (
                <tr key={index} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4 border-b border-[rgba(255,255,255,0.08)] text-white">{row.feature}</td>
                  <td className="p-4 border-b border-[rgba(255,255,255,0.08)] text-center">
                    {row.bank ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="p-4 border-b border-[rgba(255,255,255,0.08)] text-center">
                    {row.advisor ? <Check className="w-5 h-5 text-green-500 mx-auto" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                  <td className="p-4 border-b border-[rgba(255,255,255,0.08)] text-center bg-[#F7B500]/5 relative">
                    {row.bb ? <Check className="w-6 h-6 text-[#F7B500] mx-auto drop-shadow-[0_0_8px_rgba(247,181,0,0.5)]" /> : <X className="w-5 h-5 text-red-500 mx-auto" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
