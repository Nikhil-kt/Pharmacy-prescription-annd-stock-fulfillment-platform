"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function StockAlertsPage() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/branch-stock-alerts");
        const data = await res.json();
        if (data.success) setAlerts(data.data || []);
      } catch (err) {
        console.error("Error fetching branch stock alerts:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <Link href="/frontend/admin/dashboard" className="text-xs font-semibold text-[#0E7C50] hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Branch Stock Alerts
            </h1>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading alerts...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Branch</th>
                  <th className="py-3 px-4 font-semibold">Medicine Name</th>
                  <th className="py-3 px-4 font-semibold">Current Stock</th>
                  <th className="py-3 px-4 font-semibold">Threshold</th>
                  <th className="py-3 px-4 font-semibold">Alert Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {alerts.length > 0 ? (
                  alerts.map((alert, idx) => (
                    <tr key={alert.id || idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">
                        {alert.branch?.name || "Main Branch"}
                      </td>
                      <td className="py-3 px-4">
                        {alert.medicines?.name || "Medicine Item"}
                      </td>
                      <td className="py-3 px-4 font-bold text-red-600">
                        {alert.quantity || 0} left
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {alert.low_stock_threshold || 0}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 bg-red-50 text-red-700 text-xs font-semibold rounded-full border border-red-200">
                          Critical Low
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">No branch stock alerts active.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}