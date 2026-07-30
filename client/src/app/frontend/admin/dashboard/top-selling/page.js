"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function TopSellingPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTop() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/top-selling-medicines");
        const data = await res.json();
        if (data.success) setMedicines(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTop();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        <Link href="/frontend/admin/dashboard" className="text-xs text-slate-400 hover:text-white">
          ← Back to Admin Dashboard
        </Link>
        <h1 className="text-2xl font-black text-white">Top-Selling Medicines Analysis</h1>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-400">Loading top sales...</div>
          ) : (
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="border-b border-slate-800 bg-slate-950/50 text-slate-400 uppercase text-[10px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Rank</th>
                  <th className="py-3.5 px-4">Medicine Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Units Sold</th>
                  <th className="py-3.5 px-4 text-right">Total Revenue Generated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {medicines.map((m, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40">
                    <td className="py-4 px-4 font-bold text-emerald-400">#{idx + 1}</td>
                    <td className="py-4 px-4 font-bold text-white">{m.name}</td>
                    <td className="py-4 px-4">{m.category}</td>
                    <td className="py-4 px-4 text-right font-mono text-white">{m.totalSold}</td>
                    <td className="py-4 px-4 text-right font-mono text-emerald-300 font-bold">
                      ₹{m.revenue.toLocaleString()}
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