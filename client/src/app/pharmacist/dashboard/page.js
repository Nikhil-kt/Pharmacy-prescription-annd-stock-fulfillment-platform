'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';

function PharmacistDashboardContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const { selectedBranchId, selectedBranch } = useBranch();
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = searchParams.get('tab') || 'dashboard';

  const [pendingPrescriptions, setPendingPrescriptions] = useState([]);
  const [branchOrders, setBranchOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'pharmacist' && profile.role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      fetchData();
    }
  }, [user, profile, authLoading]);

  useEffect(() => {
    if (user) {
      fetchBranchMedicines();
    }
  }, [user, selectedBranchId, searchQuery, selectedCategory]);

  async function fetchData() {
    setLoading(true);
    try {
      const [rxRes, ordersRes] = await Promise.all([
        api.get('/api/prescriptions', { status: 'pending' }),
        api.get('/api/orders', { limit: 30 }),
      ]);
      setPendingPrescriptions(rxRes.data || []);
      setBranchOrders(ordersRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchBranchMedicines() {
    setLoadingMedicines(true);
    try {
      const params = {};
      if (selectedBranchId) params.branch_id = selectedBranchId;
      if (searchQuery) params.search = searchQuery;
      if (selectedCategory !== 'All') params.category = selectedCategory;

      const res = await api.get('/api/medicines', params);
      setMedicines(res.data || []);
    } catch (err) {
      console.error('Failed to load branch medicines:', err);
    } finally {
      setLoadingMedicines(false);
    }
  }

  const handleApproveRx = async (rxId) => {
    try {
      setPendingPrescriptions(prev => prev.filter(p => p.id !== rxId));
      await api.patch(`/api/prescriptions/${rxId}/status`, { status: 'approved' });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to approve prescription');
      fetchData();
    }
  };

  const handleRejectRx = async (rxId) => {
    const reason = prompt('Enter rejection reason:');
    if (!reason) return;
    try {
      setPendingPrescriptions(prev => prev.filter(p => p.id !== rxId));
      await api.patch(`/api/prescriptions/${rxId}/status`, { status: 'rejected', rejection_reason: reason });
      fetchData();
    } catch (err) {
      alert(err.message || 'Failed to reject prescription');
      fetchData();
    }
  };

  if (authLoading || !user) return null;

  const categories = ['All', 'Health Care', 'Personal Care', 'Baby Care', 'Wellness', 'Devices'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      
      {/* ════════════ 1. METRICS GRID ════════════ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Metric 1: Selected Branch */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center gap-4 hover:border-emerald-400 transition-all">
          <div className="w-11 h-11 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70">Selected Branch</p>
            <h3 className="text-sm font-black text-emerald-950 truncate">
              {selectedBranch?.name || 'All Branches'}
            </h3>
            <p className="text-[11px] font-medium text-emerald-700">Active Location</p>
          </div>
        </div>

        {/* Metric 2: Branch Medicines */}
        <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center gap-4 hover:border-emerald-400 transition-all">
          <div className="w-11 h-11 rounded-xl bg-teal-100/80 border border-teal-200 flex items-center justify-center text-teal-800 shrink-0">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.023.547l-1.121 1.121a2 2 0 000 2.828l1.121 1.121a2 2 0 002.828 0l1.121-1.121a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86L9.6 7.6a2 2 0 00-.547-1.023L7.932 5.456a2 2 0 00-2.828 0L3.983 6.577a2 2 0 000 2.828l1.121 1.121" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70">Branch Medicines</p>
            <h3 className="text-xl font-black text-emerald-950 font-mono">
              {medicines.length}
            </h3>
            <p className="text-[11px] font-medium text-teal-700">Total Products</p>
          </div>
        </div>

        {/* Metric 3: Pending Rx Reviews */}
        <Link
          href="/pharmacist/dashboard?tab=prescriptions"
          className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center gap-4 hover:border-amber-400 transition-all group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70">Pending Rx Reviews</p>
            <h3 className="text-xl font-black text-amber-700 font-mono">
              {pendingPrescriptions.length}
            </h3>
            <p className="text-[11px] font-medium text-amber-600">Requires Attention</p>
          </div>
        </Link>

        {/* Metric 4: Active Orders */}
        <Link
          href="/pharmacist/dashboard?tab=orders"
          className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex items-center gap-4 hover:border-emerald-400 transition-all group cursor-pointer"
        >
          <div className="w-11 h-11 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70">Active Orders</p>
            <h3 className="text-xl font-black text-emerald-700 font-mono">
              {branchOrders.length}
            </h3>
            <p className="text-[11px] font-medium text-emerald-600">In Progress</p>
          </div>
        </Link>

      </div>

      {/* ════════════ 2. MEDICINES PRESENT IN BRANCH ════════════ */}
      {activeTab === 'dashboard' && (
        <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-100">
            <div>
              <h2 className="text-base font-extrabold text-emerald-950 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.023.547l-1.121 1.121a2 2 0 000 2.828l1.121 1.121a2 2 0 002.828 0l1.121-1.121a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86L9.6 7.6a2 2 0 00-.547-1.023L7.932 5.456a2 2 0 00-2.828 0L3.983 6.577a2 2 0 000 2.828l1.121 1.121" />
                </svg>
                Medicines Inventory — {selectedBranch?.name || 'All Branches'}
              </h2>
              <p className="text-xs font-medium text-emerald-800/80 mt-0.5">
                Stock records and inventory status for {selectedBranch?.name ? `${selectedBranch.name} (${selectedBranch.city})` : 'all branches'}
              </p>
            </div>

            {/* Search & Category Filter Controls */}
            <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
              <div className="relative w-full sm:w-56">
                <input
                  type="text"
                  placeholder="Search medicine..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 outline-none focus:border-[#0D9488] focus:bg-white transition-all"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-none focus:border-[#0D9488] cursor-pointer"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat === 'All' ? 'All Categories' : cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Medicines Grid */}
          {loadingMedicines ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map(n => (
                <div key={n} className="h-44 bg-slate-100 rounded-2xl" />
              ))}
            </div>
          ) : medicines.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {medicines.map((m) => {
                const inStock = selectedBranchId ? (m.in_stock ?? m.branch_stock > 0) : true;
                return (
                  <div
                    key={m.id}
                    className="p-4 rounded-2xl border border-slate-200/80 hover:border-emerald-300 transition-all bg-white hover:shadow-md flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">{m.category}</span>
                        {m.requires_prescription && (
                          <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                            Rx Required
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#0D9488] transition-colors">{m.name}</h3>
                      <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{m.generic_name || m.name}</p>
                      <p className="text-xs text-slate-500 mt-1">{m.manufacturer || 'RxConnect'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <span className="text-sm font-black text-slate-900 font-mono">₹{Number(m.mrp).toFixed(2)}</span>
                        <span className="text-[10px] text-slate-400 ml-1">/ {m.unit || 'unit'}</span>
                      </div>

                      {/* Stock Badge */}
                      <div>
                        {inStock ? (
                          <span className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-emerald-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            In Stock
                          </span>
                        ) : (
                          <span className="bg-rose-50 text-rose-700 text-xs font-bold px-2.5 py-1 rounded-lg border border-rose-200 inline-flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Out of Stock
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400">
              <span className="text-3xl block mb-2">💊</span>
              <p className="text-xs font-semibold text-slate-600">No medicines found for the selected filter.</p>
            </div>
          )}

          {/* Bottom Footer Link */}
          <div className="mt-6 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/pharmacist/update_stock"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#044E3B] transition-colors"
            >
              <span>View All Medicines & Manage Stock</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>

        </div>
      )}

      {/* ════════════ 3. BOTTOM SECTION (Prescriptions & Orders) ════════════ */}
      <div className={`grid gap-8 items-start ${activeTab === 'dashboard' ? 'lg:grid-cols-2' : 'grid-cols-1'}`}>
        
        {/* Pending Prescription Verification Queue (Shown on Dashboard or Prescriptions tab) */}
        {(activeTab === 'dashboard' || activeTab === 'prescriptions') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Pending Prescription Verification Queue
                  {pendingPrescriptions.length > 0 && (
                    <span className="bg-amber-50 text-amber-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-amber-200">
                      {pendingPrescriptions.length} Pending
                    </span>
                  )}
                </h2>

                {activeTab === 'prescriptions' && (
                  <Link href="/pharmacist/dashboard" className="text-xs font-bold text-[#0D9488] hover:underline">
                    ← Back to Dashboard Overview
                  </Link>
                )}
              </div>

              {loading ? (
                <p className="text-xs text-slate-400">Loading prescription queue...</p>
              ) : pendingPrescriptions.length > 0 ? (
                <div className="space-y-4">
                  {(activeTab === 'prescriptions' ? pendingPrescriptions : pendingPrescriptions.slice(0, 4)).map((rx) => {
                    const custInitials = (rx.customer?.full_name || 'Patient')
                      .split(' ')
                      .map(n => n[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <div
                        key={rx.id}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 space-y-3 hover:border-slate-300 transition-colors"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-extrabold text-xs flex items-center justify-center shrink-0">
                              {custInitials}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                                {rx.customer?.full_name || 'Patient'}
                              </h4>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Uploaded on {new Date(rx.uploaded_at || rx.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>

                          <a
                            href={rx.file_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-bold text-slate-700 hover:text-emerald-700 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5 self-start sm:self-auto"
                          >
                            <span>View Prescription File</span>
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>

                        {rx.notes && (
                          <p className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200/80 leading-relaxed">
                            <strong>Notes:</strong> {rx.notes}
                          </p>
                        )}

                        <div className="flex items-center justify-end gap-2.5 pt-1">
                          <button
                            onClick={() => handleApproveRx(rx.id)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-emerald-900/10 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Approve</span>
                            <span>✓</span>
                          </button>
                          <button
                            onClick={() => handleRejectRx(rx.id)}
                            className="bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-rose-900/10 transition-all cursor-pointer flex items-center gap-1.5"
                          >
                            <span>Reject</span>
                            <span>✕</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <span className="text-3xl block mb-2">✅</span>
                  <p className="text-xs font-semibold text-slate-600">No prescriptions currently pending review.</p>
                </div>
              )}
            </div>

            {activeTab !== 'prescriptions' && (
              <div className="mt-4 text-center">
                <Link
                  href="/pharmacist/dashboard?tab=prescriptions"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#044E3B] transition-colors"
                >
                  <span>View All Pending Prescriptions</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Branch Orders Fulfillment (Shown on Dashboard or Orders tab) */}
        {(activeTab === 'dashboard' || activeTab === 'orders') && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div>
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  Branch Orders Fulfillment
                  {branchOrders.length > 0 && (
                    <span className="bg-emerald-50 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {branchOrders.length} Orders
                    </span>
                  )}
                </h2>

                {activeTab === 'orders' && (
                  <Link href="/pharmacist/dashboard" className="text-xs font-bold text-[#0D9488] hover:underline">
                    ← Back to Dashboard Overview
                  </Link>
                )}
              </div>

              {branchOrders.length > 0 ? (
                <div className="space-y-3">
                  {(activeTab === 'orders' ? branchOrders : branchOrders.slice(0, 5)).map((o) => {
                    let statusPillClass = 'bg-slate-100 text-slate-700 border-slate-200';
                    if (o.status === 'delivered') statusPillClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    else if (o.status === 'ready') statusPillClass = 'bg-sky-50 text-sky-700 border-sky-200';
                    else if (o.status === 'placed' || o.status === 'processing') statusPillClass = 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <div
                        key={o.id}
                        className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 flex items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                              {o.order_number}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              ({o.customer?.full_name || 'Customer'})
                            </span>
                          </div>
                          {o.placed_at && (
                            <span className="text-[10px] text-slate-400 block mt-1">
                              Placed on {new Date(o.placed_at).toLocaleDateString('en-IN')}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-xs sm:text-sm font-black text-slate-900 font-mono">
                            ₹{Number(o.total || 0).toFixed(2)}
                          </span>
                          <span className={`text-[11px] font-bold px-3 py-1 rounded-full border capitalize ${statusPillClass}`}>
                            {o.status?.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-10 text-slate-400">
                  <span className="text-3xl block mb-2">📦</span>
                  <p className="text-xs font-semibold text-slate-600">No active branch orders.</p>
                </div>
              )}
            </div>

            {activeTab !== 'orders' && (
              <div className="mt-4 text-center">
                <Link
                  href="/pharmacist/dashboard?tab=orders"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:text-[#044E3B] transition-colors"
                >
                  <span>View All Orders</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

export default function PharmacistDashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-24 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    }>
      <PharmacistDashboardContent />
    </Suspense>
  );
}



