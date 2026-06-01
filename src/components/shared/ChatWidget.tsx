"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";

export function ChatWidget() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [messages, setMessages] = React.useState([
    { role: "assistant", content: "Namaste! Main hu Bharosa Bhai. Tumhara personal financial dost. Kaise help karu aaj?" }
  ]);
  const [input, setInput] = React.useState("");

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim()) return;
    
    setMessages([...messages, { role: "user", content: input }]);
    setInput("");
    
    // Placeholder response
    setTimeout(() => {
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: "I'm currently a placeholder AI, but soon I'll be connected to OpenAI to answer all your financial questions accurately!" 
      }]);
    }, 1000);
  };

  const suggestions = [
    "Mera paisa kaha ja raha hai?",
    "SIP kitni honi chahiye?",
    "Tax kaise bachaun?"
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[#1E88FF] text-white rounded-full flex items-center justify-center shadow-2xl glow-secondary z-50 transition-transform duration-300 ${isOpen ? 'scale-0' : 'scale-100 hover:scale-110'}`}
      >
        <MessageCircle size={28} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-6 right-6 w-[350px] max-w-[calc(100vw-2rem)] h-[500px] bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-[#0A0A0A] border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F7B500] flex items-center justify-center font-bold text-[#0E0E0E] text-xs">
                  B
                </div>
                <div>
                  <h4 className="text-white font-semibold text-sm">Bharosa Bhai</h4>
                  <span className="text-xs text-green-500">Online</span>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-[#B5B5B5] hover:text-white">
                <X size={20} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-[#1E88FF] text-white rounded-tr-sm' : 'bg-[#2A2A2A] text-white rounded-tl-sm'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>

            {/* Suggestions */}
            {messages.length === 1 && (
              <div className="px-4 pb-2 flex flex-wrap gap-2">
                {suggestions.map(s => (
                  <button 
                    key={s} 
                    onClick={() => setInput(s)}
                    className="text-xs border border-[#1E88FF]/30 bg-[#1E88FF]/10 text-[#1E88FF] px-3 py-1.5 rounded-full hover:bg-[#1E88FF]/20"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSend} className="p-4 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.08)] flex gap-2">
              <input 
                type="text" 
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Ask me anything..." 
                className="flex-1 bg-[#171717] border border-[rgba(255,255,255,0.08)] rounded-full px-4 text-sm text-white focus:outline-none focus:border-[#1E88FF]"
              />
              <button 
                type="submit" 
                disabled={!input.trim()}
                className="w-10 h-10 bg-[#F7B500] rounded-full flex items-center justify-center text-[#0E0E0E] disabled:opacity-50"
              >
                <Send size={18} className="ml-1" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
