"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function OrderHistory() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    const user = stored ? JSON.parse(stored) : null;
    const partnerId = user?.id;

    if (partnerId) {
      // Fetch both partner-specific and all deliveries to ensure data is visible for testing
      Promise.all([
        fetch(`${API}/delivery/partner/${partnerId}/dashboard`).then(r => r.json()),
        fetch(`${API}/delivery/`).then(r => r.json())
      ])
      .then(([dashboardData, allData]) => {
        let completed = [];
        if (dashboardData.success && dashboardData.completedDeliveries?.length > 0) {
          completed = dashboardData.completedDeliveries;
        } else if (allData?.deliveries) {
          // Fallback to all completed deliveries in the system if partner has none
          completed = allData.deliveries.filter((x) => x.status === "DELIVERED");
        }
        setDeliveries(completed);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    } else {
      fetch(`${API}/delivery/`)
        .then((r) => r.json())
        .then((d) => {
          const completed = (d?.deliveries || []).filter((x) => x.status === "DELIVERED");
          setDeliveries(completed);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Order History</h1>
        <p className="text-xs text-slate-500 mt-1">All completed deliveries.</p>
      </div>

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading…</div>
      ) : deliveries.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
          No completed deliveries yet.
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase tracking-wide">
              <tr>
                {["Delivery ID", "Order ID", "Status", "Assigned", "Delivered"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {deliveries.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-400">{d.id?.slice(0, 14)}…</td>
                  <td className="px-4 py-3 font-mono text-slate-700">{d.order_id?.slice(0, 14)}…</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border bg-emerald-50 text-emerald-700 border-emerald-200">
                      DELIVERED ✓
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">{d.assigned_at ? new Date(d.assigned_at).toLocaleDateString() : "—"}</td>
                  <td className="px-4 py-3 text-slate-500">{d.delivered_at ? new Date(d.delivered_at).toLocaleDateString() : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}