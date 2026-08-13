'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function AdminDashboardPage() {
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
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Manage orders, catalog, branches, branch performance, and prescriptions.</p>
          </div>
          <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase">
            Admin Portal
          </span>
        </div>

        {/* Global Overview Stats Grid (Features #1 & #3) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">

          {/* Card 1: TODAY'S TOTAL ORDERS (Feature #1) */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-indigo-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-indigo-600 uppercase">Today's Orders (All Branches)</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{orderStats.today_orders ?? 0}</p>
              </div>
              <span className="text-2xl">📅</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Lifetime total: {orderStats.total_orders}</p>
          </div>

          {/* Card 2: SUCCESSFUL ORDERS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-emerald-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-emerald-500 uppercase">Successful Orders</p>
                <p className="text-3xl font-extrabold text-emerald-600 mt-2">{orderStats.order_success}</p>
              </div>
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Fulfilled / delivered</p>
          </div>

          {/* Card 3: FAILED ORDERS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-rose-100 flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-rose-500 uppercase">Failed Orders</p>
                <p className="text-3xl font-extrabold text-rose-600 mt-2">{orderStats.order_failure}</p>
              </div>
              <span className="text-2xl">❌</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-2">Cancelled order count</p>
          </div>

          {/* Card 4: LOW STOCK ALERTS (Feature #3 - Click to open modal) */}
          <div
            onClick={() => setShowLowStockModal(true)}
            className="bg-amber-500 text-white p-5 rounded-2xl shadow-sm cursor-pointer hover:bg-amber-600 transition-all flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-amber-100">Low Stock Alerts</p>
                <p className="text-3xl font-extrabold mt-2">{lowStockItems.length}</p>
              </div>
              <span className="text-2xl bg-white/20 p-1.5 rounded-xl">⚠️</span>
            </div>
            <p className="text-[10px] font-semibold text-amber-100 mt-2">Click to inspect product details →</p>
          </div>

          {/* Card 5: PENDING APPROVALS */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-amber-200 flex flex-col justify-between relative">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-[11px] font-bold text-amber-500 uppercase">Pending Approvals</p>
                <p className="text-3xl font-extrabold text-gray-900 mt-2">{pendingStaff.length}</p>
              </div>
              <span className="text-2xl">👨‍⚕️</span>
            </div>
            {pendingStaff.length > 0 && (
              <span className="absolute top-4 right-4 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></span>
            )}
            <p className="text-[10px] text-gray-400 mt-2">Pending staff signups</p>
          </div>

        </div>

        {/* Navigation Tabs (Preserving original tabs + adding performance, lowstock, prescriptions) */}
        <div className="flex border-b border-gray-200 mb-6 gap-4 overflow-x-auto no-scrollbar">
          {[
            { id: 'orders', label: 'Orders Management' },
            { id: 'branches', label: 'Branch Management' },
            { id: 'performance', label: 'Branch Performance' },
            { id: 'lowstock', label: `Low Stock Alerts (${lowStockItems.length})` },
            { id: 'prescriptions', label: 'Prescription Logs' },
            { id: 'medicines', label: 'Medicines Management' },
            { id: 'staff', label: `Staff Management` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
                }`}
            >
              {tab.label}
              {tab.id === 'staff' && pendingStaff.length > 0 && (
                <span className="ml-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {pendingStaff.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ═══════════ TAB 1: ORDERS MANAGEMENT (ORIGINAL FEATURE UNCHANGED) ═══════════ */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            {/* Orders Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Total Orders Done</span>
                  <span className="text-2xl">📦</span>
                </div>
                <p className="text-4xl font-extrabold mt-3">{orderStats.total_orders}</p>
                <p className="text-xs opacity-75 mt-1">Across all active pharmacy branches</p>
              </div>

              <div className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Order Success</span>
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-4xl font-extrabold mt-3">{orderStats.order_success}</p>
                <p className="text-xs opacity-75 mt-1">Successfully fulfilled / delivered orders</p>
              </div>

              <div className="bg-gradient-to-br from-rose-500 to-pink-600 text-white rounded-2xl p-6 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider opacity-80">Order Failure</span>
                  <span className="text-2xl">❌</span>
                </div>
                <p className="text-4xl font-extrabold mt-3">{orderStats.order_failure}</p>
                <p className="text-xs opacity-75 mt-1">Cancelled / unfulfilled order count</p>
              </div>
            </div>

            {/* Orders List Table */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-4">All Branch Orders</h2>
              {loading ? (
                <p className="text-xs text-gray-400">Loading orders...</p>
              ) : orders.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase">
                        <th className="pb-3 font-semibold">Order #</th>
                        <th className="pb-3 font-semibold">Branch</th>
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Total</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {orders.map((o) => (
                        <tr key={o.id} className="hover:bg-gray-50">
                          <td className="py-3 font-bold text-gray-900">{o.order_number}</td>
                          <td className="py-3 text-gray-600 font-medium">{o.branch?.name || 'Store'}</td>
                          <td className="py-3 text-gray-600">{o.customer?.full_name || 'Customer'}</td>
                          <td className="py-3 font-semibold text-gray-900">₹{Number(o.total).toFixed(2)}</td>
                          <td className="py-3">
                            <span className={`font-bold px-2.5 py-0.5 rounded text-[10px] capitalize ${o.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                o.status === 'delivered' ? 'bg-green-100 text-green-700' : 'bg-primary-light text-primary'
                              }`}>
                              {o.status}
                            </span>
                          </td>
                          <td className="py-3">
                            <select
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              className="border border-gray-200 rounded px-2 py-1 text-xs outline-none bg-white"
                            >
                              {['placed', 'confirmed', 'processing', 'ready', 'out_for_delivery_partner', 'delivered', 'cancelled'].map(
                                (s) => (
                                  <option key={s} value={s}>
                                    {s}
                                  </option>
                                )
                              )}
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-gray-400">No orders found.</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 2: BRANCH PERFORMANCE (Feature #2) ═══════════ */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Branch Performance Comparison</h2>
                  <p className="text-xs text-gray-500 mt-0.5">Comparative analytics across all branch locations.</p>
                </div>
                <span className="bg-primary-light text-primary text-xs font-bold px-3 py-1 rounded-full">
                  {branches.length} Branches
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {branches.map((b, index) => {
                  const stats = allBranchStatsMap[b.id] || {
                    total_orders: 0,
                    order_success: 0,
                    order_failure: 0,
                    low_stock_count: 0,
                    top_selling_product: { name: 'N/A', total_sold: 0 },
                  };

                  const successRate = stats.total_orders > 0
                    ? Math.round((stats.order_success / stats.total_orders) * 100)
                    : 100;

                  return (
                    <div
                      key={b.id}
                      className="bg-gray-50 border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow transition-shadow relative"
                    >
                      {index === 0 && (
                        <span className="absolute top-4 right-4 bg-amber-400 text-amber-950 font-bold text-[10px] px-2 py-0.5 rounded-full uppercase">
                          ⭐ Top Branch
                        </span>
                      )}

                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-lg">
                          🏬
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900 text-sm">{b.name}</h3>
                          <p className="text-xs text-gray-500 font-mono">{b.code} • {b.city}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4 bg-white p-3 rounded-xl border border-gray-100">
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Total Orders</span>
                          <p className="text-xl font-bold text-gray-900 mt-0.5">{stats.total_orders}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Success Rate</span>
                          <p className="text-xl font-bold text-emerald-600 mt-0.5">{successRate}%</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Failed</span>
                          <p className="text-xs font-bold text-rose-600 mt-0.5">{stats.order_failure}</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Low Stock</span>
                          <p className="text-xs font-bold text-amber-600 mt-0.5">{stats.low_stock_count}</p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-xs">
                        <span className="text-gray-500 font-medium">Top Product:</span>
                        <span className="font-bold text-gray-800 truncate max-w-[140px]">
                          🏆 {stats.top_selling_product?.name || 'N/A'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════ TAB 3: BRANCH MANAGEMENT (ORIGINAL FEATURE UNCHANGED) ═══════════ */}
        {activeTab === 'branches' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Pharmacy Branches Management</h2>
              <p className="text-xs text-gray-500 mb-6">Click on any branch card to inspect detailed statistics (low stock, top selling products, order success & failure rates).</p>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {branches.map((b) => {
                  const isSelected = selectedBranch?.id === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() => handleSelectBranchForStats(b)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${isSelected
                          ? 'border-primary bg-primary-lighter/30 shadow-md scale-[1.02]'
                          : 'border-gray-100 bg-gray-50 hover:border-gray-300 hover:shadow-sm'
                        }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-bold text-base text-gray-900">{b.name}</span>
                          <span className="bg-primary-light text-primary font-mono font-bold text-xs px-2 py-0.5 rounded">
                            {b.code}
                          </span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">📍 {b.address}, {b.city}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-xs font-semibold text-primary">
                        <span>Click to view branch statistics</span>
                        <span>📊 →</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Selected Branch Detailed Statistics Panel */}
            {selectedBranch && (
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-primary/20 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">🏬</span>
                      <h3 className="text-xl font-bold text-gray-900">{selectedBranch.name} ({selectedBranch.code})</h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Full Branch Performance Analytics & Stock Statistics</p>
                  </div>
                  <button
                    onClick={() => { setSelectedBranch(null); setBranchStats(null); }}
                    className="text-xs font-semibold text-gray-400 hover:text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg"
                  >
                    Close Statistics ✕
                  </button>
                </div>

                {loadingBranchStats ? (
                  <div className="py-12 text-center text-xs text-gray-400 animate-pulse">
                    <span className="text-2xl block mb-2">📊</span>
                    Loading statistics for {selectedBranch.name}...
                  </div>
                ) : branchStats ? (
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl text-center">
                      <span className="text-2xl block mb-1">📦</span>
                      <span className="text-xs font-bold text-blue-700 uppercase">Total Orders</span>
                      <p className="text-2xl font-extrabold text-blue-900 mt-1">{branchStats.total_orders}</p>
                      <span className="text-[10px] text-blue-600">Total orders done</span>
                    </div>

                    <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
                      <span className="text-2xl block mb-1">✅</span>
                      <span className="text-xs font-bold text-emerald-700 uppercase">Order Success</span>
                      <p className="text-2xl font-extrabold text-emerald-900 mt-1">{branchStats.order_success}</p>
                      <span className="text-[10px] text-emerald-600">Successful orders</span>
                    </div>

                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-xl text-center">
                      <span className="text-2xl block mb-1">❌</span>
                      <span className="text-xs font-bold text-rose-700 uppercase">Order Failure</span>
                      <p className="text-2xl font-extrabold text-rose-900 mt-1">{branchStats.order_failure}</p>
                      <span className="text-[10px] text-rose-600">Cancelled / failed orders</span>
                    </div>

                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl text-center">
                      <span className="text-2xl block mb-1">⚠️</span>
                      <span className="text-xs font-bold text-amber-700 uppercase">Low Stock</span>
                      <p className="text-2xl font-extrabold text-amber-900 mt-1">{branchStats.low_stock_count}</p>
                      <span className="text-[10px] text-amber-600">Items low in stock</span>
                    </div>

                    <div className="bg-purple-50 border border-purple-100 p-4 rounded-xl text-center col-span-2 md:col-span-1">
                      <span className="text-2xl block mb-1">🏆</span>
                      <span className="text-xs font-bold text-purple-700 uppercase">Top Selling</span>
                      <p className="text-sm font-extrabold text-purple-900 mt-1 truncate" title={branchStats.top_selling_product?.name}>
                        {branchStats.top_selling_product?.name || 'N/A'}
                      </p>
                      <span className="text-[10px] text-purple-600 font-semibold">
                        {branchStats.top_selling_product?.total_sold ? `${branchStats.top_selling_product.total_sold} units sold` : 'No sales yet'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400">Failed to load statistics.</p>
                )}
              </div>
            )}
          </div>
        )}

        {/* ═══════════ TAB 4: LOW STOCK ALERTS (Feature #3) ═══════════ */}
        {activeTab === 'lowstock' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Low Stock Inventory Center</h2>
                  <p className="text-xs text-gray-500">Click any product to view exact details and restock stock.</p>
                </div>
                <span className="bg-amber-100 text-amber-800 text-xs font-bold px-3 py-1 rounded-full">
                  ⚠️ {lowStockItems.length} items low
                </span>
              </div>

              {lowStockItems.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {lowStockItems.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedLowStockItem(item)}
                      className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 cursor-pointer hover:shadow hover:border-amber-300 transition-all flex flex-col justify-between"
                    >
                      <div className="flex items-start gap-3">
                        {item.medicine?.image_url ? (
                          <img src={item.medicine.image_url} alt={item.medicine.name} className="w-10 h-10 object-contain bg-white rounded-lg border border-gray-100 shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg shrink-0">
                            💊
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-gray-900 text-xs truncate">{item.medicine?.name}</h3>
                          <p className="text-[11px] text-gray-500 truncate">{item.medicine?.generic_name || 'N/A'}</p>
                          <p className="text-xs text-primary font-semibold mt-1">🏬 {item.branch?.name} ({item.branch?.city})</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-gray-500 text-[11px]">Quantity: </span>
                          <span className="font-bold text-rose-600">{item.quantity}</span>
                          <span className="text-gray-400 text-[11px]"> / {item.low_stock_threshold}</span>
                        </div>
                        <span className="text-primary font-bold text-[11px]">Inspect →</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">No low stock items across any branch!</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 5: PRESCRIPTION LOGS BY DATE (Feature #4) ═══════════ */}
        {activeTab === 'prescriptions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 border-b border-gray-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Prescription Upload Logs</h2>
                  <p className="text-xs text-gray-500">Filter prescription logs by date.</p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-gray-600">Date:</span>
                  <input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="border border-gray-200 rounded-lg px-2.5 py-1 text-xs font-bold text-gray-800 bg-white outline-none"
                  />
                  <button
                    onClick={() => setSelectedDate(new Date().toISOString().split('T')[0])}
                    className="bg-primary-light text-primary hover:bg-primary-lighter text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    Today
                  </button>
                  <button
                    onClick={() => {
                      const y = new Date();
                      y.setDate(y.getDate() - 1);
                      setSelectedDate(y.toISOString().split('T')[0]);
                    }}
                    className="bg-gray-100 text-gray-700 text-xs font-bold px-2.5 py-1 rounded-lg"
                  >
                    Yesterday
                  </button>
                </div>
              </div>

              {loadingPrescriptions ? (
                <p className="text-center py-6 text-xs text-gray-400">Loading prescriptions for {selectedDate}...</p>
              ) : prescriptions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-gray-100 text-gray-400 uppercase">
                        <th className="pb-3 font-semibold">Customer</th>
                        <th className="pb-3 font-semibold">Phone</th>
                        <th className="pb-3 font-semibold">Uploaded At</th>
                        <th className="pb-3 font-semibold">Status</th>
                        <th className="pb-3 font-semibold">Reviewer</th>
                        <th className="pb-3 font-semibold">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {prescriptions.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50">
                          <td className="py-3 font-bold text-gray-900">{p.customer?.full_name || 'Customer'}</td>
                          <td className="py-3 text-gray-600">{p.customer?.phone || '—'}</td>
                          <td className="py-3 text-gray-500 font-mono text-[11px]">
                            {p.uploaded_at ? new Date(p.uploaded_at).toLocaleString() : '—'}
                          </td>
                          <td className="py-3">
                            <span className={`font-bold px-2 py-0.5 rounded text-[10px] capitalize ${p.status === 'approved' ? 'bg-green-100 text-green-700' :
                                p.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'
                              }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="py-3 text-gray-600">{p.reviewer?.full_name || '—'}</td>
                          <td className="py-3">
                            {p.file_url ? (
                              <button
                                onClick={() => setPreviewPrescriptionUrl(p.file_url)}
                                className="bg-primary text-white font-bold text-[10px] px-2 py-1 rounded"
                              >
                                View 📄
                              </button>
                            ) : (
                              <span className="text-gray-400">—</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-center py-6 text-xs text-gray-400">No prescriptions found for {selectedDate}.</p>
              )}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 6: MEDICINES CATALOG (ORIGINAL FEATURE UNCHANGED) ═══════════ */}
        {activeTab === 'medicines' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Medicine Catalog</h2>
              <button
                onClick={() => setShowAddMed(!showAddMed)}
                className="bg-primary text-white font-semibold text-xs px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors"
              >
                + Add Medicine
              </button>
            </div>

            {showAddMed && (
              <form onSubmit={handleCreateMedicine} className="bg-gray-50 p-4 rounded-xl mb-6 space-y-3 border border-gray-200">
                <h3 className="text-xs font-bold text-gray-700 uppercase">New Medicine</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="Name *"
                    value={newMed.name}
                    onChange={(e) => setNewMed({ ...newMed, name: e.target.value })}
                    required
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Generic Name"
                    value={newMed.generic_name}
                    onChange={(e) => setNewMed({ ...newMed, generic_name: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Manufacturer"
                    value={newMed.manufacturer}
                    onChange={(e) => setNewMed({ ...newMed, manufacturer: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                  <select
                    value={newMed.category}
                    onChange={(e) => setNewMed({ ...newMed, category: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs bg-white"
                  >
                    {['Medicines', 'Health Care', 'Personal Care', 'Baby Care', 'Devices', 'Wellness'].map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="MRP (₹) *"
                    value={newMed.mrp}
                    onChange={(e) => setNewMed({ ...newMed, mrp: e.target.value })}
                    required
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                  <input
                    type="url"
                    placeholder="Image URL"
                    value={newMed.image_url}
                    onChange={(e) => setNewMed({ ...newMed, image_url: e.target.value })}
                    className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <textarea
                    placeholder="Description"
                    value={newMed.description}
                    onChange={(e) => setNewMed({ ...newMed, description: e.target.value })}
                    rows="2"
                    className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="req_rx"
                    checked={newMed.requires_prescription}
                    onChange={(e) => setNewMed({ ...newMed, requires_prescription: e.target.checked })}
                    className="accent-[#0d7c42]"
                  />
                  <label htmlFor="req_rx" className="text-xs text-gray-600">Requires Prescription (Rx)</label>
                </div>
                <button type="submit" className="bg-primary text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark">
                  Save Medicine
                </button>
              </form>
            )}

            <div className="divide-y divide-gray-100">
              {medicines.map((m) => (
                <div key={m.id} className="py-3 flex items-center justify-between text-xs gap-4">
                  <div className="flex items-center gap-3">
                    {m.image_url ? (
                      <img src={m.image_url} alt={m.name} className="w-10 h-10 object-contain rounded-lg border border-gray-100 bg-gray-50" />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center text-lg">💊</div>
                    )}
                    <div>
                      <span className="font-bold text-gray-900">{m.name}</span>
                      {m.generic_name && <span className="text-gray-400 ml-2">({m.generic_name})</span>}
                      <p className="text-gray-500">{m.category} • Mfr: {m.manufacturer || 'N/A'}</p>
                      {m.description && <p className="text-gray-400 text-[11px] line-clamp-1 mt-0.5">{m.description}</p>}
                    </div>
                  </div>
                  <span className="font-bold text-gray-900 shrink-0">₹{Number(m.mrp).toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ═══════════ TAB 7: STAFF MANAGEMENT (ORIGINAL FEATURE UNCHANGED) ═══════════ */}
        {activeTab === 'staff' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Staff Management</h2>
                <p className="text-xs text-gray-500 mt-0.5">Review pending pharmacist registrations and assign branches.</p>
              </div>
              {pendingStaff.length > 0 && (
                <span className="bg-amber-100 text-amber-700 text-xs font-bold px-3 py-1 rounded-full">
                  {pendingStaff.length} pending
                </span>
              )}
            </div>

            {loading ? (
              <p className="text-xs text-gray-400">Loading pending registrations...</p>
            ) : pendingStaff.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-gray-100 text-gray-400 uppercase">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Phone</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Registered</th>
                      <th className="pb-3 font-semibold">Assign Branch</th>
                      <th className="pb-3 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {pendingStaff.map((p) => (
                      <tr key={p.id} className="hover:bg-gray-50">
                        <td className="py-4">
                          <div>
                            <span className="font-bold text-gray-900">{p.full_name || 'Unnamed'}</span>
                            <p className="text-gray-400 text-[11px] mt-0.5">{p.email || p.id.slice(0, 8)}</p>
                          </div>
                        </td>
                        <td className="py-4 text-gray-600">{p.phone || '—'}</td>
                        <td className="py-4">
                          <span className="bg-blue-50 text-blue-600 font-bold px-2 py-0.5 rounded text-[10px] capitalize">
                            {p.role}
                          </span>
                        </td>
                        <td className="py-4 text-gray-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : '—'}
                        </td>
                        <td className="py-4">
                          <select
                            value={branchAssignments[p.id] || ''}
                            onChange={(e) =>
                              setBranchAssignments((prev) => ({ ...prev, [p.id]: e.target.value }))
                            }
                            className="border border-gray-200 rounded-lg px-2 py-1.5 text-xs outline-none bg-white min-w-[140px] focus:border-primary focus:ring-1 focus:ring-primary/20"
                          >
                            <option value="">Select branch...</option>
                            {branches.map((b) => (
                              <option key={b.id} value={b.id}>
                                {b.name} ({b.code})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleApproveStaff(p.id)}
                              disabled={staffActionLoading[p.id] === 'approve' || !branchAssignments[p.id]}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                            >
                              {staffActionLoading[p.id] === 'approve' ? 'Approving...' : '✓ Approve'}
                            </button>
                            <button
                              onClick={() => handleRejectStaff(p.id)}
                              disabled={staffActionLoading[p.id] === 'reject'}
                              className="bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-[11px] px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                            >
                              {staffActionLoading[p.id] === 'reject' ? 'Rejecting...' : '✕ Reject'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-sm font-semibold text-gray-700">All caught up!</p>
                <p className="text-xs text-gray-400 mt-1">No pending registrations to review.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════ LOW STOCK ITEM DETAILS MODAL (Feature #3) ═══════════ */}
      {(showLowStockModal || selectedLowStockItem) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <h3 className="font-bold text-gray-900 text-base">Low Stock Product Details</h3>
              </div>
              <button
                onClick={() => { setShowLowStockModal(false); setSelectedLowStockItem(null); }}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {selectedLowStockItem ? (
              <div className="space-y-4 text-xs">
                <div className="flex gap-4 items-start bg-amber-50 p-4 rounded-xl border border-amber-200">
                  {selectedLowStockItem.medicine?.image_url ? (
                    <img src={selectedLowStockItem.medicine.image_url} alt={selectedLowStockItem.medicine.name} className="w-16 h-16 object-contain bg-white rounded-lg border p-1 shrink-0" />
                  ) : (
                    <div className="w-16 h-16 bg-amber-100 text-amber-800 rounded-lg flex items-center justify-center font-bold text-2xl shrink-0">💊</div>
                  )}
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-gray-900 text-sm">{selectedLowStockItem.medicine?.name}</h4>
                    <p className="text-gray-600">Generic: {selectedLowStockItem.medicine?.generic_name || 'N/A'}</p>
                    <p className="text-gray-600">Category: {selectedLowStockItem.medicine?.category} • MRP: ₹{selectedLowStockItem.medicine?.mrp}</p>
                    <p className="text-primary font-bold mt-1">🏬 Branch: {selectedLowStockItem.branch?.name} ({selectedLowStockItem.branch?.city})</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex justify-between font-semibold">
                  <span>Current Quantity: <span className="text-rose-600 font-bold">{selectedLowStockItem.quantity}</span></span>
                  <span>Low Stock Threshold: <span className="text-gray-700">{selectedLowStockItem.low_stock_threshold}</span></span>
                </div>

                <form onSubmit={handleAdjustStock} className="space-y-2">
                  <label className="font-bold text-gray-700 block">Quick Restock Quantity</label>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Enter quantity to add"
                      value={adjustQtyInput}
                      onChange={(e) => setAdjustQtyInput(e.target.value)}
                      className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs flex-1"
                      required
                    />
                    <button type="submit" disabled={adjustingStock} className="bg-primary text-white font-bold px-4 py-1.5 rounded-lg">
                      {adjustingStock ? 'Restocking...' : 'Restock'}
                    </button>
                  </div>
                </form>

                <button
                  onClick={() => setSelectedLowStockItem(null)}
                  className="text-gray-500 underline block text-center w-full pt-2"
                >
                  Back to Low Stock List
                </button>
              </div>
            ) : (
              <div className="space-y-2 max-h-[60vh] overflow-y-auto">
                {lowStockItems.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedLowStockItem(item)}
                    className="p-3 rounded-xl border border-gray-200 hover:border-amber-400 bg-gray-50 cursor-pointer flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-gray-900">{item.medicine?.name}</p>
                      <p className="text-[11px] text-gray-500">{item.branch?.name} ({item.branch?.city})</p>
                    </div>
                    <span className="font-bold text-rose-600">{item.quantity} left</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══════════ PRESCRIPTION IMAGE PREVIEW MODAL (Feature #4) ═══════════ */}
      {previewPrescriptionUrl && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-xl relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-sm">Prescription Document Preview</h3>
              <button
                onClick={() => setPreviewPrescriptionUrl(null)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 rounded-xl p-2">
              <img
                src={previewPrescriptionUrl}
                alt="Prescription Document"
                className="max-h-[65vh] object-contain rounded"
              />
            </div>
            <div className="pt-3 text-right">
              <a
                href={previewPrescriptionUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-primary text-white font-bold text-xs px-3 py-1.5 rounded-lg inline-block"
              >
                Open Original ↗
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
