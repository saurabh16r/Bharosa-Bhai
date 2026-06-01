"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "SIP kya hota hai aur kaise shuru karein?",
    answer: "SIP (Systematic Investment Plan) is a way to invest a fixed amount regularly (e.g., monthly) in mutual funds. It helps you build wealth over time through compounding. You can start with as little as ₹500/month."
  },
  {
    question: "Mera paisa kaha invest hoga?",
    answer: "Based on your financial roadmap, your money will be invested across a mix of asset classes: Index Funds (for long-term growth), Debt Funds (for stability), and Liquid Funds (for emergency cash)."
  },
  {
    question: "Bharosa Bhai free kyu hai?",
    answer: "Our mission is to make financial literacy accessible to every Indian. Our basic tools, financial health test, and roadmaps are 100% free. We may introduce premium advisory services later for those who need 1-on-1 handholding."
  },
  {
    question: "Emergency fund kitna hona chahiye?",
    answer: "Ideally, your emergency fund should cover 6 months of your mandatory living expenses (rent, EMIs, groceries, insurance premiums). It should be kept in a highly liquid instrument like an FD or liquid mutual fund."
  },
  {
    question: "Tax bachane ke sabse acche tarike kya hain?",
    answer: "Under the old tax regime, Section 80C offers up to ₹1.5 Lakh deduction (ELSS, PPF, EPF). Section 80D covers health insurance premiums, and Section 80CCD(1B) offers an additional ₹50,000 via NPS."
  }
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = React.useState<number | null>(0);

  return (
    <section className="py-24 bg-[#0E0E0E]">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold font-heading mb-4 text-white">
            Common <span className="text-[#1E88FF]">Sawal Jawab</span>
          </h2>
          <p className="text-[#B5B5B5] text-lg">
            Aapke dimaag ke saare doubts clear karne ke liye.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`border border-[rgba(255,255,255,0.08)] rounded-2xl overflow-hidden transition-colors duration-300 ${openIndex === index ? 'bg-[#171717]' : 'bg-[#0A0A0A] hover:bg-[#121212]'}`}
            >
              <button
                className="w-full flex items-center justify-between p-6 text-left"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-semibold text-white pr-8">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className={`w-6 h-6 ${openIndex === index ? 'text-[#F7B500]' : 'text-[#B5B5B5]'}`} />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="p-6 pt-0 text-[#B5B5B5] leading-relaxed border-t border-[rgba(255,255,255,0.04)] mt-2">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
