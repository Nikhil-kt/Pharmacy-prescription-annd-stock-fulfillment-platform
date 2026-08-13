'use client';

import { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import MedicineCard from '@/components/MedicineCard';
import { useBranch } from '@/context/BranchContext';
import { useAuth } from '@/context/AuthContext';

const categoryItems = [
  { name: 'All', icon: '🌐' },
  { name: 'Medicines', icon: '💊' },
  { name: 'Health Care', icon: '❤️' },
  { name: 'Personal Care', icon: '🧴' },
  { name: 'Baby Care', icon: '👶' },
  { name: 'Devices', icon: '🩺' },
  { name: 'Wellness', icon: '🌿' },
];

const priceRanges = [
  { id: 'all', label: 'All Prices' },
  { id: 'under100', label: 'Under ₹100' },
  { id: '100to500', label: '₹100 - ₹500' },
  { id: 'above500', label: 'Above ₹500' },
];

const rxOptions = [
  { id: 'all', label: 'All Medicines' },
  { id: 'otc', label: 'OTC (No Rx)' },
  { id: 'rx', label: 'Prescription Only (Rx)' },
];

export default function CustomerMedicinesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const { selectedBranchId, selectedBranch } = useBranch();

  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [availableOnly, setAvailableOnly] = useState(false);
  const [rxFilter, setRxFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [sortBy, setSortBy] = useState('availability');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 12;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    if (user) {
      fetchMedicines();
    }
  }, [user, authLoading, search, category, availableOnly, sortBy, page, selectedBranchId, router]);

  async function fetchMedicines() {
    setLoading(true);
    try {
      const params = { page, limit, is_active: true };
      if (search) params.search = search;
      if (category && category !== 'All') params.category = category;
      if (selectedBranchId) params.branch_id = selectedBranchId;
      if (availableOnly) params.available_only = 'true';
      if (sortBy) params.sort_by = sortBy;

      const res = await api.get('/api/medicines', params);
      setMedicines(res.data || []);
      setTotal(res.total || 0);
    } catch {
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  }

  // Client-side filtering for Rx requirement and Price range
  const filteredMedicines = useMemo(() => {
    let list = [...medicines];

    // Filter by Prescription requirement
    if (rxFilter === 'otc') {
      list = list.filter(m => !m.requires_prescription);
    } else if (rxFilter === 'rx') {
      list = list.filter(m => m.requires_prescription);
    }

    // Filter by Price range
    if (priceFilter === 'under100') {
      list = list.filter(m => Number(m.mrp) < 100);
    } else if (priceFilter === '100to500') {
      list = list.filter(m => Number(m.mrp) >= 100 && Number(m.mrp) <= 500);
    } else if (priceFilter === 'above500') {
      list = list.filter(m => Number(m.mrp) > 500);
    }

    // Sorting overrides for Price
    if (sortBy === 'price_asc') {
      list.sort((a, b) => Number(a.mrp) - Number(b.mrp));
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => Number(b.mrp) - Number(a.mrp));
    } else if (sortBy === 'name') {
      list.sort((a, b) => a.name.localeCompare(b.name));
    }

    return list;
  }, [medicines, rxFilter, priceFilter, sortBy]);

  const hasActiveFilters = category !== 'All' || search !== '' || availableOnly || rxFilter !== 'all' || priceFilter !== 'all';

  const resetAllFilters = () => {
    setCategory('All');
    setSearch('');
    setAvailableOnly(false);
    setRxFilter('all');
    setPriceFilter('all');
    setSortBy('availability');
    setPage(1);
  };

  if (authLoading || !user) return null;

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 py-6 md:py-8">
        
        {/* ═══════════ BREADCRUMB ═══════════ */}
        <nav className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 mb-6">
          <Link href="/customer/dashboard" className="hover:text-[#0D9488] transition-colors flex items-center gap-1">
            <span>🏠</span> Home
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Medicines</span>
          {category !== 'All' && (
            <>
              <span>/</span>
              <span className="text-[#0D9488] font-medium">{category}</span>
            </>
          )}
        </nav>

        {/* ═══════════ HERO SEARCH BANNER ═══════════ */}
        <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0F382C] via-[#0D9488] to-[#1E3A8A] text-white p-6 sm:p-8 lg:p-10 shadow-lg shadow-teal-900/10 mb-8">
          {/* Ambient Glow Effects */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-teal-400/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold text-teal-100 mb-4">
              <span>🩺</span> Verified Pharmacy Catalog
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight leading-tight mb-2">
              Find Medicines & Health Care Essentials
            </h1>
            <p className="text-sm sm:text-base text-teal-50/90 font-normal mb-6 max-w-xl leading-relaxed">
              Explore 100% genuine medicines, healthcare devices, and wellness products available with live inventory status.
            </p>

            {/* Hero Search Bar */}
            <div className="relative max-w-2xl">
              <div className="relative flex items-center">
                <svg className="w-5 h-5 text-gray-400 absolute left-4 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  placeholder="Search medicines by name, brand, or composition..."
                  className="w-full pl-12 pr-10 py-3.5 bg-white text-gray-900 rounded-2xl shadow-md outline-none text-sm placeholder-gray-400 focus:ring-2 focus:ring-teal-400 transition-all"
                />
                {search && (
                  <button
                    onClick={() => { setSearch(''); setPage(1); }}
                    className="absolute right-3.5 text-gray-400 hover:text-gray-600 text-sm p-1 rounded-full hover:bg-gray-100"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Quick Filter Tag Chips */}
            <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
              <span className="text-teal-100/80 font-medium">Popular Searches:</span>
              {['Paracetamol', 'Amoxicillin', 'Vitamin C', 'Pain Relief'].map((term) => (
                <button
                  key={term}
                  onClick={() => { setSearch(term); setPage(1); }}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/15 text-[11px] transition-colors"
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ═══════════ MOBILE HORIZONTAL CATEGORIES BAR ═══════════ */}
        <div className="lg:hidden mb-6 overflow-x-auto pb-2 flex items-center gap-2 scrollbar-none">
          {categoryItems.map((cat) => (
            <button
              key={cat.name}
              onClick={() => { setCategory(cat.name); setPage(1); }}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                category === cat.name
                  ? 'bg-[#0D9488] text-white shadow-md shadow-teal-700/20'
                  : 'bg-white text-gray-700 border border-slate-200/80 hover:bg-teal-50 hover:text-[#0D9488]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* ═══════════ MAIN CONTENT LAYOUT ═══════════ */}
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* ═══════════ SIDEBAR FILTERS (DESKTOP) ═══════════ */}
          <aside className="lg:w-64 shrink-0 hidden lg:block">
            <div className="bg-white rounded-[24px] p-6 border border-slate-200/80 shadow-sm sticky top-24 space-y-6">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-xs font-extrabold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <svg className="w-4 h-4 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </h3>
                {hasActiveFilters && (
                  <button
                    onClick={resetAllFilters}
                    className="text-[11px] text-[#0D9488] hover:text-[#0F766E] font-semibold hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>

              {/* Categories Section */}
              <div>
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Categories</h4>
                <div className="space-y-1">
                  {categoryItems.map((cat) => (
                    <button
                      key={cat.name}
                      onClick={() => { setCategory(cat.name); setPage(1); }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs transition-all font-medium ${
                        category === cat.name
                          ? 'bg-[#0D9488] text-white font-bold shadow-sm'
                          : 'text-gray-600 hover:bg-emerald-50/70 hover:text-[#0D9488]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{cat.icon}</span>
                        <span>{cat.name}</span>
                      </div>
                      {category === cat.name && <span className="text-xs">✓</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Branch Availability Toggle */}
              {selectedBranchId && (
                <div className="border-t border-slate-100 pt-5">
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Branch Inventory</h4>
                  <label className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer hover:border-[#0D9488]/40 transition-colors">
                    <span className="text-xs font-medium text-gray-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock Only
                    </span>
                    <input
                      type="checkbox"
                      checked={availableOnly}
                      onChange={(e) => { setAvailableOnly(e.target.checked); setPage(1); }}
                      className="accent-[#0D9488] w-4 h-4 rounded cursor-pointer"
                    />
                  </label>
                </div>
              )}

              {/* Prescription Required Filter */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Prescription (Rx)</h4>
                <div className="space-y-1.5">
                  {rxOptions.map((opt) => (
                    <label key={opt.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900 py-1">
                      <input
                        type="radio"
                        name="rxFilter"
                        checked={rxFilter === opt.id}
                        onChange={() => setRxFilter(opt.id)}
                        className="accent-[#0D9488]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              <div className="border-t border-slate-100 pt-5">
                <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">Price Range</h4>
                <div className="space-y-1.5">
                  {priceRanges.map((pr) => (
                    <label key={pr.id} className="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-900 py-1">
                      <input
                        type="radio"
                        name="priceFilter"
                        checked={priceFilter === pr.id}
                        onChange={() => setPriceFilter(pr.id)}
                        className="accent-[#0D9488]"
                      />
                      <span>{pr.label}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* ═══════════ MAIN PRODUCT AREA ═══════════ */}
          <div className="flex-1">
            
            {/* Active Branch Banner */}
            {selectedBranch ? (
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 border border-teal-100 text-[#0D9488] flex items-center justify-center text-lg shrink-0">
                    📍
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-gray-900">Showing stock for {selectedBranch.name}</h4>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Stock Active
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">{selectedBranch.address}, {selectedBranch.city}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-auto sm:ml-0">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-xs border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 outline-none font-semibold text-gray-700 focus:border-[#0D9488] cursor-pointer"
                  >
                    <option value="availability">Sort: In-Stock First</option>
                    <option value="price_asc">Sort: Price (Low to High)</option>
                    <option value="price_desc">Sort: Price (High to Low)</option>
                    <option value="name">Sort: Alphabetical (A-Z)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 mb-6 flex items-center justify-between text-xs text-amber-900">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">📍</span>
                  <span>Select a pharmacy branch to view local real-time stock levels & availability.</span>
                </div>
                <Link href="/customer/branches" className="font-bold text-[#0D9488] hover:underline whitespace-nowrap">
                  Select Branch →
                </Link>
              </div>
            )}

            {/* Active Filters Display Chips */}
            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Active Filters:</span>
                {category !== 'All' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-[#0D9488] font-bold px-2.5 py-1 rounded-full border border-teal-200">
                    Category: {category}
                    <button onClick={() => setCategory('All')} className="hover:text-red-500 ml-1">✕</button>
                  </span>
                )}
                {search && (
                  <span className="inline-flex items-center gap-1 text-xs bg-teal-50 text-[#0D9488] font-bold px-2.5 py-1 rounded-full border border-teal-200">
                    Search: "{search}"
                    <button onClick={() => setSearch('')} className="hover:text-red-500 ml-1">✕</button>
                  </span>
                )}
                {availableOnly && (
                  <span className="inline-flex items-center gap-1 text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    In Stock Only
                    <button onClick={() => setAvailableOnly(false)} className="hover:text-red-500 ml-1">✕</button>
                  </span>
                )}
                {rxFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-sky-50 text-sky-700 font-bold px-2.5 py-1 rounded-full border border-sky-200">
                    {rxFilter === 'otc' ? 'OTC Only' : 'Rx Only'}
                    <button onClick={() => setRxFilter('all')} className="hover:text-red-500 ml-1">✕</button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className="inline-flex items-center gap-1 text-xs bg-purple-50 text-purple-700 font-bold px-2.5 py-1 rounded-full border border-purple-200">
                    Price: {priceRanges.find(p => p.id === priceFilter)?.label}
                    <button onClick={() => setPriceFilter('all')} className="hover:text-red-500 ml-1">✕</button>
                  </span>
                )}
                <button
                  onClick={resetAllFilters}
                  className="text-xs font-semibold text-gray-500 hover:text-red-600 underline ml-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Results Title & Counter */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-extrabold text-gray-900 tracking-tight">
                {category !== 'All' ? category : 'All Products'}
                {search && <span className="text-base font-normal text-gray-500"> for "{search}"</span>}
              </h2>
              <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1 rounded-full border border-slate-200/80 shadow-xs">
                {filteredMedicines.length} items found
              </span>
            </div>

            {/* Products Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-[22px] p-5 border border-slate-100 shadow-sm animate-pulse space-y-3">
                    <div className="bg-slate-100 rounded-2xl aspect-square" />
                    <div className="h-4 bg-slate-200 rounded w-3/4" />
                    <div className="h-3 bg-slate-100 rounded w-1/2" />
                    <div className="h-8 bg-slate-100 rounded-xl" />
                  </div>
                ))}
              </div>
            ) : filteredMedicines.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {filteredMedicines.map((med) => (
                    <MedicineCard key={med.id} medicine={med} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <button
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold disabled:opacity-40 hover:border-[#0D9488] hover:text-[#0D9488] transition-colors shadow-xs"
                    >
                      ← Previous
                    </button>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-10 h-10 rounded-xl text-xs font-bold transition-all ${
                          page === p
                            ? 'bg-[#0D9488] text-white shadow-md shadow-teal-700/20'
                            : 'bg-white border border-slate-200 hover:border-[#0D9488] hover:text-[#0D9488]'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                    <button
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold disabled:opacity-40 hover:border-[#0D9488] hover:text-[#0D9488] transition-colors shadow-xs"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-[24px] border border-slate-200/80 p-12 text-center text-gray-500 shadow-sm my-4">
                <div className="w-16 h-16 rounded-2xl bg-teal-50 text-[#0D9488] mx-auto flex items-center justify-center text-3xl mb-4">
                  🔍
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">No medicines matching your criteria</h3>
                <p className="text-xs text-gray-500 max-w-sm mx-auto mb-6">
                  We couldn't find any products matching your active filters or search terms.
                </p>
                <button
                  onClick={resetAllFilters}
                  className="inline-flex items-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-700/20 transition-all"
                >
                  Reset Filters & View All
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
