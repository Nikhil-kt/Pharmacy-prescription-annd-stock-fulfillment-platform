"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";
const statusColor = { PLACED: "bg-blue-50 text-blue-700", APPROVED: "bg-emerald-50 text-emerald-700", CANCELLED: "bg-red-50 text-red-700", DELIVERED: "bg-gray-100 text-gray-600", PRESCRIPTION_PENDING: "bg-amber-50 text-amber-700" };

export default function TodaysOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/todays-orders`)
      .then((r) => r.json())
      .then((d) => setOrders(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const total = orders.reduce((s, o) => s + Number(o.total_amount || 0), 0);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Today's Orders</h1>
          <p className="text-xs text-gray-500 mt-1">All orders placed today — {new Date().toDateString()}</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white border rounded-xl p-5">
            <p className="text-xs text-gray-500">Total Orders</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{loading ? "…" : orders.length}</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <p className="text-xs text-gray-500">Revenue Today</p>
            <p className="text-2xl font-black text-[#0E7C50] mt-1">₹{loading ? "…" : total.toFixed(2)}</p>
          </div>
          <div className="bg-white border rounded-xl p-5">
            <p className="text-xs text-gray-500">Pending Review</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{loading ? "…" : orders.filter((o) => o.status === "PLACED").length}</p>
          </div>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">No orders placed today yet.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                  <tr>
                    {["Order ID", "Customer", "Branch", "Amount", "Status", "Time"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-400">{o.id?.slice(0, 12)}…</td>
                      <td className="px-4 py-3 text-gray-700">{o.customers?.full_name || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{o.branches?.branch_name || "—"}</td>
                      <td className="px-4 py-3 font-semibold">₹{o.total_amount || 0}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor[o.status] || "bg-gray-100 text-gray-600"}`}>
                          {o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{o.created_at ? new Date(o.created_at).toLocaleTimeString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}