"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLowStock() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/low-stock-report");
        const data = await res.json();
        if (data.success) setLowStockItems(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLowStock();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/frontend/admin/dashboard" className="text-xs text-slate-400 hover:text-white">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-2xl font-black text-white">Branch Low Stock Alert Report</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading stock audit...</div>
          ) : lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-xs text-emerald-400">All branch stock levels are healthy.</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Medicine</th>
                  <th className="py-3.5 px-4">Branch Location</th>
                  <th className="py-3.5 px-4 text-center">Remaining Quantity</th>
                  <th className="py-3.5 px-4 text-center">Threshold Level</th>
                  <th className="py-3.5 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {lowStockItems.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-bold text-white">{item.medicines?.name}</td>
                    <td className="py-4 px-4">{item.branches?.name}</td>
                    <td className="py-4 px-4 text-center font-mono font-bold text-rose-400">{item.quantity}</td>
                    <td className="py-4 px-4 text-center font-mono text-slate-400">{item.low_stock_threshold}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="px-2.5 py-1 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px] font-bold">
                        CRITICAL
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}