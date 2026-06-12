"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Users, FileText, Activity, TrendingUp, PhoneCall, IndianRupee } from "lucide-react";

export default function AdminDashboardOverview() {
  const [stats, setStats] = useState({
    totalLeads: 0,
    testsCompleted: 0,
    avgScore: 0,
    callsBooked: 0,
    reportsGenerated: 0
  });

  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();

    // Setup Realtime Subscription for instantaneous UI syncs
    const channel = supabase.channel('schema-db-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'users' },
        (payload) => {
           console.log('Realtime Update: users', payload);
           fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'test_results' },
        (payload) => {
           console.log('Realtime Update: test_results', payload);
           fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
           console.log('Realtime Update: leads', payload);
           fetchDashboardData();
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'discovery_calls' },
        (payload) => {
           console.log('Realtime Update: discovery_calls', payload);
           fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Step 2: Database health check query (SELECT COUNT(*) FROM users)
      const { count: usersCount, error: userError } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });
      
      if (userError) {
        throw userError;
      }
      
      setDbConnected(true);
      setDbError(null);

      // Fetch other stats and recent items
      const { data: users, error: fetchUsersError } = await supabase
        .from('users')
        .select('id, full_name, email, city, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      if (fetchUsersError) throw fetchUsersError;

      const { count: testsCount, error: testsError } = await supabase
        .from('test_results')
        .select('*', { count: 'exact', head: true });

      if (testsError) throw testsError;

      const { count: callsCount, error: callsError } = await supabase
        .from('discovery_calls')
        .select('*', { count: 'exact', head: true });

      if (callsError) throw callsError;

      const { data: scores, error: scoresError } = await supabase
        .from('test_results')
        .select('health_score');

      if (scoresError) throw scoresError;

      let avg = 0;
      if (scores && scores.length > 0) {
        const sum = scores.reduce((acc, curr) => acc + (curr.health_score || 0), 0);
        avg = Math.round(sum / scores.length);
      }

      setStats({
        totalLeads: usersCount || 0,
        testsCompleted: testsCount || 0,
        avgScore: avg,
        callsBooked: callsCount || 0,
        reportsGenerated: testsCount || 0 // Assuming 1 PDF per test
      });

      setRecentLeads(users || []);

    } catch (err: any) {
      console.error("Supabase connection health check failed:", err);
      setDbConnected(false);
      
      // Step 10: Parse and display actual error message
      let rawError = "Unknown connection error";
      if (err) {
        rawError = err.message || err.details || (typeof err === "string" ? err : JSON.stringify(err));
      }

      // Map to descriptive debugging messages
      let mappedError = rawError;
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
        mappedError = "Missing NEXT_PUBLIC_SUPABASE_URL";
      } else if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        mappedError = "Missing NEXT_PUBLIC_SUPABASE_ANON_KEY";
      } else if (rawError.includes("Could not find the table") || rawError.includes("relation \"users\" does not exist")) {
        mappedError = "Users table not found";
      } else if (rawError.includes("Invalid API key") || rawError.includes("invalid JWT") || rawError.includes("JWT") || rawError.includes("Invalid token")) {
        mappedError = "Supabase authentication failed / Invalid API Key";
      } else if (rawError.includes("permission denied") || rawError.includes("policy") || rawError.includes("Row Level Security")) {
        mappedError = "RLS policy blocking access";
      } else if (rawError.includes("fetch failed") || rawError.includes("ENOTFOUND") || rawError.includes("Network Error")) {
        mappedError = "Network Error (Cannot connect to Supabase)";
      }

      setDbError(mappedError);
      
      setStats({
        totalLeads: 0,
        testsCompleted: 0,
        avgScore: 0,
        callsBooked: 0,
        reportsGenerated: 0
      });
      setRecentLeads([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Platform Overview</h1>
          <p className="text-[#B5B5B5]">Real-time performance metrics and CRM insights.</p>
        </div>
        {!loading && !dbConnected && (
          <div className="bg-red-500/10 border border-red-500/20 px-4 py-2 rounded text-red-500 text-sm font-bold flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              🔴 Database Disconnected
            </div>
            <span className="text-xs font-semibold text-red-400/80">{dbError || "Unknown connection error"}</span>
          </div>
        )}
        {!loading && dbConnected && (
          <div className="bg-green-500/10 border border-green-500/20 px-4 py-2 rounded text-green-500 text-sm font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            🟢 Database Connected
          </div>
        )}
      </div>

      {/* KPI Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#B5B5B5] text-xs uppercase font-bold tracking-wider mb-1">Total Leads</p>
              <h3 className="text-4xl font-bold text-white">{loading ? "-" : stats.totalLeads}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#1E88FF]/10 flex items-center justify-center text-[#1E88FF]">
              <Users size={24} />
            </div>
          </div>
          <div className="text-sm text-green-500 flex items-center gap-1 font-medium">
            <TrendingUp size={14} /> +0% this month
          </div>
        </Card>

        <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#B5B5B5] text-xs uppercase font-bold tracking-wider mb-1">Tests Completed</p>
              <h3 className="text-4xl font-bold text-white">{loading ? "-" : stats.testsCompleted}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#F7B500]/10 flex items-center justify-center text-[#F7B500]">
              <FileText size={24} />
            </div>
          </div>
          <div className="text-sm text-green-500 flex items-center gap-1 font-medium">
            <TrendingUp size={14} /> +0% this month
          </div>
        </Card>

        <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#B5B5B5] text-xs uppercase font-bold tracking-wider mb-1">Average Health Score</p>
              <h3 className="text-4xl font-bold text-[#22C55E]">{loading ? "-" : stats.avgScore}<span className="text-lg text-[#B5B5B5]">/100</span></h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#22C55E]/10 flex items-center justify-center text-[#22C55E]">
              <Activity size={24} />
            </div>
          </div>
          <div className="text-sm text-[#B5B5B5] flex items-center gap-1 font-medium">
            Platform-wide average
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-[#171717] to-[#1E88FF]/10 border border-[#1E88FF]/30">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[#1E88FF] text-xs uppercase font-bold tracking-wider mb-1">Discovery Calls</p>
              <h3 className="text-4xl font-bold text-white">{loading ? "-" : stats.callsBooked}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-[#1E88FF]/20 flex items-center justify-center text-[#1E88FF]">
              <PhoneCall size={24} />
            </div>
          </div>
          <div className="text-sm text-[#1E88FF] flex items-center gap-1 font-medium">
            Scheduled consultations
          </div>
        </Card>
      </div>

      {/* Revenue Opportunity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
         <Card className="col-span-1 lg:col-span-3 p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)] flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-4">
               <div className="w-14 h-14 rounded-full bg-[#F7B500]/20 flex items-center justify-center text-[#F7B500]">
                  <IndianRupee size={28} />
               </div>
               <div>
                  <h3 className="text-[#B5B5B5] text-xs uppercase font-bold tracking-wider mb-1">Estimated Pipeline Revenue</h3>
                  <p className="text-2xl font-bold text-white">₹{stats.totalLeads * 15000 /* Mock calc: assume 15k LTV */}</p>
               </div>
            </div>
            <div className="flex gap-8">
               <div>
                  <p className="text-[#B5B5B5] text-[10px] uppercase font-bold tracking-wider mb-1">Assumed Conversion</p>
                  <p className="text-lg font-bold text-white">5.0%</p>
               </div>
               <div>
                  <p className="text-[#B5B5B5] text-[10px] uppercase font-bold tracking-wider mb-1">Reports Sent</p>
                  <p className="text-lg font-bold text-white">{stats.reportsGenerated}</p>
               </div>
            </div>
         </Card>
      </div>

      {/* Recent Leads Table */}
      <Card className="overflow-hidden bg-[#171717] border border-[rgba(255,255,255,0.08)]">
        <div className="p-6 border-b border-[rgba(255,255,255,0.08)] flex justify-between items-center">
          <h3 className="text-lg font-semibold text-white tracking-wide">Recent Lead Pipeline</h3>
          <button className="text-sm font-bold text-[#1E88FF] hover:text-white transition-colors bg-[#1E88FF]/10 px-4 py-2 rounded-lg">Export CSV</button>
        </div>
        
        {loading ? (
           <div className="p-12 text-center text-[#B5B5B5]">Loading pipeline data...</div>
        ) : recentLeads.length === 0 ? (
           <div className="p-12 text-center">
             <Users className="mx-auto text-[#737373] mb-4" size={32} />
             <p className="text-[#B5B5B5] font-medium">No leads found in the database.</p>
             <p className="text-xs text-[#737373] mt-2">Users who complete the assessment will appear here.</p>
           </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#121212]">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Lead Name</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Email</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">City</th>
                  <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Date Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
                {recentLeads.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors cursor-pointer" onClick={() => window.location.href = `/admin/users/${row.id}`}>
                    <td className="p-4 text-white font-medium">{row.full_name}</td>
                    <td className="p-4 text-sm text-[#B5B5B5]">{row.email}</td>
                    <td className="p-4 text-[#B5B5B5] text-sm">{row.city || 'Unknown'}</td>
                    <td className="p-4 text-[#B5B5B5] text-sm">{new Date(row.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
