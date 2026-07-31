"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";

const API = "http://localhost:5000/api";

export default function PharmacistDashboard() {
  const [stats, setStats] = useState({ pending: 0, approved: 0, rejected: 0, inventory: 0 });
  const [recentPrescriptions, setRecentPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pharmacist, setPharmacist] = useState(null);

  useEffect(() => {
    const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
    if (stored) setPharmacist(JSON.parse(stored));

    async function fetchData() {
      try {
        const [rxRes, invRes] = await Promise.all([
          fetch(`${API}/admin/prescriptions`),
          fetch(`${API}/admin/inventory`),
        ]);
        const rxData = await rxRes.json();
        const invData = await invRes.json();

        let pendingCount = 0;
        let approvedTodayCount = 0;
        let rejectedCount = 0;
        let pendingPrescriptions = [];

        if (rxData?.success && rxData.prescriptions) {
          const todayStr = new Date().toISOString().split("T")[0];
          
          rxData.prescriptions.forEach(p => {
            if (p.status === "PENDING") {
              pendingCount++;
              pendingPrescriptions.push(p);
            } else if (p.status === "APPROVED") {
              if (p.reviewed_at && p.reviewed_at.startsWith(todayStr)) {
                approvedTodayCount++;
              }
            } else if (p.status === "REJECTED") {
              rejectedCount++;
            }
          });
        } else if (rxData?.data) {
          // Fallback if we hit the old /pending endpoint structure somehow
          pendingCount = rxData.data.length;
          pendingPrescriptions = rxData.data;
        }

        const invCount = invData?.statistics?.totalInventoryItems || invData?.inventory?.length || 0;
        
        setStats({ 
          pending: pendingCount, 
          approved: approvedTodayCount, 
          rejected: rejectedCount, 
          inventory: invCount 
        });
        setRecentPrescriptions(pendingPrescriptions.slice(0, 5));
      } catch (e) {
        console.error("Pharmacist dashboard fetch error:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statusColor = { PENDING: "text-amber-600 bg-amber-50", APPROVED: "text-emerald-700 bg-emerald-50", REJECTED: "text-red-600 bg-red-50" };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-700 to-emerald-600 rounded-2xl p-6 text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-medium">Pharmacist Portal</span>
            <h1 className="text-2xl font-extrabold mt-2 tracking-tight">
              Welcome, pharmacist
            </h1>
            <p className="text-teal-100 text-xs mt-1">Review prescriptions, manage stock and fulfil orders from here.</p>
          </div>
          <div className="text-xs text-teal-100">
            {pharmacist?.branch_id && <span>Branch ID: {pharmacist.branch_id}</span>}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Pending Rx", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50 border-amber-200" },
            { label: "Approved Today", value: stats.approved, color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
            { label: "Rejected", value: stats.rejected, color: "text-red-600", bg: "bg-red-50 border-red-200" },
            { label: "Inventory Items", value: stats.inventory, color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
          ].map((s) => (
            <div key={s.label} className={`rounded-xl border p-5 ${s.bg}`}>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{s.label}</p>
              <p className={`text-3xl font-black mt-1 ${s.color}`}>{loading ? "…" : s.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Nav */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Prescription Approvals", desc: "Review and approve/reject pending prescriptions", href: "/frontend/pharmacist/Approvals", color: "hover:border-amber-500", icon: "📋" },
            { title: "View Inventory", desc: "Check stock levels across your assigned branch", href: "/frontend/pharmacist/Stocks", color: "hover:border-blue-500", icon: "📦" },
            { title: "Update Stock", desc: "Add or update medicine quantities in inventory", href: "/frontend/pharmacist/Update", color: "hover:border-emerald-500", icon: "✏️" },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className={`bg-white border border-gray-200 rounded-xl p-5 transition hover:shadow-md group space-y-3 ${item.color}`}>
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-bold text-gray-900 text-sm group-hover:text-teal-700 transition">{item.title}</h3>
                <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Recent Prescriptions */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Pending Prescriptions</h2>
            <Link href="/frontend/pharmacist/Approvals" className="text-xs text-teal-700 font-semibold hover:underline">View All →</Link>
          </div>
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-xs">Loading...</div>
          ) : recentPrescriptions.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-xs">No pending prescriptions 🎉</div>
          ) : (
            <table className="w-full text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wide">
                <tr>
                  {["ID", "Customer", "Status", "Uploaded At", "Action"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentPrescriptions.map((rx) => (
                  <tr key={rx.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-gray-400">{rx.id?.slice(0, 8)}…</td>
                    <td className="px-4 py-3 text-gray-700">{rx.customer_id?.slice(0, 8) || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${statusColor[rx.status] || "bg-gray-100 text-gray-600"}`}>
                        {rx.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {rx.uploaded_at ? new Date(rx.uploaded_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Link href="/frontend/pharmacist/Approvals" className="text-teal-700 font-semibold hover:underline">Review</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
