'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useBranch } from '@/context/BranchContext';
import { useAuth } from '@/context/AuthContext';
import MedicineCard from '@/components/MedicineCard';

export default function CustomerBranchesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { branches, selectedBranchId, selectBranch, loadingBranches } = useBranch();
  const [activeBranchId, setActiveBranchId] = useState('');
  const [branchDetails, setBranchDetails] = useState(null);
  const [medicines, setMedicines] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', 'Medicines', 'Health Care', 'Personal Care', 'Baby Care', 'Devices', 'Wellness'];

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
  }, [user, authLoading, router]);

  // Initialize active branch ID with global selected branch or first branch
  useEffect(() => {
    if (selectedBranchId) {
      setActiveBranchId(selectedBranchId);
    } else if (branches.length > 0) {
      setActiveBranchId(branches[0].id);
    }
  }, [selectedBranchId, branches]);

  // Fetch branch details and medicines when active branch changes
  useEffect(() => {
    if (user && activeBranchId) {
      fetchBranchContent(activeBranchId);
    }
  }, [user, activeBranchId, search, category]);

  async function fetchBranchContent(bId) {
    setLoadingData(true);
    try {
      // 1. Fetch branch info
      const bRes = await api.get(`/api/branches/${bId}`);
      setBranchDetails(bRes.data);

      // 2. Fetch medicines with branch stock
      const params = { limit: 24, is_active: true, branch_id: bId };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;

      const mRes = await api.get('/api/medicines', params);
      setMedicines(mRes.data || []);
    } catch {
      setBranchDetails(null);
      setMedicines([]);
    } finally {
      setLoadingData(false);
    }
  }

  if (authLoading || !user) return null;

  const activeBranch = branches.find(b => b.id === activeBranchId) || branchDetails;
  const isGlobalSelected = selectedBranchId === activeBranchId;

  const inStockCount = medicines.filter(m => m.in_stock).length;
  const outOfStockCount = medicines.filter(m => !m.in_stock).length;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <span>/</span>
          <span className="text-gray-800 font-medium">Store Locator & Branch Details</span>
        </nav>

        {/* Header Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Our Pharmacy Branches</h1>
          <p className="text-sm text-gray-500 mt-1">Select a branch to view detailed location information and live medicine inventory.</p>
        </div>

        {/* Branch Cards Selector Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {loadingBranches ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 animate-pulse border border-gray-100 h-32" />
            ))
          ) : (
            branches.map((b) => {
              const isSelected = activeBranchId === b.id;
              const isDefaultStore = selectedBranchId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setActiveBranchId(b.id)}
                  className={`cursor-pointer rounded-2xl p-5 border-2 transition-all relative ${
                    isSelected
                      ? 'bg-white border-primary shadow-lg ring-2 ring-primary/10'
                      : 'bg-white border-gray-100 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  {isDefaultStore && (
                    <span className="absolute top-3 right-3 bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                      Active Store
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-lighter text-primary flex items-center justify-center text-xl shrink-0 font-bold">
                      🏥
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-base truncate">{b.name}</h3>
                      <p className="text-xs text-gray-500 font-medium">Code: {b.code}</p>
                      <p className="text-xs text-gray-600 mt-2 line-clamp-1">📍 {b.address}, {b.city}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Branch Main Details & Inventory */}
        {activeBranch && (
          <div className="space-y-8">
            {/* Detailed Branch Overview Box */}
            <div className="bg-gradient-to-r from-primary-dark via-primary to-primary-dark text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      Branch Code: {activeBranch.code}
                    </span>
                    <span className="bg-green-400 text-gray-900 text-xs font-bold px-3 py-1 rounded-full">
                      ● Active Store
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">{activeBranch.name}</h2>
                  <p className="text-white/80 text-sm flex items-center gap-1.5 mb-1">
                    <span>📍</span> {activeBranch.address}, {activeBranch.city}
                  </p>
                  <p className="text-white/70 text-xs flex items-center gap-4 mt-3">
                    <span>⏰ Open: 8:00 AM - 10:00 PM</span>
                    <span>📞 Contact: +91 (800) 555-RXCONN</span>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 shrink-0">
                  {!isGlobalSelected ? (
                    <button
                      onClick={() => selectBranch(activeBranch.id)}
                      className="bg-white text-primary font-bold px-6 py-3 rounded-xl hover:bg-gray-100 transition-colors shadow-md text-sm"
                    >
                      Set as Primary Store
                    </button>
                  ) : (
                    <div className="bg-white/20 border border-white/40 text-white font-bold px-6 py-3 rounded-xl text-sm flex items-center gap-2">
                      ✓ Primary Ordering Store
                    </div>
                  )}
                </div>
              </div>

              {/* Quick Branch Inventory Stats */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-white/20 relative z-10">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <p className="text-xs text-white/70 font-medium">Total Products</p>
                  <p className="text-2xl font-black text-white mt-1">{medicines.length}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <p className="text-xs text-white/70 font-medium">In Stock Here</p>
                  <p className="text-2xl font-black text-green-300 mt-1">{inStockCount}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                  <p className="text-xs text-white/70 font-medium">Out of Stock</p>
                  <p className="text-2xl font-black text-red-300 mt-1">{outOfStockCount}</p>
                </div>
              </div>
            </div>

            {/* Branch Specific Medicine Inventory Section */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">Inventory at {activeBranch.name}</h3>
                  <p className="text-xs text-gray-500">Live stock levels and available products at this location.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap items-center gap-3">
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search branch stock..."
                    className="px-4 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary w-48 md:w-64"
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-xl text-xs outline-none focus:border-primary bg-white cursor-pointer"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              {/* Medicines Grid */}
              {loadingData ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="bg-gray-100 rounded-2xl aspect-square animate-pulse" />
                  ))}
                </div>
              ) : medicines.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {medicines.map((med) => (
                    <Link key={med.id} href={`/customer/medicines/${med.id}`}>
                      <MedicineCard medicine={med} />
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 text-gray-400">
                  <div className="text-5xl mb-3">📦</div>
                  <p className="text-base font-semibold">No medicines match your filter</p>
                  <p className="text-xs">Try clearing your search or category filter.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
