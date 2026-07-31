"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { Building2, Search, ShoppingBag } from "lucide-react";

function FilterContent() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branchId") || "";

  const [inventory, setInventory] = useState([]);
  const [filterQuery, setFilterQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = "http://localhost:5000/api/customer";

  useEffect(() => {
    async function fetchBranchInventory() {
      if (!branchId) {
        setLoading(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE_URL}/inventory?branchId=${branchId}`);
        const data = await res.json();
        if (data.success) {
          setInventory(data.inventory || []);
        }
      } catch (err) {
        console.error("Failed to load inventory", err);
      } finally {
        setLoading(false);
      }
    }
    fetchBranchInventory();
  }, [branchId]);

  const filteredItems = inventory.filter((item) =>
    (item.medicine_name || item.medicines1?.medicine_name || "")
      .toLowerCase()
      .includes(filterQuery.toLowerCase())
  );

  return (
    <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="text-[#0E7C50]" size={24} />
            Branch Local Stock
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            {branchId ? `Viewing stock list for Branch ID #${branchId}` : "No branch selected"}
          </p>
        </div>

        {/* Local Filter Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Filter local stock..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[#0E7C50]/30"
          />
          <Search size={14} className="absolute left-2.5 top-2 text-gray-400" />
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading branch inventory...</div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white border rounded-2xl p-10 text-center text-xs text-gray-500 space-y-1">
          <p className="font-semibold text-gray-700">No available inventory found for this branch.</p>
          <p className="text-gray-400">Try choosing a different branch on your dashboard.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredItems.map((item, idx) => {
            const med = item.medicines1 || item;
            return (
              <div key={item.id || idx} className="bg-white border rounded-2xl p-5 space-y-3 shadow-sm hover:border-[#0E7C50] transition">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-gray-900">{med.medicine_name}</h3>
                  <span className="text-sm font-extrabold text-[#0E7C50]">${Number(med.price || 0).toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-500">{med.category || "General Health"}</p>
                <div className="pt-2 border-t flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-emerald-600">Stock: {item.quantity ?? "Available"}</span>
                  <button className="bg-[#0E7C50] text-white px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <ShoppingBag size={12} /> Add
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

export default function FilterPage() {
  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <Navbar />
      <Suspense fallback={<div className="p-8 text-xs text-gray-400">Loading...</div>}>
        <FilterContent />
      </Suspense>
      <Footer />
    </div>
  );
}