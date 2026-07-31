"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";

export default function TopSelling() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/top-selling-medicines`)
      .then((r) => r.json())
      .then((d) => setMedicines(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Top Selling Medicines</h1>
          <p className="text-xs text-gray-500 mt-1">Best performing medicines by total units sold.</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : medicines.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">No sales data found.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                <tr>
                  {["Rank", "Medicine", "Category", "Units Sold", "Revenue"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {medicines.map((m, i) => (
                  <tr key={m.id} className={`hover:bg-gray-50 ${i === 0 ? "bg-amber-50/40" : ""}`}>
                    <td className="px-4 py-3 font-bold text-gray-500">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}
                    </td>
                    <td className="px-4 py-3 font-bold text-gray-900">{m.name}</td>
                    <td className="px-4 py-3 text-gray-600">{m.category || "—"}</td>
                    <td className="px-4 py-3 font-semibold text-[#0E7C50]">{m.totalSold} units</td>
                    <td className="px-4 py-3 font-semibold text-gray-800">₹{m.revenue?.toFixed(2) || "0.00"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}