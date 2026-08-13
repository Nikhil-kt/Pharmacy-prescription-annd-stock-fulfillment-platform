'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryDashboardPage() {
  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  // Active Navigation Tab: 'active' | 'accepted' | 'in_transit' | 'history'
  const [activeTab, setActiveTab] = useState('active');

  // Branch filter state: 'all' or specific branch_id
  const [selectedBranchId, setSelectedBranchId] = useState('all');

  // Data states
  const [orders, setOrders] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const role = profile?.role || user?.user_metadata?.role;
    if (!authLoading && (!user || (role && role !== 'delivery' && role !== 'delivery_partner' && role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      fetchDeliveries();
    }
  }, [user, profile, authLoading]);

  async function fetchDeliveries() {
    setLoading(true);
    try {
      const [ordersRes, branchRes] = await Promise.all([
        api.get('/api/orders', { limit: 100 }),
        api.get('/api/branches', { limit: 50 }).catch(() => ({ data: [] })),
      ]);

      const allOrders = ordersRes.data || [];
      setOrders(allOrders);
      setBranches(branchRes.data || []);
    } catch (err) {
      console.error('Failed to fetch delivery orders:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await api.patch(`/api/orders/${orderId}/status`, { status: newStatus });
      await fetchDeliveries();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  if (authLoading) return null;

  // Filtered dataset calculations for logged-in Delivery Partner
  const partnerId = user?.id;
  const partnerRole = profile?.role || user?.user_metadata?.role || 'delivery_partner';
  const partnerName = profile?.full_name || user?.user_metadata?.full_name || 'Delivery Agent';
  const partnerPhone = profile?.phone || user?.user_metadata?.phone || 'N/A';
  const partnerEmail = user?.email || profile?.email || 'partner@rxconnect.com';

  // Filtered dataset calculations:
  // Active Assignments shows ALL active assigned orders (placed, confirmed, processing, ready, out_for_delivery)
  const assignedOrders = orders.filter((o) => o.status !== 'cancelled');
  const activeAssignments = orders.filter((o) => ['placed', 'confirmed', 'processing', 'ready', 'out_for_delivery'].includes(o.status));
  const acceptedOrders = orders.filter((o) => ['ready', 'processing', 'confirmed'].includes(o.status));
  const inTransitOrders = orders.filter((o) => o.status === 'out_for_delivery');
  const completedOrders = orders.filter((o) => o.status === 'delivered');

  // Compute Branch-wise order breakdown
  const branchCountsMap = {};
  orders.forEach((o) => {
    const bId = o.branch_id || o.branch?.id || 'unknown';
    const bName = o.branch?.name || 'Main Pharmacy Branch';
    const bCode = o.branch?.code || 'MAIN';
    const bCity = o.branch?.city || 'City';
    const bAddress = o.branch?.address || '';
    if (!branchCountsMap[bId]) {
      branchCountsMap[bId] = {
        id: bId,
        name: bName,
        code: bCode,
        city: bCity,
        address: bAddress,
        total: 0,
        active: 0,
        in_transit: 0,
        delivered: 0,
      };
    }
    branchCountsMap[bId].total += 1;
    if (['placed', 'ready', 'processing', 'confirmed'].includes(o.status)) branchCountsMap[bId].active += 1;
    if (o.status === 'out_for_delivery') branchCountsMap[bId].in_transit += 1;
    if (o.status === 'delivered') branchCountsMap[bId].delivered += 1;
  });

  const branchList = Object.values(branchCountsMap);

  // Determine current tab list items & apply Branch Filter
  const getTabOrders = () => {
    let list = [];
    switch (activeTab) {
      case 'accepted':
        list = acceptedOrders;
        break;
      case 'in_transit':
        list = inTransitOrders;
        break;
      case 'history':
        list = completedOrders;
        break;
      case 'active':
      default:
        list = activeAssignments;
        break;
    }
    if (selectedBranchId !== 'all') {
      list = list.filter((o) => (o.branch_id === selectedBranchId || o.branch?.id === selectedBranchId));
    }
    return list;
  };

  const displayedOrders = getTabOrders();

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* ═══════════ LOGGED IN DELIVERY PARTNER PROFILE BANNER ═══════════ */}
        <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-56 h-56 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          
          {/* Partner Info Details */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-3xl border border-white/20 shadow-inner shrink-0">
              🛵
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                  Welcome, {partnerName}
                </h1>
                <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                  Role: {partnerRole.replace('_', ' ')}
                </span>
              </div>
              <div className="text-xs text-amber-100 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono">
                <span>📱 Phone: {partnerPhone}</span>
                <span>•</span>
                <span>📧 Email: {partnerEmail}</span>
                <span>•</span>
                <span>🆔 ID: {partnerId?.slice(0, 8) || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Duty Status */}
          <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/15 shrink-0">
            <span className="w-3.5 h-3.5 bg-emerald-400 rounded-full animate-ping" />
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-200 block">Dispatch Status</span>
              <span className="text-xs font-extrabold text-white">Online & Receiving Deliveries</span>
            </div>
          </div>
        </div>

        {/* ═══════════ COUNT METRICS DASHBOARD CARDS ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-8">
          
          {/* Card 1: Total Assigned Orders */}
          <div 
            onClick={() => setActiveTab('active')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'active' 
                ? 'bg-amber-50 border-amber-500 shadow-md ring-2 ring-amber-500/20 scale-[1.01]' 
                : 'bg-white border-gray-100 shadow-sm hover:border-amber-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Assigned</span>
              <span className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center text-xl font-bold">
                📋
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-gray-900">{assignedOrders.length}</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Assigned to your queue</p>
            </div>
          </div>

          {/* Card 2: Accepted / Ready */}
          <div 
            onClick={() => setActiveTab('accepted')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'accepted' 
                ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-[1.01]' 
                : 'bg-white border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Accepted Orders</span>
              <span className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold">
                📦
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-blue-900">{acceptedOrders.length}</p>
              <p className="text-[11px] text-blue-600/70 mt-0.5">Ready for pickup at store</p>
            </div>
          </div>

          {/* Card 3: In Transit */}
          <div 
            onClick={() => setActiveTab('in_transit')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'in_transit' 
                ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-500/20 scale-[1.01]' 
                : 'bg-white border-gray-100 shadow-sm hover:border-purple-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-600 uppercase tracking-wider">In Transit</span>
              <span className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center text-xl font-bold">
                🚚
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-purple-900">{inTransitOrders.length}</p>
              <p className="text-[11px] text-purple-600/70 mt-0.5">On the way to customer</p>
            </div>
          </div>

          {/* Card 4: Completed Deliveries */}
          <div 
            onClick={() => setActiveTab('history')}
            className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
              activeTab === 'history' 
                ? 'bg-emerald-50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 scale-[1.01]' 
                : 'bg-white border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Completed</span>
              <span className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xl font-bold">
                ✅
              </span>
            </div>
            <div className="mt-4">
              <p className="text-3xl font-black text-emerald-900">{completedOrders.length}</p>
              <p className="text-[11px] text-emerald-600/70 mt-0.5">Successfully delivered</p>
            </div>
          </div>

        </div>

        {/* ═══════════ PHARMACY BRANCH BREAKDOWN SECTION ═══════════ */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <span>🏪</span> Assigned Orders by Pharmacy Branch
              </h2>
              <p className="text-xs text-gray-500">Click any branch card to filter orders by that specific pickup store.</p>
            </div>

            {/* Branch Filter Dropdown */}
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
              <span className="text-xs font-bold text-gray-500">Filter Branch:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-extrabold text-gray-900 outline-none cursor-pointer"
              >
                <option value="all">All Branches ({orders.length})</option>
                {branchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code}) — {b.total} orders
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* "All Branches" Card */}
            <div
              onClick={() => setSelectedBranchId('all')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedBranchId === 'all'
                  ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                  : 'border-gray-100 bg-gray-50 hover:border-amber-200'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-xs text-gray-900">All Pharmacy Branches</span>
                <span className="text-xs bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded">All</span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="text-gray-500">Total Orders:</span>
                <span className="font-black text-amber-700 text-sm">{orders.length}</span>
              </div>
            </div>

            {/* Individual Branch Cards */}
            {branchList.map((b) => {
              const isSelected = selectedBranchId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 shadow-sm'
                      : 'border-gray-100 bg-gray-50 hover:border-amber-200'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="font-extrabold text-xs text-gray-900 truncate" title={b.name}>{b.name}</span>
                      <span className="text-[10px] font-mono bg-amber-100 text-amber-800 font-bold px-1.5 py-0.5 rounded shrink-0">
                        {b.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5">📍 {b.city}</p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-blue-600">{b.active} Active</span>
                    <span className="text-purple-600">{b.in_transit} Transit</span>
                    <span className="text-emerald-600">{b.delivered} Done</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ NAVIGATION TABS (ACTIVE / ACCEPTED / IN TRANSIT / HISTORY) ═══════════ */}
        <div className="flex border-b border-gray-200 mb-6 gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'active', label: `Active Assignments (${activeAssignments.length})`, icon: '⚡' },
            { id: 'accepted', label: `Accepted Orders (${acceptedOrders.length})`, icon: '📦' },
            { id: 'in_transit', label: `In Transit (${inTransitOrders.length})`, icon: '🚚' },
            { id: 'history', label: `Order History (${completedOrders.length})`, icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3.5 text-xs md:text-sm font-extrabold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-amber-600 text-amber-600 scale-[1.02]'
                  : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ═══════════ MAIN CONTENT SECTION: ASSIGNED ORDERS CARDS ═══════════ */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 capitalize">
                  {activeTab === 'active' && `Active Assignments Queue (${activeAssignments.length})`}
                  {activeTab === 'accepted' && `Accepted & Store Pickups (${acceptedOrders.length})`}
                  {activeTab === 'in_transit' && `Orders In Transit to Destination (${inTransitOrders.length})`}
                  {activeTab === 'history' && `Completed Order History Log (${completedOrders.length})`}
                </h2>
                {selectedBranchId !== 'all' && (
                  <span className="bg-amber-100 text-amber-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                    Filtered by Branch
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {activeTab === 'active' && 'All active assigned orders in queue. Click Track Order on any card to update live status.'}
                {activeTab === 'accepted' && 'Orders accepted by you awaiting pickup or ready to start delivery.'}
                {activeTab === 'in_transit' && 'Track packages currently on route and mark complete on arrival.'}
                {activeTab === 'history' && 'Full history of your completed and delivered medicine packages.'}
              </p>
            </div>
            
            <button
              onClick={fetchDeliveries}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto"
            >
              <span>🔄 Refresh List</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs text-gray-400 animate-pulse">
              <span className="text-3xl block mb-2">🚚</span>
              Fetching delivery jobs for partner {partnerName}...
            </div>
          ) : displayedOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {displayedOrders.map((o) => {
                const isUpdating = updatingId === o.id;

                return (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl border border-gray-200 hover:border-amber-400 transition-all bg-gray-50/50 hover:bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                  >
                    <div className="space-y-3 flex-1">
                      {/* Order Number & Status Badges */}
                      <div className="flex flex-wrap items-center gap-2">
                        <Link href={`/delivery/orders/${o.id}`} className="font-black text-gray-900 text-base hover:text-amber-600 hover:underline flex items-center gap-1">
                          <span>Order #{o.order_number}</span>
                          <span className="text-xs text-amber-600 font-normal">↗</span>
                        </Link>
                        <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                          o.status === 'delivered'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : o.status === 'out_for_delivery'
                            ? 'bg-purple-100 text-purple-800 border border-purple-200'
                            : o.status === 'ready'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {o.status === 'out_for_delivery' ? 'In Transit 🚚' : o.status?.replace(/_/g, ' ')}
                        </span>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                          Placed: {o.placed_at ? new Date(o.placed_at).toLocaleString() : 'Recently'}
                        </span>
                      </div>

                      {/* Store Branch Details Box */}
                      <div className="bg-amber-50/80 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-amber-200 text-amber-900 font-bold flex items-center justify-center text-sm shrink-0">
                            🏬
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-extrabold text-xs text-gray-900">{o.branch?.name || 'Main Pharmacy Branch'}</span>
                              <span className="bg-amber-200 text-amber-900 font-mono font-bold text-[10px] px-1.5 py-0.2 rounded">
                                {o.branch?.code || 'MAIN'}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 line-clamp-1 mt-0.5">
                              📍 Pickup Address: {o.branch?.address || 'Branch store location'}, {o.branch?.city || ''}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold text-amber-800 bg-white/80 px-2 py-1 rounded-lg border border-amber-200 shrink-0 hidden sm:inline-block">
                          Store Pickup Point
                        </span>
                      </div>

                      {/* Customer & Destination Info */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 pt-1">
                        <div>
                          <span className="font-bold text-gray-800 block">👤 Customer Info:</span>
                          <p className="font-medium text-gray-900">{o.customer?.full_name || 'Customer'}</p>
                          <p className="text-gray-500 font-mono text-[11px]">{o.customer?.phone || 'Phone unavailable'}</p>
                        </div>
                        <div>
                          <span className="font-bold text-gray-800 block">📍 Delivery Destination:</span>
                          <p className="text-gray-700 line-clamp-1">
                            {o.delivery_address?.line1 || o.delivery_partner_address?.line1 || 'Address details in order details'}, {o.delivery_address?.city || o.delivery_partner_address?.city || ''}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs font-semibold text-gray-700 pt-2 border-t border-gray-100">
                        <div>
                          <span>Order Total: <span className="font-extrabold text-emerald-600 text-sm">₹{Number(o.total || 0).toFixed(2)}</span></span>
                        </div>

                        {/* Inline Status Updater Dropdown directly in panel */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-gray-400 font-bold">Update Status:</span>
                          <select
                            value={o.status}
                            disabled={isUpdating}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className="bg-white border border-gray-300 rounded-lg px-2 py-1 text-xs font-bold text-gray-800 outline-none focus:border-amber-500"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Verified ✓</option>
                            <option value="processing">Packed 📦</option>
                            <option value="ready">Ready 🏪</option>
                            <option value="out_for_delivery">Out for Delivery 🚚</option>
                            <option value="delivered">Delivered ✅</option>
                            <option value="cancelled">Cancelled ❌</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls & Primary Track Order Button */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 w-full md:w-52 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-gray-100">
                      
                      {/* PROMINENT TRACK ORDER BUTTON — Routes to Order Details & Status Controller Page */}
                      <Link
                        href={`/delivery/orders/${o.id}`}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg text-center"
                      >
                        <span className="text-sm">📍</span>
                        <span>Track Order ↗</span>
                      </Link>

                      {/* Quick Action Button based on status */}
                      {o.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'out_for_delivery')}
                          disabled={isUpdating}
                          className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                        >
                          {isUpdating ? 'Updating...' : 'Start Delivery 🚚'}
                        </button>
                      )}

                      {o.status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'delivered')}
                          disabled={isUpdating}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold py-2 rounded-xl transition-all shadow-sm disabled:opacity-50"
                        >
                          {isUpdating ? 'Completing...' : 'Mark Delivered ✓'}
                        </button>
                      )}

                      {o.status === 'delivered' && (
                        <span className="w-full bg-emerald-50 text-emerald-700 font-bold text-center text-xs py-2 rounded-xl border border-emerald-200">
                          ✓ Delivered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-3 text-2xl font-bold">
                📦
              </div>
              <h3 className="text-sm font-bold text-gray-800">No orders found in this view</h3>
              <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                {selectedBranchId !== 'all' ? 'No assigned orders match the selected branch filter.' : 'There are currently no orders in this status queue.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
