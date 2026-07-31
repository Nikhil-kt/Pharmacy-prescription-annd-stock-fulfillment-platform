"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function TopSellingPage() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTop() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/top-selling-medicines");
        const data = await res.json();
        if (data.success) setMedicines(data.data || []);
      } catch (err) {
        console.error("Error fetching top selling medicines:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchTop();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <Link href="/frontend/admin/dashboard" className="text-xs font-semibold text-[#0E7C50] hover:underline">
              ← Back to Admin Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Top-Selling Medicines Analysis
            </h1>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading top sales...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Rank</th>
                  <th className="py-3 px-4 font-semibold">Medicine Name</th>
                  <th className="py-3 px-4 font-semibold">Category</th>
                  <th className="py-3 px-4 font-semibold text-right">Units Sold</th>
                  <th className="py-3 px-4 font-semibold text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {medicines.length > 0 ? (
                  medicines.map((m, idx) => (
                    <tr key={m.id || idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-bold text-[#0E7C50]">#{idx + 1}</td>
                      <td className="py-3 px-4 font-bold text-gray-900">{m.name}</td>
                      <td className="py-3 px-4 text-gray-600">{m.category}</td>
                      <td className="py-3 px-4 text-right font-mono font-medium text-gray-900">{m.totalSold}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-[#0E7C50]">
                        ₹{m.revenue ? m.revenue.toLocaleString() : 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-6 text-center text-gray-500">No sales data available.</td>
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