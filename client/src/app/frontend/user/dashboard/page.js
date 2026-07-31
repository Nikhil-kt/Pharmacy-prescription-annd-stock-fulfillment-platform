"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { fetchBranches, fetchBranchMedicines, searchMedicines } from "../api";
import {
  Search,
  MapPin,
  Upload,
  Pill,
  ShoppingBag,
  Clock,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";

export default function UserDashboard() {
  const router = useRouter();

  // State management
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [branchMedicines, setBranchMedicines] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [loadingBranches, setLoadingBranches] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [error, setError] = useState(null);

  // Load branches on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoadingBranches(true);
        setError(null);
        const data = await fetchBranches();
        if (data.success && data.branches && data.branches.length > 0) {
          setBranches(data.branches);
          setSelectedBranchId(data.branches[0].id);
        } else {
          setBranches([]);
        }
      } catch (err) {
        console.error("Failed to load branches:", err);
        setError("Unable to connect to pharmacy server. Please ensure the backend is running.");
      } finally {
        setLoadingBranches(false);
      }
    }
    loadInitialData();
  }, []);

  // Fetch medicines whenever selected branch changes
  useEffect(() => {
    if (!selectedBranchId) return;

    async function loadMedicines() {
      try {
        setLoadingMedicines(true);
        const data = await fetchBranchMedicines(selectedBranchId);
        if (data.success && data.medicines) {
          setBranchMedicines(data.medicines);
        } else {
          setBranchMedicines([]);
        }
      } catch (err) {
        console.error("Failed to fetch medicines for branch:", err);
      } finally {
        setLoadingMedicines(false);
      }
    }

    loadMedicines();
  }, [selectedBranchId]);

  // Handle Search submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    try {
      setIsSearching(true);
      setHasSearched(true);
      setError(null);
      const res = await searchMedicines(searchQuery);
      if (res.success && res.medicines) {
        setSearchResults(res.medicines);
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setError("Failed to execute search. Please try again.");
    } finally {
      setIsSearching(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setHasSearched(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar />

      {/* Hero Header & Search Section */}
      <section className="bg-gradient-to-br from-[#0E7C50] via-[#0B6A44] to-[#074D31] text-white py-14 px-4 sm:px-6 lg:px-8 shadow-inner relative overflow-hidden">
        {/* Background Decorative Pattern */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 mb-4">
                <Sparkles size={14} /> Official Pharmacy Portal
              </span>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
                Your Health, Delivered <br />
                <span className="text-emerald-300">Fast & Verified</span>
              </h1>
              <p className="mt-3 text-base sm:text-lg text-emerald-100/90 font-light">
                Order medicines, upload doctor prescriptions, and find real-time stock at your nearest branch.
              </p>
            </div>

            {/* Quick Upload CTA Card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl text-white max-w-sm w-full shadow-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 bg-emerald-500/30 rounded-xl">
                  <Upload size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-base">Have a Prescription?</h3>
                  <p className="text-xs text-emerald-100">Upload now for quick fulfillment</p>
                </div>
              </div>
              <Link
                href="/frontend/user/upload"
                className="mt-2 w-full py-2.5 px-4 bg-white text-[#0E7C50] font-bold rounded-xl text-center block hover:bg-emerald-50 transition-colors shadow-md text-sm"
              >
                Upload Prescription Now
              </Link>
            </div>
          </div>

          {/* Search Bar Bar */}
          <div className="mt-10 max-w-3xl">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <div className="relative w-full">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for medicines by name (e.g. Paracetamol, Amoxicillin)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-28 py-4 bg-white text-gray-900 rounded-2xl shadow-2xl focus:outline-none focus:ring-4 focus:ring-emerald-400/40 text-sm font-medium placeholder:text-gray-400"
                />
              </div>
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 px-5 py-2.5 bg-[#0E7C50] text-white font-semibold text-sm rounded-xl hover:bg-[#0B6A44] transition-colors flex items-center gap-1.5 shadow-md"
              >
                {isSearching ? <Loader2 size={16} className="animate-spin" /> : "Search"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-12">
        {/* Error Alert if backend error occurs */}
        {error && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 text-amber-900 text-sm">
            <AlertCircle size={20} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Notice</p>
              <p className="text-amber-800">{error}</p>
            </div>
          </div>
        )}

        {/* Quick Navigation Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            href="/frontend/user/filter"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 text-[#0E7C50] rounded-xl group-hover:bg-[#0E7C50] group-hover:text-white transition-colors">
                <Pill size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Browse Catalog</h4>
                <p className="text-xs text-gray-500">Filter by category & branch</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/frontend/user/upload"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Rx Upload</h4>
                <p className="text-xs text-gray-500">Fast digital verification</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/frontend/user/Order"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <ShoppingBag size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">My Cart & Orders</h4>
                <p className="text-xs text-gray-500">Manage checkout</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/frontend/user/Order _Status"
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-50 text-orange-600 rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors">
                <Clock size={24} />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm">Track Status</h4>
                <p className="text-xs text-gray-500">Live order timeline</p>
              </div>
            </div>
            <ChevronRight size={18} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
          </Link>
        </section>

        {/* Search Results Section (If user searched) */}
        {hasSearched && (
          <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Search Results for "{searchQuery}"
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Found {searchResults.length} medicine(s)
                </p>
              </div>
              <button
                onClick={clearSearch}
                className="text-xs text-[#0E7C50] hover:underline font-medium"
              >
                Clear Search
              </button>
            </div>

            {isSearching ? (
              <div className="py-12 flex justify-center items-center text-gray-400 gap-2">
                <Loader2 className="animate-spin text-[#0E7C50]" size={24} />
                <span>Searching catalog...</span>
              </div>
            ) : searchResults.length === 0 ? (
              <div className="py-12 text-center text-gray-500">
                <Pill size={40} className="mx-auto text-gray-300 mb-2" />
                <p className="font-medium text-gray-700">No medicines found matching "{searchQuery}"</p>
                <p className="text-xs text-gray-400 mt-1">Try checking the spelling or browse catalog by branch.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {searchResults.map((med) => (
                  <div
                    key={med.id}
                    className="border border-gray-200 rounded-xl p-5 hover:border-emerald-500 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {med.category || "General"}
                        </span>
                        {med.prescription_required && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 bg-amber-100 text-amber-800 rounded flex items-center gap-1">
                            <FileText size={12} /> Rx Required
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-gray-900 mt-3 text-base">{med.medicine_name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">By {med.manufacturer || "Certified Pharma"}</p>
                      <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                        {med.description || "No specific description available."}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-lg font-extrabold text-[#0E7C50]">
                        ${parseFloat(med.price || 0).toFixed(2)}
                      </span>
                      <Link
                        href={`/frontend/user/medicine?id=${med.id}`}
                        className="px-3.5 py-1.5 bg-[#0E7C50] text-white text-xs font-semibold rounded-lg hover:bg-[#0B6A44] transition-colors"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Branch Selection & Inventory Catalog */}
        <section className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <MapPin className="text-[#0E7C50]" size={24} /> Available Stock by Branch
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Select your preferred pharmacy branch to view live in-stock medicines.
              </p>
            </div>

            {/* Branch Selector Dropdown */}
            <div className="flex items-center gap-2">
              <label htmlFor="branch-select" className="text-xs font-semibold text-gray-700 whitespace-nowrap">
                Select Branch:
              </label>
              {loadingBranches ? (
                <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white border px-3 py-2 rounded-xl">
                  <Loader2 size={14} className="animate-spin text-[#0E7C50]" /> Loading branches...
                </div>
              ) : (
                <select
                  id="branch-select"
                  value={selectedBranchId}
                  onChange={(e) => setSelectedBranchId(e.target.value)}
                  className="bg-white border border-gray-300 text-gray-800 text-xs font-medium rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#0E7C50] focus:outline-none shadow-sm cursor-pointer"
                >
                  {branches.length === 0 ? (
                    <option value="">No branches found</option>
                  ) : (
                    branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.branch_name} ({b.city || b.location || "Branch"})
                      </option>
                    ))
                  )}
                </select>
              )}
            </div>
          </div>

          {/* Medicines Grid */}
          {loadingMedicines ? (
            <div className="py-16 text-center text-gray-400 flex flex-col items-center justify-center gap-3">
              <Loader2 className="animate-spin text-[#0E7C50]" size={32} />
              <p className="text-sm font-medium text-gray-600">Fetching inventory from branch...</p>
            </div>
          ) : branchMedicines.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center text-gray-500">
              <Pill size={44} className="mx-auto text-gray-300 mb-3" />
              <h3 className="font-semibold text-gray-800 text-base">No Medicines Available</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                There are currently no active in-stock medicines listed for this branch. Please select another branch or use search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {branchMedicines.map((item, idx) => {
                const med = item.medicines1 || item;
                const qty = item.quantity;
                return (
                  <div
                    key={med.id || idx}
                    className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-lg transition-all duration-200 flex flex-col justify-between relative group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-50 text-[#0E7C50] rounded-md">
                          {med.category || "General"}
                        </span>
                        <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <CheckCircle2 size={11} /> Stock: {qty}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 text-base group-hover:text-[#0E7C50] transition-colors">
                        {med.medicine_name}
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">Mfr: {med.manufacturer || "Certified Lab"}</p>
                      
                      <p className="text-xs text-gray-600 line-clamp-2 mt-2 leading-relaxed">
                        {med.description || "High-quality pharmaceutical product for health & wellness."}
                      </p>

                      {med.prescription_required && (
                        <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1 rounded-md">
                          <FileText size={12} /> Prescription Required
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-gray-400 block leading-none">Price</span>
                        <span className="text-lg font-extrabold text-gray-900">
                          ${parseFloat(med.price || 0).toFixed(2)}
                        </span>
                      </div>

                      <Link
                        href={`/frontend/user/medicine?id=${med.id}`}
                        className="px-4 py-2 bg-[#0E7C50] text-white text-xs font-semibold rounded-xl hover:bg-[#0B6A44] transition-colors shadow-sm"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Value Proposition Banners */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-emerald-50 text-[#0E7C50] rounded-2xl">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">100% Genuine Medicines</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Directly sourced from licensed pharmaceutical distributors and branch inventories.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
              <Truck size={28} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Swift Doorstep Delivery</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Fast processing with real-time delivery status tracking for your peace of mind.
              </p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 flex items-start gap-4 shadow-sm">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
              <FileText size={28} />
            </div>
            <div>
              <h4 className="font-bold text-gray-900 text-sm">Verified Rx Review</h4>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Uploaded doctor prescriptions are reviewed by certified pharmacists before dispatch.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
