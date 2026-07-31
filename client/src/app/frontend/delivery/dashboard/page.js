"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function DeliveryDashboard() {
  const [partner, setPartner] = useState(null);
  const [stats, setStats] = useState({ totalAssigned: 0, totalCurrent: 0, totalCompleted: 0 });
  const [recentDeliveries, setRecentDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = stored ? JSON.parse(stored) : null;
    if (user) setPartner(user);

    const partnerId = user?.id;
    async function fetchDashboard() {
      try {
        let statsObj = { totalAssigned: 0, totalCurrent: 0, totalCompleted: 0 };
        let allRecent = [];

        if (partnerId) {
          const res = await fetch(`${API}/delivery/partner/${partnerId}/dashboard`);
          const d = await res.json();
          if (d.success) {
            statsObj = d.statistics || statsObj;
            allRecent = [...(d.assignedOrders || []), ...(d.currentDeliveries || []), ...(d.completedDeliveries || [])];
          }
        }

        // Fallback for testing: if partner stats are 0, fetch global deliveries to populate the dashboard
        if (statsObj.totalAssigned === 0 && statsObj.totalCurrent === 0 && statsObj.totalCompleted === 0) {
          const resAll = await fetch(`${API}/delivery/`);
          const dAll = await resAll.json();
          if (dAll.deliveries) {
            const assigned = dAll.deliveries.filter(x => ["ASSIGNED", "PICKED_UP"].includes(x.status));
            const current = dAll.deliveries.filter(x => x.status === "OUT_FOR_DELIVERY");
            const completed = dAll.deliveries.filter(x => x.status === "DELIVERED");
            statsObj = {
              totalAssigned: assigned.length,
              totalCurrent: current.length,
              totalCompleted: completed.length
            };
            // Sort to show latest first
            allRecent = dAll.deliveries.sort((a, b) => new Date(b.assigned_at) - new Date(a.assigned_at));
          }
        }

        setStats(statsObj);
        setRecentDeliveries(allRecent.slice(0, 5));
      } catch (e) {
        console.error("Delivery dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboard();
  }, []);

  const statusColor = {
    ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
    PICKED_UP: "bg-amber-50 text-amber-700 border-amber-200",
    OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const navItems = [
    { name: "Assign Partner", path: "/frontend/delivery/assign-partner", icon: "🔗", desc: "Pair orders with drivers" },
    { name: "Active Assignments", path: "/frontend/delivery/assignments", icon: "🚚", desc: "Manage live deliveries" },
    { name: "Track Orders", path: "/frontend/delivery/track-order", icon: "📍", desc: "Real-time order tracking" },
    { name: "Accepted Orders", path: "/frontend/delivery/Accepted_Order", icon: "✅", desc: "Orders ready for pickup" },
    { name: "Branch Stock", path: "/frontend/delivery/Branch_stock", icon: "📦", desc: "Check inventory levels" },
    { name: "Order History", path: "/frontend/delivery/Order_history", icon: "📋", desc: "Past delivery logs" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#0E7C50] to-emerald-700 rounded-2xl p-6 text-white">
        <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Delivery Partner Portal</span>
        <h1 className="text-2xl font-extrabold mt-2 tracking-tight">
          Welcome, Delivery Partner
        </h1>
        <p className="text-emerald-100 text-xs mt-1">Track, assign and complete your deliveries here.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Assigned", value: stats.totalAssigned, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          { label: "In Transit", value: stats.totalCurrent, color: "text-purple-700", bg: "bg-purple-50 border-purple-200" },
          { label: "Completed", value: stats.totalCompleted, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
          { label: "Total", value: (stats.totalAssigned || 0) + (stats.totalCurrent || 0) + (stats.totalCompleted || 0), color: "text-gray-700", bg: "bg-gray-50 border-gray-200" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
            <p className={`text-3xl font-black mt-1 ${s.color}`}>{loading ? "…" : s.value ?? 0}</p>
          </div>
        ))}
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {navItems.map((item) => (
          <Link key={item.path} href={item.path}
            className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-blue-500 hover:shadow-md transition group space-y-2">
            <span className="text-2xl">{item.icon}</span>
            <h3 className="font-bold text-slate-800 group-hover:text-blue-600 transition text-sm">{item.name}</h3>
            <p className="text-xs text-slate-500">{item.desc}</p>
          </Link>
        ))}
      </div>

      {/* Recent Deliveries */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b">
          <h2 className="font-bold text-slate-800">Recent Deliveries</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm">Loading…</div>
        ) : recentDeliveries.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-sm">No deliveries found for your account.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 border-b text-slate-500 uppercase tracking-wide">
                <tr>
                  {["Order ID", "Status", "Assigned At"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentDeliveries.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-slate-500">{d.order_id?.slice(0, 12) || "—"}…</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColor[d.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">
                      {d.assigned_at ? new Date(d.assigned_at).toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}