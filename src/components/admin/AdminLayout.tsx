"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase, isDemoMode } from "@/lib/supabase";
import { LayoutDashboard, Users, PhoneCall, BarChart3, Settings, LogOut, ShieldCheck } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const checkSession = async () => {
      // Check hardcoded bypass
      if (typeof window !== "undefined" && localStorage.getItem("admin_auth") === "true") {
        setUser({ email: "bharosabhaii@gmail.com" });
        setLoading(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session && pathname !== "/admin/login") {
        router.push("/admin/login");
      } else {
        setUser(session?.user || null);
      }
      setLoading(false);
    };

    checkSession();

    if (!isDemoMode) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        // If logged in via hardcoded admin credentials, do not redirect
        if (typeof window !== "undefined" && localStorage.getItem("admin_auth") === "true") {
          setUser({ email: "bharosabhaii@gmail.com" });
          return;
        }

        if (!session && pathname !== "/admin/login") {
          router.push("/admin/login");
        } else {
          setUser(session?.user || null);
        }
      });

      return () => {
        authListener.subscription.unsubscribe();
      };
    }
  }, [pathname, router]);

  const handleLogout = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("admin_auth");
    }
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (loading) {
    return <div className="min-h-screen bg-[#0E0E0E] flex items-center justify-center text-white">Loading CRM...</div>;
  }

  // If on login page, don't show sidebar
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: <LayoutDashboard size={20} /> },
    { label: "Users & Leads", href: "/admin/users", icon: <Users size={20} /> },
    { label: "Discovery Calls", href: "/admin/calls", icon: <PhoneCall size={20} /> },
    { label: "Analytics", href: "/admin/analytics", icon: <BarChart3 size={20} /> },
    { label: "Settings", href: "/admin/settings", icon: <Settings size={20} /> },
  ];

  return (
    <div className="flex h-screen bg-[#0E0E0E] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-[#121212] border-r border-[rgba(255,255,255,0.08)] flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-[rgba(255,255,255,0.08)]">
          <ShieldCheck className="text-[#F7B500] mr-2" size={24} />
          <span className="text-white font-bold text-lg tracking-wide">Admin CRM</span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 px-4">
           <div className="space-y-1">
             {navItems.map((item) => {
               const isActive = pathname === item.href;
               return (
                 <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#1E88FF]/10 text-[#1E88FF]' : 'text-[#B5B5B5] hover:bg-white/[0.04] hover:text-white'}`}>
                   {item.icon}
                   {item.label}
                 </Link>
               );
             })}
           </div>
        </div>

        <div className="p-4 border-t border-[rgba(255,255,255,0.08)]">
          <div className="mb-4 px-2">
            <p className="text-xs text-[#B5B5B5] truncate">Logged in as:</p>
            <p className="text-sm text-white font-medium truncate">{user?.email || "Admin User"}</p>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors">
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-[#0E0E0E]">
        <div className="p-8">
           {children}
        </div>
      </main>
    </div>
  );
}
