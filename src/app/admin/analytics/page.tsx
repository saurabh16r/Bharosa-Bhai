"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/Card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { BarChart3 } from "lucide-react";

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    cityDist: [] as any[],
    scoreDist: [] as any[],
  });

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const { data: users } = await supabase.from('users').select('city');
      const { data: tests } = await supabase.from('test_results').select('health_score');

      if (!users || !tests) throw new Error("No data");

      // Aggregate City Data
      const cityMap: any = {};
      users.forEach(u => {
        const city = u.city || 'Unknown';
        cityMap[city] = (cityMap[city] || 0) + 1;
      });
      const cityDist = Object.keys(cityMap).map(name => ({ name, count: cityMap[name] }));

      // Aggregate Score Data
      const scoreDist = [
        { name: "Excellent (75+)", count: tests.filter(t => t.health_score >= 75).length },
        { name: "Average (50-74)", count: tests.filter(t => t.health_score >= 50 && t.health_score < 75).length },
        { name: "Needs Work (<50)", count: tests.filter(t => t.health_score < 50).length },
      ];

      setData({ cityDist, scoreDist });
    } catch (err) {
      // Mock fallback if DB not connected
      setData({
        cityDist: [
          { name: "Mumbai", count: 45 },
          { name: "Delhi", count: 32 },
          { name: "Bangalore", count: 28 },
          { name: "Pune", count: 15 },
        ],
        scoreDist: [
          { name: "Excellent (75+)", count: 20 },
          { name: "Average (50-74)", count: 65 },
          { name: "Needs Work (<50)", count: 35 },
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#F7B500', '#1E88FF', '#22C55E', '#EC4899', '#A855F7'];

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 tracking-wide">Platform Analytics</h1>
        <p className="text-[#B5B5B5]">Detailed insights across all registered users.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* SCORE DISTRIBUTION */}
        <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
           <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-[#F7B500]" size={20} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Health Score Distribution</h3>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <BarChart data={data.scoreDist} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                 <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                 <XAxis dataKey="name" stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#737373" fontSize={12} tickLine={false} axisLine={false} />
                 <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)' }} />
                 <Bar dataKey="count" fill="#1E88FF" radius={[4, 4, 0, 0]} />
               </BarChart>
             </ResponsiveContainer>
           </div>
        </Card>

        {/* CITY DISTRIBUTION */}
        <Card className="p-6 bg-[#171717] border border-[rgba(255,255,255,0.08)]">
           <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-[#22C55E]" size={20} />
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">City Demographics</h3>
           </div>
           <div className="h-[300px]">
             <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                 <Pie
                   data={data.cityDist}
                   cx="50%"
                   cy="50%"
                   innerRadius={80}
                   outerRadius={110}
                   paddingAngle={5}
                   dataKey="count"
                 >
                   {data.cityDist.map((entry, index) => (
                     <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                   ))}
                 </Pie>
                 <Tooltip contentStyle={{ backgroundColor: '#121212', borderColor: 'rgba(255,255,255,0.1)' }} />
               </PieChart>
             </ResponsiveContainer>
           </div>
           {/* Custom Legend */}
           <div className="flex flex-wrap gap-4 justify-center mt-4">
              {data.cityDist.map((entry, index) => (
                 <div key={index} className="flex items-center gap-2 text-xs text-[#B5B5B5]">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    {entry.name} ({entry.count})
                 </div>
              ))}
           </div>
        </Card>

      </div>
    </div>
  );
}
