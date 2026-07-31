"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api";

export default function AllMedicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);

  async function fetchMedicines() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/medicines`);
      const data = await res.json();
      setMedicines(data?.medicines || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMedicines();
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex justify-between items-start">
          <div>
            <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">
              ← Admin Dashboard
            </Link>
            <h1 className="text-2xl font-extrabold text-gray-900 mt-1">All Medicines</h1>
            <p className="text-xs text-gray-500 mt-1">View all medicines and their details from the database.</p>
          </div>
          <button onClick={fetchMedicines} className="text-xs text-[#0E7C50] font-semibold hover:underline">
            ↻ Refresh
          </button>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading medicines…</div>
        ) : medicines.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">No medicines found.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">Medicine ID</th>
                    <th className="px-4 py-3 text-left font-semibold">Name</th>
                    <th className="px-4 py-3 text-left font-semibold">Manufacturer</th>
                    <th className="px-4 py-3 text-left font-semibold">Category</th>
                    <th className="px-4 py-3 text-left font-semibold">Price</th>
                    <th className="px-4 py-3 text-left font-semibold">Rx Required</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {medicines.map((m) => (
                    <tr key={m.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-400">{m.id?.slice(0, 8)}…</td>
                      <td className="px-4 py-3 text-gray-900 font-medium">
                        {m.medicine_name || m.name || "—"}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{m.manufacturer || "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{m.category || "—"}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900">₹{m.price || 0}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            m.prescription_required
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}
                        >
                          {m.prescription_required ? "YES" : "NO"}
                        </span>
                      </td>
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