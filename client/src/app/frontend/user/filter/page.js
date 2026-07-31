"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { fetchBranches, fetchBranchMedicines, searchMedicines } from "../api";
import {
  Search,
  Filter,
  MapPin,
  Pill,
  Loader2,
  FileText,
  CheckCircle,
  ShoppingCart,
  Check,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export default function BranchAndFilterPage() {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [medicines, setMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [rxOnlyFilter, setRxOnlyFilter] = useState(false);

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [error, setError] = useState(null);
  const [addedItem, setAddedItem] = useState(null);

  // Categories list
  const categories = [
    "ALL",
    "General",
    "Health Care",
    "Personal Care",
    "Antibiotics",
    "Painkillers",
    "Wellness",
  ];

  // Load branches
  useEffect(() => {
    async function initBranches() {
      try {
        setLoadingBranches(true);
        const res = await fetchBranches();
        if (res.success && res.branches && res.branches.length > 0) {
          setBranches(res.branches);
          setSelectedBranchId(res.branches[0].id);
        }
      } catch (err) {
        console.error("Failed loading branches:", err);
        setError("Could not load pharmacy branches. Please check API server.");
      } finally {
        setLoadingBranches(false);
      }
    }
    initBranches();
  }, []);

  // Fetch medicines when branch changes
  useEffect(() => {
    if (!selectedBranchId) return;

    async function loadMedicines() {
      try {
        setLoadingMedicines(true);
        setError(null);
        const res = await fetchBranchMedicines(selectedBranchId);
        if (res.success && res.medicines) {
          setMedicines(res.medicines);
        } else {
          setMedicines([]);
        }
      } catch (err) {
        console.error("Failed fetching medicines for branch:", err);
        setError("Could not fetch medicines for the selected branch.");
      } finally {
        setLoadingMedicines(false);
      }
    }

    loadMedicines();
  }, [selectedBranchId]);

  // Handle Search submit
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      // Re-fetch branch medicines if search cleared
      if (selectedBranchId) {
        const res = await fetchBranchMedicines(selectedBranchId);
        if (res.success && res.medicines) setMedicines(res.medicines);
      }
      return;
    }

    try {
      setLoadingMedicines(true);
      const res = await searchMedicines(searchQuery);
      if (res.success && res.medicines) {
        // Map raw medicines into standard view structure
        const formatted = res.medicines.map((m) => ({
          quantity: 10, // Default stock view for global search
          medicines1: m,
        }));
        setMedicines(formatted);
      }
    } catch (err) {
      console.error("Search error:", err);
    } finally {
      setLoadingMedicines(false);
    }
  };

  // Add to local storage cart
  const addToCart = (med, quantity = 1) => {
    if (typeof window === "undefined") return;

    const currentCart = JSON.parse(localStorage.getItem("rxconnect_cart") || "[]");
    const existingIdx = currentCart.findIndex((item) => item.id === med.id);

    if (existingIdx > -1) {
      currentCart[existingIdx].qty += quantity;
    } else {
      currentCart.push({
        id: med.id,
        name: med.medicine_name,
        price: parseFloat(med.price || 0),
        prescription_required: !!med.prescription_required,
        category: med.category || "General",
        qty: quantity,
      });
    }

    localStorage.setItem("rxconnect_cart", JSON.stringify(currentCart));
    setAddedItem(med.id);
    setTimeout(() => setAddedItem(null), 2000);
  };

  // Filter medicines locally by category and prescription
  const filteredMedicines = medicines.filter((item) => {
    const med = item.medicines1 || item;
    if (!med) return false;

    // Category filter
    if (selectedCategory !== "ALL") {
      if (
        !med.category ||
        med.category.toLowerCase() !== selectedCategory.toLowerCase()
      ) {
        return false;
      }
    }

    // Prescription filter
    if (rxOnlyFilter && !med.prescription_required) {
      return false;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Header Banner */}
      <header className="bg-white border-b border-gray-200 py-8 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold text-[#0E7C50] uppercase tracking-wider">
              Browse & Filter Catalog
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-1">
              Medicines & Healthcare Stock
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Select your nearby branch to view live pricing and immediate availability.
            </p>
          </div>

          {/* Branch Selector Pill */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="p-2 bg-[#0E7C50] text-white rounded-xl">
              <MapPin size={20} />
            </div>
            <div>
              <label htmlFor="branch-select-catalog" className="block text-[11px] font-bold text-[#0E7C50] uppercase">
                Active Pharmacy Branch
              </label>
              {loadingBranches ? (
                <span className="text-xs text-gray-500 flex items-center gap-1">
                  <Loader2 size={12} className="animate-spin" /> Loading branches...
                </span>
              ) : (
                <select
                  id="branch-select-catalog"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-transparent font-bold text-gray-900 text-sm focus:outline-none cursor-pointer pr-4"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.branch_name} - {b.city || b.location || "Main"}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                <Filter size={16} className="text-[#0E7C50]" /> Filter Options
              </h2>
              <button
                onClick={() => {
                  setSelectedCategory("ALL");
                  setRxOnlyFilter(false);
                  setSearchQuery("");
                }}
                className="text-[11px] text-[#0E7C50] hover:underline flex items-center gap-1 font-semibold"
              >
                <RotateCcw size={12} /> Reset
              </button>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Search Medicine
              </label>
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Medicine name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:ring-2 focus:ring-[#0E7C50] focus:outline-none"
                />
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </form>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-2">
                Categories
              </label>
              <div className="space-y-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-colors flex items-center justify-between ${
                      selectedCategory === cat
                        ? "bg-[#0E7C50] text-white font-bold"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span>{cat}</span>
                    {selectedCategory === cat && <Check size={14} />}
                  </button>
                ))}
              </div>
            </div>

            {/* Prescription Filter Toggle */}
            <div className="pt-3 border-t border-gray-100">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rxOnlyFilter}
                  onChange={(e) => setRxOnlyFilter(e.target.checked)}
                  className="w-4 h-4 text-[#0E7C50] rounded focus:ring-[#0E7C50] cursor-pointer"
                />
                <span className="text-xs text-gray-700 font-medium">
                  Prescription Required Only
                </span>
              </label>
            </div>
          </div>
        </aside>

        {/* Right Medicines Grid */}
        <section className="lg:col-span-3 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-xs flex items-center gap-2">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-gray-500 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <span>
              Showing <strong className="text-gray-900">{filteredMedicines.length}</strong> medicine(s)
            </span>
            <span className="text-gray-400">Branch Stock Live Sync</span>
          </div>

          {loadingMedicines ? (
            <div className="py-20 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#0E7C50]" size={36} />
              <p className="text-sm font-medium text-gray-600">Loading medicines from branch...</p>
            </div>
          ) : filteredMedicines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center text-gray-500">
              <Pill size={48} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-bold text-gray-800 text-base">No Medicines Found</h3>
              <p className="text-xs text-gray-400 mt-1">
                No products matched your selected filters or branch stock. Try resetting your search or branch.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMedicines.map((item, idx) => {
                const med = item.medicines1 || item;
                const qty = item.quantity;

                return (
                  <div
                    key={med.id || idx}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {med.category || "General"}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle size={10} /> Stock: {qty}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base">{med.medicine_name}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">Mfr: {med.manufacturer || "Certified Laboratory"}</p>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                        {med.description || "Authentic pharmaceutical grade product."}
                      </p>

                      {med.prescription_required && (
                        <div className="mt-3 inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                          <FileText size={11} /> Rx Required
                        </div>
                      )}
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-gray-400 block uppercase">Price</span>
                        <span className="text-lg font-extrabold text-[#0E7C50]">
                          ${parseFloat(med.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/frontend/user/medicine?id=${med.id}`}
                          className="px-3 py-1.5 border border-gray-300 text-gray-700 text-xs font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          Details
                        </Link>
                        <button
                          onClick={() => addToCart(med)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded-xl text-white transition-all flex items-center gap-1 ${
                            addedItem === med.id
                              ? "bg-emerald-600"
                              : "bg-[#0E7C50] hover:bg-[#0B6A44]"
                          }`}
                        >
                          {addedItem === med.id ? (
                            <>
                              <Check size={14} /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingCart size={14} /> Add
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}