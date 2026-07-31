"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";

export default function StockFailures() {
  const [failures, setFailures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/stock-failures`)
      .then((r) => r.json())
      .then((d) => setFailures(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Stock-Related Order Failures</h1>
          <p className="text-xs text-gray-500 mt-1">Cancelled/rejected orders and the medicines they requested.</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : failures.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">No stock-related failures found.</div>
        ) : (
          <div className="space-y-4">
            {failures.map((f) => (
              <div key={f.order_id} className="bg-white border border-red-200 rounded-xl p-5 shadow-sm">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-bold text-gray-900 text-sm">Order: {f.order_id?.slice(0, 20)}…</p>
                    <p className="text-xs text-gray-500">Branch: {f.branch}</p>
                    <p className="text-xs text-gray-400">Cancelled at: {f.cancelled_at ? new Date(f.cancelled_at).toLocaleString() : "—"}</p>
                  </div>
                  <span className="text-[11px] bg-red-50 text-red-600 border border-red-200 px-2 py-0.5 rounded-full font-bold">CANCELLED</span>
                </div>
                {f.items?.length > 0 && (
                  <div className="border-t pt-3">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-2">Requested Medicines</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {f.items.map((item, i) => (
                        <div key={i} className="bg-red-50 rounded-lg px-3 py-2 text-xs">
                          <span className="font-semibold text-gray-800">{item.medicine_name}</span>
                          <span className="text-gray-500 ml-1">× {item.requested_quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}