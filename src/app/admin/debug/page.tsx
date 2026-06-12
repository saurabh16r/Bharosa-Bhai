"use client";

import React, { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Activity, RefreshCw, Database, Terminal, ShieldAlert, Cpu, Eye } from "lucide-react";

export default function AdminDebugPage() {
  const [loading, setLoading] = useState(true);
  const [dbConnected, setDbConnected] = useState(false);
  const [dbError, setDbError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState("Connecting...");
  const [lastInsertTimestamp, setLastInsertTimestamp] = useState<string>("None");
  
  const [records, setRecords] = useState({
    latestUser: null as any,
    latestAssessment: null as any,
    latestPDF: null as any,
    latestLead: null as any,
  });

  const fetchDebugData = async () => {
    setLoading(true);
    try {
      // 1. Connection check
      const { count: uCount, error: uErr } = await supabase
        .from("users")
        .select("*", { count: 'exact', head: true });

      if (uErr) {
        throw uErr;
      }
      
      setDbConnected(true);
      setDbError(null);

      // 2. Fetch records
      const { data: latestUser } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: latestAssessment } = await supabase
        .from("test_results")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: latestPDF } = await supabase
        .from("pdf_reports")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const { data: latestLead } = await supabase
        .from("leads")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      setRecords({
        latestUser,
        latestAssessment,
        latestPDF,
        latestLead,
      });

      if (latestUser?.created_at) {
        setLastInsertTimestamp(new Date(latestUser.created_at).toLocaleString());
      } else {
        setLastInsertTimestamp("No submissions found in DB");
      }

    } catch (err: any) {
      console.error("Debug page fetch error:", err);
      setDbConnected(false);
      setDbError(err?.message || String(err));
      setRecords({
        latestUser: null,
        latestAssessment: null,
        latestPDF: null,
        latestLead: null,
      });
      setLastInsertTimestamp("Error querying database");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugData();

    // Set up a test channel to verify realtime status
    const channel = supabase.channel("debug-status-channel");
    
    channel.subscribe((status) => {
      console.log("Realtime subscription state:", status);
      if (status === "SUBSCRIBED") {
        setRealtimeStatus("🟢 Active (Connected to live updates)");
      } else if (status === "CLOSED") {
        setRealtimeStatus("🔴 Inactive (Disconnected)");
      } else if (status === "CHANNEL_ERROR") {
        setRealtimeStatus("⚠️ Error (Check replication settings)");
      } else {
        setRealtimeStatus(`🟠 State: ${status}`);
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const renderJsonBlock = (title: string, data: any) => {
    return (
      <Card className="p-5 bg-[#171717] border border-[rgba(255,255,255,0.08)] flex flex-col h-full">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-xs uppercase font-bold tracking-wider text-[#B5B5B5] flex items-center gap-2">
            <Terminal size={14} className="text-[#1E88FF]" />
            {title}
          </h4>
          {data && (
            <span className="text-[10px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[#B5B5B5]">
              ID: {data.id?.substring(0, 8)}...
            </span>
          )}
        </div>
        <div className="flex-1 overflow-auto bg-[#0E0E0E] rounded-lg p-4 border border-white/5 font-mono text-xs max-h-[280px]">
          {data ? (
            <pre className="text-green-400 whitespace-pre-wrap">{JSON.stringify(data, null, 2)}</pre>
          ) : (
            <div className="h-full flex items-center justify-center text-[#737373] italic">
              No record found
            </div>
          )}
        </div>
      </Card>
    );
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide flex items-center gap-2">
            <Cpu className="text-[#F7B500]" size={28} />
            System Debug & Diagnostics
          </h1>
          <p className="text-[#B5B5B5]">Audit the submission pipeline, inspect latest tables, and trace real-time client traffic.</p>
        </div>
        
        <button
          onClick={fetchDebugData}
          disabled={loading}
          className="flex items-center gap-2 bg-[#F7B500] hover:bg-[#F7B500]/90 text-black px-5 py-2.5 rounded-lg font-bold transition-all disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          {loading ? "Fetching..." : "Force Refetch"}
        </button>
      </div>

      {/* System Health Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* DB Connection Status */}
        <Card className="p-5 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3 mb-2">
            <Database className="text-[#1E88FF]" size={20} />
            <span className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Database Status</span>
          </div>
          <h4 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
            {dbConnected ? (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                Connected
              </>
            ) : (
              <>
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                Disconnected
              </>
            )}
          </h4>
          {!dbConnected && dbError && (
            <p className="text-red-500 text-xs mt-2 border border-red-500/20 bg-red-500/5 p-2 rounded">
              Error: {dbError}
            </p>
          )}
        </Card>

        {/* Realtime channel Status */}
        <Card className="p-5 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="text-[#22C55E]" size={20} />
            <span className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Realtime Status</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-2">
            {realtimeStatus}
          </h4>
          <p className="text-[10px] text-[#737373] mt-2">Checks connection state of the client subscription socket.</p>
        </Card>

        {/* Last Insertion Timestamp */}
        <Card className="p-5 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert className="text-[#F7B500]" size={20} />
            <span className="text-xs text-[#B5B5B5] uppercase font-bold tracking-wider">Last Insert Timestamp</span>
          </div>
          <h4 className="text-sm font-bold text-white mt-2">
            {lastInsertTimestamp}
          </h4>
          {records.latestUser?.created_at && (
            <p className="text-[10px] text-[#737373] mt-2">Latest submission: {records.latestUser.email}</p>
          )}
        </Card>
      </div>

      {/* JSON Record Inspector Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderJsonBlock("Latest User Record", records.latestUser)}
        {renderJsonBlock("Latest Assessment Record (test_results)", records.latestAssessment)}
        {renderJsonBlock("Latest PDF Record (pdf_reports)", records.latestPDF)}
        {renderJsonBlock("Latest Lead Record (leads)", records.latestLead)}
      </div>
    </div>
  );
}
