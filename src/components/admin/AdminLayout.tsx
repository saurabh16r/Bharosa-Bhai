"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase, isDemoMode } from "@/lib/supabase";
import { LayoutDashboard, Users, PhoneCall, BarChart3, Settings, LogOut, ShieldCheck, X } from "lucide-react";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar drawer automatically on navigation
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

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

  const SidebarContent = () => (
    <>
      <div className="h-16 flex items-center justify-between px-6 border-b border-[rgba(255,255,255,0.08)]">
        <div className="flex items-center">
          <ShieldCheck className="text-[#F7B500] mr-2" size={24} />
          <span className="text-white font-bold text-lg tracking-wide">Admin CRM</span>
        </div>
        <button 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden text-[#B5B5B5] hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6 px-4">
         <div className="space-y-1">
           {navItems.map((item) => {
             const isActive = pathname === item.href;
             return (
               <Link 
                 key={item.href} 
                 href={item.href} 
                 className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${isActive ? 'bg-[#1E88FF]/10 text-[#1E88FF]' : 'text-[#B5B5B5] hover:bg-white/[0.04] hover:text-white'}`}
               >
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
    </>
  );

  return (
    <div className="flex h-screen bg-[#0E0E0E] overflow-hidden relative">
      
      {/* Mobile Backdrop Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Desktop Sidebar (Fixed Left) */}
      <aside className="hidden md:flex md:w-64 bg-[#121212] border-r border-[rgba(255,255,255,0.08)] flex-col shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar drawer (Overlay) */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#121212] border-r border-[rgba(255,255,255,0.08)] flex flex-col transform transition-transform duration-300 md:hidden ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <SidebarContent />
      </aside>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Mobile Sticky Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-[#121212] border-b border-[rgba(255,255,255,0.08)] md:hidden shrink-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-[#B5B5B5] hover:text-white p-1 mr-3 rounded hover:bg-white/[0.04]"
            >
              <LayoutDashboard size={22} />
            </button>
            <span className="text-white font-bold text-md tracking-wide">Admin CRM</span>
          </div>
          <div className="relative w-8 h-8 rounded-full overflow-hidden flex items-center justify-center border border-white/10 shrink-0">
            <img 
              src="/images/logo.png" 
              alt="Logo" 
              className="object-contain w-full h-full"
            />
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#0E0E0E]">
          <div className="p-4 sm:p-6 md:p-8">
             {children}
          </div>
        </main>
      </div>

    </div>
  );
}
