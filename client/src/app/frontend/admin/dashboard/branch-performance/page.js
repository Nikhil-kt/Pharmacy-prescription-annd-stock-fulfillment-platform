"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";

export default function BranchPerformance() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/branch-performance`)
      .then((r) => r.json())
      .then((d) => setData(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = data.reduce((s, b) => s + Number(b.totalRevenue || 0), 0);
  const totalOrders = data.reduce((s, b) => s + Number(b.totalOrders || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Branch Performance</h1>
          <p className="text-xs text-gray-500 mt-1">Revenue and order metrics per branch.</p>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-5">
            <p className="text-xs text-gray-500">Total Branches</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{loading ? "…" : data.length}</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <p className="text-xs text-gray-500">Total Revenue</p>
            <p className="text-2xl font-black text-[#0E7C50] mt-1">₹{loading ? "…" : totalRevenue.toFixed(0)}</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{loading ? "…" : totalOrders}</p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : data.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">No branch data available.</div>
        ) : (
          <div className="grid gap-4">
            {data.sort((a, b) => b.totalRevenue - a.totalRevenue).map((branch, i) => {
              const pct = totalRevenue > 0 ? (branch.totalRevenue / totalRevenue) * 100 : 0;
              return (
                <div key={branch.branchId || i} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{branch.branchName}</h3>
                      <p className="text-xs text-gray-500">{branch.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-[#0E7C50] text-lg">₹{Number(branch.totalRevenue || 0).toFixed(0)}</p>
                      <p className="text-xs text-gray-500">{branch.totalOrders} orders</p>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#0E7C50] rounded-full transition-all" style={{ width: `${pct}%` }} />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">{pct.toFixed(1)}% of total revenue</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}