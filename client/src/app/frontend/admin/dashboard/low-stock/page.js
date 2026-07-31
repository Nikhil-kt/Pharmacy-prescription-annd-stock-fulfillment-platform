"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLowStock() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/low-stock-report");
        const data = await res.json();
        if (data.success) {
          setLowStockItems(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching low stock items:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLowStock();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <Link
              href="/frontend/admin/dashboard"
              className="text-xs font-semibold text-[#0E7C50] hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Branch Low Stock Report
            </h1>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-50 text-amber-800 font-semibold border border-amber-200 rounded-full">
            Low Stock Alerts: {lowStockItems.length}
          </span>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading low stock report...
            </div>
          ) : lowStockItems.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-emerald-600 bg-emerald-50">
              All branch stock levels are healthy.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Medicine</th>
                  <th className="py-3 px-4 font-semibold">Branch Location</th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Remaining Quantity
                  </th>
                  <th className="py-3 px-4 font-semibold text-center">
                    Threshold Level
                  </th>
                  <th className="py-3 px-4 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {lowStockItems.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-bold text-gray-900">
                      {item.medicines?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {item.branches?.name || item.branch?.name || "Main Branch"}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-bold text-rose-600">
                      {item.quantity ?? 0}
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-gray-500">
                      {item.low_stock_threshold ?? 0}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                        CRITICAL
                      </span>
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