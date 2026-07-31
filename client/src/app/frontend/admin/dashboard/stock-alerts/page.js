"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";

export default function StockAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/branch-stock-alerts`)
      .then((r) => r.json())
      .then((d) => setAlerts(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Branch Stock Alerts</h1>
          <p className="text-xs text-gray-500 mt-1">{alerts.length} item(s) requiring attention.</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : alerts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">✅ All stock levels are healthy!</div>
        ) : (
          <div className="grid gap-3">
            {alerts.map((item) => {
              const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
              const branch = Array.isArray(item.branches) ? item.branches[0] : item.branches;
              const isOut = item.quantity === 0;
              return (
                <div key={item.id} className={`bg-white border rounded-xl p-4 flex justify-between items-center ${isOut ? "border-red-200 bg-red-50/30" : "border-amber-200 bg-amber-50/30"}`}>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{med?.name || "Unknown Medicine"}</p>
                    <p className="text-xs text-gray-500">{branch?.branch_name || "Unknown Branch"}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-black ${isOut ? "text-red-600" : "text-amber-600"}`}>{item.quantity} units</p>
                    <span className={`text-[11px] font-bold ${isOut ? "text-red-500" : "text-amber-500"}`}>
                      {isOut ? "OUT OF STOCK" : `LOW (threshold: ${item.low_stock_threshold})`}
                    </span>
                  </div>
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