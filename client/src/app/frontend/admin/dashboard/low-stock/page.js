"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";

export default function LowStock() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/low-stock-report`)
      .then((r) => r.json())
      .then((d) => setItems(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Low Stock Report</h1>
          <p className="text-xs text-gray-500 mt-1">Medicines at or below their reorder threshold.</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">All stock levels are healthy! 🎉</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                <tr>
                  {["Medicine", "Branch", "Current Qty", "Threshold", "Urgency", "Updated"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.map((item) => {
                  const med = Array.isArray(item.medicines) ? item.medicines[0] : item.medicines;
                  const branch = Array.isArray(item.branches) ? item.branches[0] : item.branches;
                  const isOut = item.quantity === 0;
                  return (
                    <tr key={item.id} className={`hover:bg-gray-50 ${isOut ? "bg-red-50/30" : ""}`}>
                      <td className="px-4 py-3 font-semibold text-gray-800">{med?.name || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{branch?.branch_name || "—"}</td>
                      <td className="px-4 py-3 font-bold text-red-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-gray-500">{item.low_stock_threshold || 10}</td>
                      <td className="px-4 py-3">
                        {isOut ? (
                          <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-[11px] font-bold border border-red-200">OUT OF STOCK</span>
                        ) : (
                          <span className="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full text-[11px] font-bold border border-amber-200">LOW STOCK</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}