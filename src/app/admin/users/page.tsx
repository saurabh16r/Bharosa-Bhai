"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { Search, Filter, Download, UserPlus } from "lucide-react";

export default function UsersCRM() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch users and join with test_results and leads (assuming 1-to-1 for simplicity in overview)
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          full_name,
          email,
          phone,
          city,
          created_at,
          test_results ( health_score ),
          leads ( status )
        `)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching CRM users:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">User & Lead Management</h1>
          <p className="text-[#B5B5B5]">Manage all registered test takers and track their CRM status.</p>
        </div>
        <div className="flex gap-4">
          <button className="flex items-center gap-2 bg-[#171717] border border-[rgba(255,255,255,0.08)] text-white px-4 py-2 rounded-lg hover:bg-white/[0.04] transition-colors">
            <Download size={16} /> Export CSV
          </button>
          <button className="flex items-center gap-2 bg-[#F7B500] text-black font-bold px-4 py-2 rounded-lg hover:bg-[#F7B500]/90 transition-colors">
            <UserPlus size={16} /> Add Lead
          </button>
        </div>
      </div>

      <Card className="bg-[#171717] border border-[rgba(255,255,255,0.08)] mb-6">
        <div className="p-4 flex flex-col md:flex-row gap-4 justify-between border-b border-[rgba(255,255,255,0.08)]">
          <div className="relative w-full md:w-96">
             <Search className="absolute left-3 top-3 text-[#737373]" size={18} />
             <input 
               type="text"
               placeholder="Search by name or email..."
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full bg-[#121212] border border-[rgba(255,255,255,0.1)] text-white pl-10 pr-4 py-2.5 rounded-lg outline-none focus:border-[#1E88FF] text-sm"
             />
          </div>
          <div className="flex gap-4">
             <button className="flex items-center gap-2 bg-[#121212] border border-[rgba(255,255,255,0.1)] text-[#B5B5B5] px-4 py-2.5 rounded-lg text-sm hover:text-white transition-colors">
               <Filter size={16} /> Status: All
             </button>
             <button className="flex items-center gap-2 bg-[#121212] border border-[rgba(255,255,255,0.1)] text-[#B5B5B5] px-4 py-2.5 rounded-lg text-sm hover:text-white transition-colors">
               <Filter size={16} /> Score: All
             </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left">
            <thead className="bg-[#121212]">
              <tr>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Lead Name</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Contact</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">City</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Fin. Score</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">CRM Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#B5B5B5]">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.05)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[#B5B5B5]">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center">
                    <p className="text-[#B5B5B5] font-medium">No users found.</p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const score = user.test_results?.[0]?.health_score || 0;
                  const status = user.leads?.[0]?.status || 'New Lead';
                  
                  return (
                    <tr key={user.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="p-4">
                        <Link href={`/admin/users/${user.id}`} className="text-white font-medium hover:text-[#1E88FF] transition-colors">
                          {user.full_name}
                        </Link>
                      </td>
                      <td className="p-4">
                        <div className="text-sm text-white">{user.email}</div>
                        <div className="text-xs text-[#737373]">{user.phone || 'N/A'}</div>
                      </td>
                      <td className="p-4 text-sm text-[#B5B5B5]">{user.city || 'N/A'}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                          score >= 75 ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                          score >= 50 ? 'bg-[#F7B500]/10 text-[#F7B500] border border-[#F7B500]/20' : 
                          score > 0 ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-gray-500/10 text-gray-500 border border-gray-500/20'
                        }`}>
                          {score > 0 ? `${score}/100` : 'No Test'}
                        </span>
                      </td>
                      <td className="p-4">
                         <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide ${
                           status === 'Converted' ? 'bg-green-500/10 text-green-500' :
                           status === 'Contacted' ? 'bg-[#1E88FF]/10 text-[#1E88FF]' :
                           'bg-white/5 text-white'
                         }`}>
                           {status}
                         </span>
                      </td>
                      <td className="p-4 text-sm text-[#B5B5B5]">{new Date(user.created_at).toLocaleDateString()}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
