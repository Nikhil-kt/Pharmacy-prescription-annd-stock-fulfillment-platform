"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";

const API = "http://localhost:5000/api";

export default function PharmacistStocks() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/admin/inventory`)
      .then((r) => r.json())
      .then((d) => setInventory(d?.inventory || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = inventory.filter((item) => {
    const name = item.medicines1?.medicine_name || item.medicines?.name || "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const stockBadge = (qty) => {
    if (qty === 0) return "bg-red-100 text-red-700 border-red-200";
    if (qty < 10) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Inventory Overview</h1>
          <p className="text-xs text-gray-500 mt-1">Current stock levels across all branches.</p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search medicine name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-teal-400/30 w-64"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading inventory…</div>
          ) : filtered.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No inventory items found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                  <tr>
                    {["Medicine", "Branch", "Quantity", "Expiry", "Last Updated", "Status"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filtered.map((item) => {
                    const med = item.medicines1 || item.medicines || {};
                    const name = med.medicine_name || med.name || "Unknown";
                    const branch = item.branches?.branch_name || "—";
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-semibold text-gray-800">{name}</td>
                        <td className="px-4 py-3 text-gray-600">{branch}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${stockBadge(item.quantity)}`}>
                            {item.quantity} units
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{item.expiry_date || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{item.last_updated ? new Date(item.last_updated).toLocaleDateString() : "—"}</td>
                        <td className="px-4 py-3">
                          {item.quantity === 0 ? (
                            <span className="text-red-600 font-bold">Out of Stock</span>
                          ) : item.quantity < 10 ? (
                            <span className="text-amber-600 font-bold">Low Stock</span>
                          ) : (
                            <span className="text-emerald-600 font-bold">In Stock</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}