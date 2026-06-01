"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Hardcoded Admin Credential Check
      if (email === "bharosabhaii@gmail.com" && password === "Bh@ros@26") {
        // Set a dummy cookie or local storage flag so the layout knows we are authenticated
        if (typeof window !== "undefined") {
          localStorage.setItem("admin_auth", "true");
        }
        router.push("/admin");
        return;
      }

      // Supabase Auth (Fallback if connected)
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.session) {
        router.push("/admin");
      }
    } catch (err: any) {
      setError(err.message || "Failed to sign in. Check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
           <ShieldCheck className="mx-auto text-[#F7B500] mb-4" size={48} />
           <h1 className="text-3xl font-bold text-white mb-2">Bharosa Admin</h1>
           <p className="text-[#B5B5B5]">Sign in to access the CRM platform</p>
        </div>

        <Card className="p-8 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <form onSubmit={handleLogin} className="space-y-6">
            
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded text-red-500 text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#B5B5B5] mb-2 uppercase tracking-wider">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 text-[#737373]" size={20} />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:border-[#F7B500] transition-colors"
                  placeholder="admin@bharosabhai.com"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-[#B5B5B5] uppercase tracking-wider">Password</label>
                <button type="button" className="text-xs text-[#1E88FF] hover:underline">Forgot?</button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-[#737373]" size={20} />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white pl-10 pr-4 py-3 rounded-lg outline-none focus:border-[#F7B500] transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#F7B500] hover:bg-[#F7B500]/90 text-black font-bold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In To Dashboard'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </form>

        </Card>
      </div>
    </div>
  );
}
