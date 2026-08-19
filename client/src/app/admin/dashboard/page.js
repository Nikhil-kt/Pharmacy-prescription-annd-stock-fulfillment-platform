'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

function AdminDashboardContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState('orders');
  // 'orders' | 'branches' | 'performance' | 'lowstock' | 'prescriptions' | 'medicines' | 'staff'

  // Data states
  const [orders, setOrders] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [branches, setBranches] = useState([]);
  const [pendingStaff, setPendingStaff] = useState([]);
  const [orderStats, setOrderStats] = useState({ total_orders: 0, today_orders: 0, order_success: 0, order_failure: 0 });
  const [loading, setLoading] = useState(true);

  // Low Stock States
  const [lowStockItems, setLowStockItems] = useState([]);
  const [showLowStockModal, setShowLowStockModal] = useState(false);
  const [selectedLowStockItem, setSelectedLowStockItem] = useState(null);
  const [adjustQtyInput, setAdjustQtyInput] = useState('');
  const [adjustingStock, setAdjustingStock] = useState(false);

  // Prescription Logs States
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0]; // YYYY-MM-DD
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [loadingPrescriptions, setLoadingPrescriptions] = useState(false);
  const [previewPrescriptionUrl, setPreviewPrescriptionUrl] = useState(null);

  // Branch statistics state
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [branchStats, setBranchStats] = useState(null);
  const [allBranchStatsMap, setAllBranchStatsMap] = useState({});
  const [loadingBranchStats, setLoadingBranchStats] = useState(false);

  // New Medicine Modal / Form State
  const [showAddMed, setShowAddMed] = useState(false);
  const [newMed, setNewMed] = useState({
    name: '',
    generic_name: '',
    manufacturer: '',
    category: 'Medicines',
    mrp: '',
    image_url: '',
    description: '',
    requires_prescription: false,
  });

  // Staff assignment state — tracks selected branch per pending user
  const [branchAssignments, setBranchAssignments] = useState({});
  const [staffActionLoading, setStaffActionLoading] = useState({});

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (user && profile?.role === 'admin') {
      fetchDashboardData();
    }
  }, [user, profile, authLoading]);

  // Fetch prescriptions when selectedDate changes or user lands on prescriptions tab
  useEffect(() => {
    if (user && profile?.role === 'admin') {
      fetchPrescriptionsByDate(selectedDate);
    }
  }, [selectedDate, user, profile]);

  async function fetchDashboardData() {
    setLoading(true);
    try {
      const [ordersRes, medRes, branchRes, pendingRes, orderStatsRes, lowStockRes] = await Promise.all([
        api.get('/api/orders', { limit: 50 }),
        api.get('/api/medicines', { limit: 50 }),
        api.get('/api/branches', { limit: 50 }),
        api.get('/api/profiles/pending'),
        api.get('/api/orders/stats'),
        api.get('/api/inventory/low-stock-all'),
      ]);

      setOrders(ordersRes.data || []);
      setMedicines(medRes.data || []);
      const fetchedBranches = branchRes.data || [];
      setBranches(fetchedBranches);
      setPendingStaff(pendingRes.data || []);
      setLowStockItems(lowStockRes.data || []);

      if (orderStatsRes?.data) {
        setOrderStats(orderStatsRes.data);
      }

      // Pre-fetch all branch stats for performance comparison tab
      if (fetchedBranches.length > 0) {
        const statsPromises = fetchedBranches.map(b =>
          api.get(`/api/branches/${b.id}/stats`).then(res => ({ id: b.id, stats: res.data })).catch(() => null)
        );
        const statsResults = await Promise.all(statsPromises);
        const map = {};
        statsResults.forEach(item => {
          if (item) map[item.id] = item.stats;
        });
        setAllBranchStatsMap(map);
      }
    } catch (e) {
      console.error('Failed to fetch dashboard data:', e);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPrescriptionsByDate(dateStr) {
    setLoadingPrescriptions(true);
    try {
      const res = await api.get('/api/prescriptions', { date: dateStr, limit: 100 });
      setPrescriptions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch prescriptions:', err);
    } finally {
      setLoadingPrescriptions(false);
    }
  }

  const handleSelectBranchForStats = async (branch) => {
    setSelectedBranch(branch);
    setLoadingBranchStats(true);
    setBranchStats(null);
    try {
      const res = await api.get(`/api/branches/${branch.id}/stats`);
      setBranchStats(res.data);
    } catch (err) {
      console.error('Failed to fetch branch stats:', err);
    } finally {
      setLoadingBranchStats(false);
    }
  };

  const handleAdjustStock = async (e) => {
    e.preventDefault();
    if (!selectedLowStockItem || !adjustQtyInput) return;
    const addQty = parseInt(adjustQtyInput);
    if (isNaN(addQty)) return;

    setAdjustingStock(true);
    try {
      await api.patch('/api/inventory/adjust', {
        inventory_id: selectedLowStockItem.id,
        change_qty: addQty,
        reason: 'Restocked by Admin',
      });
      alert('Stock adjusted successfully!');
      setAdjustQtyInput('');
      setSelectedLowStockItem(null);
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to adjust stock.');
    } finally {
      setAdjustingStock(false);
    }
  };

  const handleCreateMedicine = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/medicines', {
        ...newMed,
        mrp: parseFloat(newMed.mrp),
      });
      setShowAddMed(false);
      setNewMed({
        name: '',
        generic_name: '',
        manufacturer: '',
        category: 'Medicines',
        mrp: '',
        image_url: '',
        description: '',
        requires_prescription: false,
      });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to create medicine');
    }
  };

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      fetchDashboardData();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    }
  };

  const handleApproveStaff = async (userId) => {
    const branchId = branchAssignments[userId];
    if (!branchId) {
      alert('Please select a branch before approving.');
      return;
    }

    setStaffActionLoading((prev) => ({ ...prev, [userId]: 'approve' }));
    try {
      await api.post('/api/branch-staff', {
        branch_id: branchId,
        user_id: userId,
        staff_role: 'pharmacist',
      });
      setPendingStaff((prev) => prev.filter((p) => p.id !== userId));
      setBranchAssignments((prev) => {
        const copy = { ...prev };
        delete copy[userId];
        return copy;
      });
    } catch (err) {
      alert(err.message || 'Failed to approve staff.');
    } finally {
      setStaffActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  const handleRejectStaff = async (userId) => {
    if (!confirm('Are you sure you want to reject this registration?')) return;

    setStaffActionLoading((prev) => ({ ...prev, [userId]: 'reject' }));
    try {
      await api.patch(`/api/profiles/${userId}/reject`);
      setPendingStaff((prev) => prev.filter((p) => p.id !== userId));
    } catch (err) {
      alert(err.message || 'Failed to reject registration.');
    } finally {
      setStaffActionLoading((prev) => ({ ...prev, [userId]: null }));
    }
  };

  if (authLoading || (profile && profile.role !== 'admin')) return null;

  return (
    <div className="bg-slate-50/50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <svg className="w-6 h-6 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.023.547l-1.121 1.121a2 2 0 000 2.828l1.121 1.121a2 2 0 002.828 0l1.121-1.121a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86L9.6 7.6a2 2 0 00-.547-1.023L7.932 5.456a2 2 0 00-2.828 0L3.983 6.577a2 2 0 000 2.828l1.121 1.121" />
              </svg>
              Admin Headquarters
            </h1>
            <p className="text-xs font-medium text-slate-500 mt-1">Manage orders, catalog, branches, branch performance, and prescriptions.</p>
          </div>
          <span className="bg-[#0D9488] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider shadow-sm">
            Admin Portal Active
          </span>
        </div>

        {/* Global Overview Stats Grid (Pharmacist UI Style) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">

          {/* Card 1: TODAY'S TOTAL ORDERS */}
          <div className="bg-white rounded-2xl p-5 border border-indigo-200/80 shadow-xs flex flex-col justify-center hover:border-indigo-400 transition-all">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl bg-indigo-100/80 border border-indigo-200 flex items-center justify-center text-indigo-800 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-800/70">Today's Orders</p>
                <h3 className="text-xl font-black text-indigo-950 font-mono">{orderStats.today_orders ?? 0}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-indigo-600/80 mt-1">Lifetime total: {orderStats.total_orders}</p>
          </div>

          {/* Card 2: SUCCESSFUL ORDERS */}
          <div className="bg-white rounded-2xl p-5 border border-emerald-200/80 shadow-xs flex flex-col justify-center hover:border-emerald-400 transition-all">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl bg-emerald-100/80 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-800/70">Success</p>
                <h3 className="text-xl font-black text-emerald-950 font-mono">{orderStats.order_success}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-emerald-600/80 mt-1">Fulfilled / delivered</p>
          </div>

          {/* Card 3: FAILED ORDERS */}
          <div className="bg-white rounded-2xl p-5 border border-rose-200/80 shadow-xs flex flex-col justify-center hover:border-rose-400 transition-all">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl bg-rose-100/80 border border-rose-200 flex items-center justify-center text-rose-800 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-800/70">Failures</p>
                <h3 className="text-xl font-black text-rose-950 font-mono">{orderStats.order_failure}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-rose-600/80 mt-1">Cancelled order count</p>
          </div>

          {/* Card 4: LOW STOCK ALERTS */}
          <div
            onClick={() => setShowLowStockModal(true)}
            className="bg-white rounded-2xl p-5 border border-amber-200/80 shadow-xs flex flex-col justify-center hover:border-amber-400 hover:bg-amber-50/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl bg-amber-100/80 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-amber-800/70">Low Stock</p>
                <h3 className="text-xl font-black text-amber-700 font-mono">{lowStockItems.length}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-amber-600/80 mt-1 group-hover:text-amber-800">Click to inspect →</p>
          </div>

          {/* Card 5: PENDING STAFF */}
          <div className="bg-white rounded-2xl p-5 border border-purple-200/80 shadow-xs flex flex-col justify-center hover:border-purple-400 transition-all relative">
            <div className="flex items-center gap-4 mb-2">
              <div className="w-11 h-11 rounded-xl bg-purple-100/80 border border-purple-200 flex items-center justify-center text-purple-700 shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-purple-800/70">Staff Approvals</p>
                <h3 className="text-xl font-black text-purple-950 font-mono">{pendingStaff.length}</h3>
              </div>
            </div>
            {pendingStaff.length > 0 && (
              <span className="absolute top-4 right-4 w-2.5 h-2.5 bg-purple-500 rounded-full animate-pulse"></span>
            )}
            <p className="text-[10px] font-medium text-purple-600/80 mt-1">Pending signups</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'orders', label: 'Orders' },
            { id: 'branches', label: 'Branches' },
            { id: 'performance', label: 'Performance' },
            { id: 'lowstock', label: `Low Stock (${lowStockItems.length})` },
            { id: 'prescriptions', label: 'Prescriptions' },
            { id: 'medicines', label: 'Medicines' },
            { id: 'staff', label: `Staff Mgmt` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#0D9488] text-[#0D9488]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'staff' && pendingStaff.length > 0 && (
                <span className="ml-2 bg-purple-100 text-purple-700 text-[9px] font-black px-1.5 py-0.5 rounded-full inline-block align-middle">
                  {pendingStaff.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════ TAB 1: ORDERS MANAGEMENT ═══════════ */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                All Branch Orders ({orders.length})
              </h2>
            </div>
            
            {loading ? (
              <p className="text-xs text-slate-400 animate-pulse">Loading orders...</p>
            ) : orders.length > 0 ? (
              <div className="space-y-3">
                {orders.map((o) => {
                  let statusPillClass = 'bg-slate-100 text-slate-700 border-slate-200';
                  if (o.status === 'delivered') statusPillClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                  else if (o.status === 'ready' || o.status === 'out_for_delivery_partner') statusPillClass = 'bg-sky-50 text-sky-700 border-sky-200';
                  else if (o.status === 'placed' || o.status === 'confirmed' || o.status === 'processing') statusPillClass = 'bg-amber-50 text-amber-700 border-amber-200';
                  else if (o.status === 'cancelled') statusPillClass = 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <div
                      key={o.id}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-mono text-xs font-bold text-slate-900 bg-white border border-slate-200 px-2 py-0.5 rounded-lg">
                            {o.order_number}
                          </span>
                          <span className="text-xs text-slate-700 font-bold">
                            {o.customer?.full_name || 'Customer'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                          <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold">🏬 {o.branch?.name || 'Store'}</span>
                          {o.placed_at && <span>• {new Date(o.placed_at).toLocaleDateString('en-IN')}</span>}
                        </div>
                      </div>

                      <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
                        <span className="text-sm font-black text-slate-900 font-mono">
                          ₹{Number(o.total || 0).toFixed(2)}
                        </span>
                        
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border capitalize ${statusPillClass}`}>
                            {o.status?.replace(/_/g, ' ')}
                          </span>
                          
                          <select
                            value={o.status}
                            onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                            className="border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold outline-none bg-white text-slate-700 focus:border-[#0D9488]"
                          >
                            {['placed', 'confirmed', 'processing', 'ready', 'out_for_delivery_partner', 'delivered', 'cancelled'].map(
                              (s) => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <span className="text-3xl block mb-2">📦</span>
                <p className="text-xs font-semibold text-slate-600">No active orders found.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 2: BRANCH PERFORMANCE ═══════════ */}
        {activeTab === 'performance' && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Branch Performance Comparison</h2>
                <p className="text-xs text-slate-500 mt-0.5">Comparative analytics across all branch locations.</p>
              </div>
              <span className="bg-[#0D9488]/10 text-[#0D9488] text-xs font-bold px-3 py-1.5 rounded-full border border-[#0D9488]/20">
                {branches.length} Branches
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {branches.map((b, index) => {
                const stats = allBranchStatsMap[b.id] || {
                  total_orders: 0, order_success: 0, order_failure: 0, low_stock_count: 0, top_selling_product: { name: 'N/A', total_sold: 0 },
                };
                const successRate = stats.total_orders > 0 ? Math.round((stats.order_success / stats.total_orders) * 100) : 100;

                return (
                  <div key={b.id} className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 shadow-xs hover:border-[#0D9488]/50 transition-all relative">
                    {index === 0 && (
                      <span className="absolute -top-3 -right-2 bg-amber-400 text-amber-950 font-black text-[9px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow-sm border border-amber-300 z-10">
                        ⭐ Top Branch
                      </span>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20 flex items-center justify-center font-bold text-lg">
                        🏬
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{b.name}</h3>
                        <p className="text-[10px] text-slate-500 font-mono font-semibold">{b.code} • {b.city}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-4 bg-white p-3 rounded-xl border border-slate-100">
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</span>
                        <p className="text-xl font-black text-slate-900 font-mono mt-0.5">{stats.total_orders}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Success Rate</span>
                        <p className="text-xl font-black text-emerald-600 font-mono mt-0.5">{successRate}%</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Failed</span>
                        <p className="text-xs font-black text-rose-600 font-mono mt-0.5">{stats.order_failure}</p>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Low Stock</span>
                        <p className="text-xs font-black text-amber-600 font-mono mt-0.5">{stats.low_stock_count}</p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-bold uppercase tracking-wide text-[9px]">Top Product:</span>
                      <span className="font-black text-slate-800 truncate max-w-[140px] text-right" title={stats.top_selling_product?.name}>
                        🏆 {stats.top_selling_product?.name || 'N/A'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 3: BRANCH MANAGEMENT ═══════════ */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-1">Pharmacy Branches Management</h2>
              <p className="text-xs text-slate-500 mb-6">Click on any branch card to inspect detailed statistics (low stock, top selling products, order success rates).</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
                {branches.map((b) => {
                  const isSelected = selectedBranch?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBranchForStats(b)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-[#0D9488] bg-[#0D9488]/5 shadow-sm scale-[1.02]'
                          : 'border-slate-100 bg-slate-50 hover:border-[#0D9488]/40 hover:shadow-sm'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-sm text-slate-900">{b.name}</span>
                          <span className="bg-white border border-slate-200 text-slate-700 font-mono font-bold text-[10px] px-2 py-0.5 rounded-lg shadow-sm">
                            {b.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 font-medium">📍 {b.address}, {b.city}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold text-[#0D9488]">
                        <span>Inspect Statistics</span>
                        <span>📊 →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Branch Detailed Statistics Panel */}
            {selectedBranch && (
              <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-md border-2 border-[#0D9488]/20 animate-in fade-in duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-4 mb-6 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏬</span>
                      <h3 className="text-lg font-black text-slate-900">{selectedBranch.name} ({selectedBranch.code})</h3>
                    </div>
                    <p className="text-xs font-medium text-slate-500 mt-1">Full Branch Performance Analytics</p>
                  </div>
                  <button
                    onClick={() => { setSelectedBranch(null); setBranchStats(null); }}
                    className="text-[10px] font-bold text-slate-500 hover:text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 uppercase tracking-wider"
                  >
                    Close Statistics ✕
                  </button>
                </div>

                {loadingBranchStats ? (
                  <div className="py-12 text-center text-xs text-slate-400 animate-pulse font-semibold">
                    <span className="text-3xl block mb-2">📊</span>
                    Loading statistics for {selectedBranch.name}...
                  </div>
                ) : branchStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl text-center">
                      <span className="text-2xl block mb-1">📦</span>
                      <span className="text-[10px] font-black text-blue-800 uppercase tracking-wider">Total Orders</span>
                      <p className="text-2xl font-black text-blue-950 font-mono mt-1">{branchStats.total_orders}</p>
                    </div>

                    <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-2xl text-center">
                      <span className="text-2xl block mb-1">✅</span>
                      <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider">Success</span>
                      <p className="text-2xl font-black text-emerald-950 font-mono mt-1">{branchStats.order_success}</p>
                    </div>

                    <div className="bg-rose-50/50 border border-rose-100 p-4 rounded-2xl text-center">
                      <span className="text-2xl block mb-1">❌</span>
                      <span className="text-[10px] font-black text-rose-800 uppercase tracking-wider">Failures</span>
                      <p className="text-2xl font-black text-rose-950 font-mono mt-1">{branchStats.order_failure}</p>
                    </div>

                    <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl text-center">
                      <span className="text-2xl block mb-1">⚠️</span>
                      <span className="text-[10px] font-black text-amber-800 uppercase tracking-wider">Low Stock</span>
                      <p className="text-2xl font-black text-amber-950 font-mono mt-1">{branchStats.low_stock_count}</p>
                    </div>

                    <div className="bg-purple-50/50 border border-purple-100 p-4 rounded-2xl text-center col-span-2 md:col-span-1 flex flex-col justify-center">
                      <span className="text-2xl block mb-1">🏆</span>
                      <span className="text-[10px] font-black text-purple-800 uppercase tracking-wider">Top Selling</span>
                      <p className="text-sm font-black text-purple-950 mt-1 truncate px-1" title={branchStats.top_selling_product?.name}>
                        {branchStats.top_selling_product?.name || 'N/A'}
                      </p>
                      <span className="text-[10px] text-purple-600 font-bold mt-0.5">
                        {branchStats.top_selling_product?.total_sold ? `${branchStats.top_selling_product.total_sold} units sold` : 'No sales yet'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs font-semibold text-slate-400">Failed to load statistics.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 4: LOW STOCK ALERTS ═══════════ */}
        {activeTab === 'lowstock' && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Low Stock Inventory Center</h2>
                <p className="text-xs text-slate-500 mt-0.5">Click any product to view details and adjust stock levels.</p>
              </div>
              <span className="bg-amber-100 text-amber-800 text-[10px] font-black px-3 py-1.5 rounded-lg border border-amber-200 uppercase tracking-wider">
                ⚠️ {lowStockItems.length} items low
              </span>
            </div>

            {lowStockItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedLowStockItem(item)}
                    className="bg-amber-50/40 border border-amber-200/70 rounded-2xl p-4 cursor-pointer hover:shadow-sm hover:border-amber-400 transition-all flex flex-col justify-between group"
                  >
                    <div className="flex items-start gap-3">
                      {item.medicine?.image_url ? (
                        <img src={item.medicine.image_url} alt={item.medicine.name} className="w-12 h-12 object-contain bg-white rounded-xl border border-amber-100 shrink-0 p-1" />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-amber-100/80 text-amber-700 flex items-center justify-center font-bold text-xl border border-amber-200 shrink-0">
                          💊
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-amber-800 transition-colors">{item.medicine?.name}</h3>
                        <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">{item.medicine?.generic_name || 'N/A'}</p>
                        <p className="text-[10px] font-black text-amber-700 mt-1.5 bg-amber-100/50 inline-block px-1.5 py-0.5 rounded">🏬 {item.branch?.name}</p>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-amber-200/50 flex items-center justify-between">
                      <div className="flex items-baseline gap-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Qty:</span>
                        <span className="font-black text-rose-600 font-mono text-sm">{item.quantity}</span>
                        <span className="text-slate-400 text-[10px] font-mono">/ {item.low_stock_threshold}</span>
                      </div>
                      <span className="text-amber-700 font-bold text-[10px] uppercase tracking-wider">Inspect →</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <span className="text-3xl block mb-2">🎉</span>
                <p className="text-xs font-semibold text-slate-600">No low stock items across any branch!</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 5: PRESCRIPTIONS ═══════════ */}
        {activeTab === 'prescriptions' && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 pb-4 border-b border-slate-100 gap-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Prescription Master Log
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Filter and review prescription uploads.</p>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-[11px] font-black font-mono text-slate-800 outline-none focus:border-[#0D9488]"
                />
                <button
                  onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                  className="bg-[#0D9488] text-white hover:bg-[#044E3B] text-[10px] font-bold px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors"
                >
                  Today
                </button>
              </div>
            </div>

            {loadingPrescriptions ? (
              <p className="text-center py-6 text-xs font-semibold text-slate-400 animate-pulse">Loading logs...</p>
            ) : prescriptions.length > 0 ? (
              <div className="space-y-4">
                {prescriptions.map((rx) => {
                  const custInitials = (rx.customer?.full_name || 'Patient').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={rx.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-300 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#0D9488]/10 text-[#0D9488] border border-[#0D9488]/20 font-black text-xs flex items-center justify-center shrink-0">
                          {custInitials}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-900 leading-tight">
                            {rx.customer?.full_name || 'Patient'}
                            <span className="text-[10px] text-slate-500 font-mono font-medium ml-2">({rx.customer?.phone || 'No Phone'})</span>
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] font-bold text-slate-500">
                              Uploaded {new Date(rx.uploaded_at).toLocaleString('en-IN', { hour12: true, month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-slate-500">Reviewer: {rx.reviewer?.full_name || 'Pending'}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <span className={`font-black px-2.5 py-1 rounded-lg border text-[10px] uppercase tracking-wider ${
                            rx.status === 'approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            rx.status === 'rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>
                          {rx.status}
                        </span>
                        {rx.file_url ? (
                          <button
                            onClick={() => setPreviewPrescriptionUrl(rx.file_url)}
                            className="bg-white text-slate-700 hover:text-[#0D9488] border border-slate-200 font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-sm transition-colors"
                          >
                            View 📄
                          </button>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">No File</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-10 text-slate-400">
                <span className="text-3xl block mb-2">✅</span>
                <p className="text-xs font-semibold text-slate-600">No prescriptions logged for {selectedDate}.</p>
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 6: MEDICINES CATALOG ═══════════ */}
        {activeTab === 'medicines' && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-emerald-100">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L5.6 15.12a2 2 0 00-1.023.547l-1.121 1.121a2 2 0 000 2.828l1.121 1.121a2 2 0 002.828 0l1.121-1.121a2 2 0 00.547-1.022l.477-2.387a6 6 0 00-.517-3.86l-.158-.318a6 6 0 01-.517-3.86L9.6 7.6a2 2 0 00-.547-1.023L7.932 5.456a2 2 0 00-2.828 0L3.983 6.577a2 2 0 000 2.828l1.121 1.121" />
                  </svg>
                  Global Medicines Catalog
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Manage the central product registry.</p>
              </div>
              <button
                onClick={() => setShowAddMed(!showAddMed)}
                className="bg-[#0D9488] text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl hover:bg-[#044E3B] shadow-md shadow-[#0D9488]/20 transition-all self-start md:self-auto"
              >
                + Add Medicine
              </button>
            </div>

            {showAddMed && (
              <form onSubmit={handleCreateMedicine} className="bg-slate-50 p-5 rounded-2xl mb-6 space-y-4 border border-slate-200">
                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Create New Registry Entry</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <input type="text" placeholder="Brand Name *" value={newMed.name} onChange={(e) => setNewMed({ ...newMed, name: e.target.value })} required className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D9488] bg-white" />
                  <input type="text" placeholder="Generic Name" value={newMed.generic_name} onChange={(e) => setNewMed({ ...newMed, generic_name: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D9488] bg-white" />
                  <input type="text" placeholder="Manufacturer" value={newMed.manufacturer} onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D9488] bg-white" />
                  
                  <select value={newMed.category} onChange={(e) => setNewMed({ ...newMed, category: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-[#0D9488] bg-white text-slate-700">
                    {['Medicines', 'Health Care', 'Personal Care', 'Baby Care', 'Devices', 'Wellness'].map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  
                  <input type="number" step="0.01" placeholder="Base MRP (₹) *" value={newMed.mrp} onChange={(e) => setNewMed({ ...newMed, mrp: e.target.value })} required className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D9488] bg-white" />
                  <input type="url" placeholder="Image URL (Optional)" value={newMed.image_url} onChange={(e) => setNewMed({ ...newMed, image_url: e.target.value })} className="px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D9488] bg-white" />
                </div>
                <div>
                  <textarea placeholder="Description" value={newMed.description} onChange={(e) => setNewMed({ ...newMed, description: e.target.value })} rows="2" className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-medium outline-none focus:border-[#0D9488] bg-white" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" id="req_rx_admin" checked={newMed.requires_prescription} onChange={(e) => setNewMed({ ...newMed, requires_prescription: e.target.checked })} className="w-4 h-4 accent-[#0D9488]" />
                  <label htmlFor="req_rx_admin" className="text-xs font-bold text-slate-600">Requires Prescription (Rx)</label>
                </div>
                <div className="pt-2">
                  <button type="submit" className="bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-5 py-2 rounded-xl hover:bg-slate-900 transition-colors">
                    Save to Catalog
                  </button>
                </div>
              </form>
            )}

            {/* Medicines Grid (Matching Pharmacist UI) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {medicines.map((m) => (
                <div key={m.id} className="p-4 rounded-2xl border border-slate-200/80 hover:border-[#0D9488]/40 transition-all bg-white hover:shadow-md flex flex-col justify-between group">
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider">{m.category}</span>
                      {m.requires_prescription && (
                        <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[9px] font-black px-2 py-0.5 rounded-lg shrink-0 uppercase tracking-wider">
                          Rx Reqd
                        </span>
                      )}
                    </div>
                    {m.image_url ? (
                        <img src={m.image_url} alt={m.name} className="h-16 w-auto object-contain mb-3 rounded mix-blend-multiply" />
                    ) : (
                       <div className="h-16 w-16 mb-3 rounded-xl bg-slate-50 flex items-center justify-center text-2xl border border-slate-100">💊</div>
                    )}

                    <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#0D9488] transition-colors">{m.name}</h3>
                    <p className="text-[10px] font-semibold text-slate-500 line-clamp-1 mt-0.5">{m.generic_name || m.name}</p>
                    <p className="text-[10px] font-medium text-slate-400 mt-1">{m.manufacturer || 'General'}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-sm font-black text-slate-900 font-mono">₹{Number(m.mrp).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {medicines.length === 0 && !loading && (
               <div className="py-12 text-center text-slate-400 font-semibold text-xs">No medicines in catalog.</div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 7: STAFF MANAGEMENT ═══════════ */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-2xl p-6 sm:p-7 border border-emerald-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">Staff Registrations</h2>
                <p className="text-xs text-slate-500 mt-0.5">Review pending pharmacist signups and assign branches.</p>
              </div>
              {pendingStaff.length > 0 && (
                <span className="bg-purple-100 text-purple-800 border border-purple-200 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
                  {pendingStaff.length} pending
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-xs font-semibold text-slate-400">Loading pending registrations...</p>
            ) : pendingStaff.length > 0 ? (
              <div className="space-y-4">
                {pendingStaff.map((p) => (
                  <div key={p.id} className="p-4 sm:p-5 rounded-2xl border border-slate-200/80 bg-slate-50/40 flex flex-col md:flex-row md:items-center justify-between gap-5 hover:border-slate-300 transition-colors">
                    <div className="flex items-center gap-3 min-w-[200px]">
                      <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                         {(p.full_name || 'U').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <span className="font-bold text-sm text-slate-900 block">{p.full_name || 'Unnamed'}</span>
                        <span className="text-[10px] font-medium text-slate-500 block mt-0.5">{p.email || p.id.slice(0, 8)} • {p.phone || 'No Phone'}</span>
                        <span className="bg-blue-50 text-blue-700 font-black px-2 py-0.5 rounded border border-blue-200 text-[9px] uppercase tracking-wider inline-block mt-1">
                          Role: {p.role}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 flex flex-col md:flex-row items-start md:items-center justify-end gap-4">
                      <div className="w-full md:w-auto">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-wider block mb-1">Assign Branch</label>
                        <select
                          value={branchAssignments[p.id] || ''}
                          onChange={(e) => setBranchAssignments((prev) => ({ ...prev, [p.id]: e.target.value }))}
                          className="w-full md:w-auto border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold outline-none bg-white text-slate-700 focus:border-[#0D9488]"
                        >
                          <option value="">Select branch...</option>
                          {branches.map((b) => (
                            <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full md:w-auto mt-2 md:mt-0 pt-2 md:pt-0">
                        <button
                          onClick={() => handleApproveStaff(p.id)}
                          disabled={staffActionLoading[p.id] === 'approve' || !branchAssignments[p.id]}
                          className="flex-1 md:flex-none bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-emerald-900/10"
                        >
                          {staffActionLoading[p.id] === 'approve' ? '...' : '✓ Approve'}
                        </button>
                        <button
                          onClick={() => handleRejectStaff(p.id)}
                          disabled={staffActionLoading[p.id] === 'reject'}
                          className="flex-1 md:flex-none bg-white hover:bg-rose-50 text-rose-600 font-bold text-[11px] uppercase tracking-wider px-4 py-2 rounded-xl transition-colors border border-rose-200"
                        >
                          {staffActionLoading[p.id] === 'reject' ? '...' : '✕ Reject'}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-bold text-slate-900">All caught up!</p>
                <p className="text-[11px] font-medium text-slate-500 mt-1">No pending registrations to review.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ LOW STOCK ITEM DETAILS MODAL ═══════════ */}
      {(showLowStockModal || selectedLowStockItem) && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                <h3 className="font-bold text-slate-900 text-lg">Low Stock Action</h3>
              </div>
              <button
                onClick={() => { setShowLowStockModal(false); setSelectedLowStockItem(null); }}
                className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>

            {selectedLowStockItem ? (
              <div className="space-y-5">
                <div className="flex gap-4 items-start bg-amber-50/50 p-4 rounded-2xl border border-amber-200">
                  {selectedLowStockItem.medicine?.image_url ? (
                    <img src={selectedLowStockItem.medicine.image_url} alt={selectedLowStockItem.medicine.name} className="w-16 h-16 object-contain bg-white rounded-xl border border-amber-100 p-1 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 border border-amber-200">💊</div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-900 text-base">{selectedLowStockItem.medicine?.name}</h4>
                    <p className="text-xs font-semibold text-slate-600">Gen: {selectedLowStockItem.medicine?.generic_name || 'N/A'}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{selectedLowStockItem.medicine?.category} • ₹{selectedLowStockItem.medicine?.mrp}</p>
                    <p className="text-[#0D9488] font-bold text-xs mt-1 bg-[#0D9488]/10 inline-block px-2 py-1 rounded-lg">🏬 {selectedLowStockItem.branch?.name} ({selectedLowStockItem.branch?.city})</p>
                  </div>
                </div>

                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex justify-between font-bold text-sm">
                  <span className="text-slate-600">Current Qty: <span className="text-rose-600 font-black font-mono ml-1">{selectedLowStockItem.quantity}</span></span>
                  <span className="text-slate-600">Threshold: <span className="text-slate-900 font-mono ml-1">{selectedLowStockItem.low_stock_threshold}</span></span>
                </div>

                <form onSubmit={handleAdjustStock} className="space-y-3 pt-2 border-t border-slate-100">
                  <label className="font-black text-slate-900 text-[11px] uppercase tracking-wider block">Quick Admin Restock</label>
                  <div className="flex gap-3">
                    <input
                      type="number"
                      placeholder="Qty to add"
                      value={adjustQtyInput}
                      onChange={(e) => setAdjustQtyInput(e.target.value)}
                      className="border border-slate-300 rounded-xl px-4 py-2.5 text-sm font-bold text-slate-900 flex-1 outline-none focus:border-[#0D9488]"
                      required
                    />
                    <button type="submit" disabled={adjustingStock} className="bg-[#0D9488] hover:bg-[#044E3B] text-white font-bold px-6 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors shadow-md shadow-[#0D9488]/20">
                      {adjustingStock ? '...' : 'Restock'}
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => setSelectedLowStockItem(null)}
                  className="text-slate-500 hover:text-slate-800 text-[11px] font-bold uppercase tracking-wider block text-center w-full pt-4"
                >
                  ← Back to List
                </button>
              </div>
            ) : (
              <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedLowStockItem(item)}
                    className="p-4 rounded-2xl border border-slate-200 hover:border-amber-400 bg-slate-50/50 cursor-pointer flex items-center justify-between text-xs transition-colors group"
                  >
                    <div>
                      <p className="font-bold text-slate-900 text-sm group-hover:text-amber-800">{item.medicine?.name}</p>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{item.branch?.name} ({item.branch?.city})</p>
                    </div>
                    <span className="font-black text-rose-600 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-100 font-mono">
                      {item.quantity} left
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ PRESCRIPTION IMAGE PREVIEW MODAL ═══════════ */}
      {previewPrescriptionUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-2 shadow-2xl relative max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Document Preview</h3>
              <button
                onClick={() => setPreviewPrescriptionUrl(null)}
                className="text-slate-400 hover:text-slate-800 bg-slate-100 p-2 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-900 rounded-2xl mx-2 mb-2 p-4">
              <img
                src={previewPrescriptionUrl}
                alt="Prescription Document"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
            <div className="p-4 pt-2 text-right">
              <a
                href={previewPrescriptionUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-[#0D9488] text-white font-bold text-[11px] uppercase tracking-wider px-5 py-2.5 rounded-xl inline-flex items-center gap-2 hover:bg-[#044E3B] transition-colors"
              >
                <span>Open Original</span>
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 animate-pulse space-y-6">
        <div className="h-24 bg-slate-200 rounded-3xl" />
        <div className="h-64 bg-slate-100 rounded-3xl" />
      </div>
    }>
      <AdminDashboardContent />
    </Suspense>
  );
}