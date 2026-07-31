"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function BranchStock() {
  const [inventory, setInventory] = useState([]);
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API}/customer/branches`)
      .then((r) => r.json())
      .then((d) => setBranches(d?.branches || []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (!selectedBranch) { setInventory([]); return; }
    setLoading(true);
    fetch(`${API}/inventory/${selectedBranch}`)
      .then((r) => r.json())
      .then((d) => setInventory(d?.stock || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [selectedBranch]);

  const stockBadge = (qty) => {
    if (qty === 0) return "bg-red-100 text-red-700 border-red-200";
    if (qty < 10) return "bg-amber-100 text-amber-700 border-amber-200";
    return "bg-emerald-100 text-emerald-700 border-emerald-200";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Branch Stock</h1>
        <p className="text-xs text-slate-500 mt-1">Check inventory levels at each branch.</p>
      </div>

      <select value={selectedBranch} onChange={(e) => setSelectedBranch(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-400/30 w-72">
        <option value="">-- Select a Branch --</option>
        {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
      </select>

      {!selectedBranch ? (
        <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
          Select a branch to view its stock.
        </div>
      ) : loading ? (
        <div className="p-10 text-center text-slate-400">Loading stock…</div>
      ) : inventory.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">No inventory found for this branch.</div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-xs">
            <thead className="bg-slate-50 border-b text-slate-500 uppercase tracking-wide">
              <tr>
                {["Medicine", "Quantity", "Expiry Date", "Status"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((item) => {
                const med = item.medicines1 || item.medicines || {};
                return (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-800">{med.medicine_name || med.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${stockBadge(item.quantity)}`}>
                        {item.quantity} units
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{item.expiry_date || "—"}</td>
                    <td className="px-4 py-3 font-semibold">
                      {item.quantity === 0 ? <span className="text-red-600">Out of Stock</span>
                        : item.quantity < 10 ? <span className="text-amber-600">Low Stock</span>
                        : <span className="text-emerald-600">In Stock</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}