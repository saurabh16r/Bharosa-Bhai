"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { PhoneCall, Calendar, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";

export default function DiscoveryCalls() {
  const [calls, setCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCalls();
  }, []);

  const fetchCalls = async () => {
    try {
      const { data, error } = await supabase
        .from('discovery_calls')
        .select(`
          id,
          scheduled_at,
          status,
          notes,
          users ( id, full_name, email, phone )
        `)
        .order('scheduled_at', { ascending: true });
        
      if (error) throw error;
      setCalls(data || []);
    } catch (err) {
      console.error("Error fetching calls:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    setCalls(calls.map(c => c.id === id ? { ...c, status: newStatus } : c));
    await supabase.from('discovery_calls').update({ status: newStatus }).eq('id', id);
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Discovery Calls</h1>
        <p className="text-[#B5B5B5]">Manage advisor consultation pipeline.</p>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {loading ? (
          <div className="p-12 text-center text-[#B5B5B5]">Loading calls schedule...</div>
        ) : calls.length === 0 ? (
          <Card className="p-12 text-center bg-[#171717] border border-[rgba(255,255,255,0.08)]">
            <PhoneCall className="mx-auto text-[#737373] mb-4" size={32} />
            <p className="text-[#B5B5B5] font-medium">No upcoming discovery calls scheduled.</p>
          </Card>
        ) : (
          calls.map((call) => (
            <Card key={call.id} className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)] flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
               <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1E88FF]/10 flex items-center justify-center text-[#1E88FF] shrink-0">
                     <Calendar size={20} />
                  </div>
                  <div>
                     <Link href={`/admin/users/${call.users?.id}`} className="text-lg font-bold text-white hover:text-[#1E88FF] transition-colors">
                        {call.users?.full_name}
                     </Link>
                     <div className="flex flex-wrap gap-4 text-sm text-[#B5B5B5] mt-1">
                        <span className="flex items-center gap-1"><PhoneCall size={14} /> {call.users?.phone || 'No Phone'}</span>
                        <span className="flex items-center gap-1"><Clock size={14} /> {new Date(call.scheduled_at).toLocaleString()}</span>
                     </div>
                     {call.notes && <p className="text-sm text-[#737373] mt-2 italic">"{call.notes}"</p>}
                  </div>
               </div>
               
               <div className="flex gap-2">
                 {call.status === 'Pending' ? (
                   <>
                     <button onClick={() => updateStatus(call.id, 'Completed')} className="flex items-center gap-2 bg-green-500/10 text-green-500 hover:bg-green-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        <CheckCircle size={16} /> Mark Completed
                     </button>
                     <button onClick={() => updateStatus(call.id, 'Cancelled')} className="flex items-center gap-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        <XCircle size={16} /> Cancel
                     </button>
                   </>
                 ) : (
                   <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase ${call.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                     {call.status}
                   </span>
                 )}
               </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
