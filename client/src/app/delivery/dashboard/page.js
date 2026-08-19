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
    <div className="bg-slate-50/50 min-h-screen pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8">

        {/* ═══════════ LOGGED IN DELIVERY PARTNER PROFILE BANNER ═══════════ */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 relative overflow-hidden border border-slate-800">
          <div className="absolute -right-6 -bottom-6 w-56 h-56 bg-[#0D9488]/20 rounded-full blur-3xl pointer-events-none" />
          
          {/* Partner Info Details */}
          <div className="relative z-10 flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-3xl border border-white/10 shadow-inner shrink-0">
              🛵
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white">
                  Welcome, {partnerName}
                </h1>
                <span className="bg-[#0D9488] text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-lg shadow-sm tracking-wider">
                  {partnerRole.replace('_', ' ')}
                </span>
              </div>
              <div className="text-[11px] text-slate-300 mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono font-medium">
                <span>📱 {partnerPhone}</span>
                <span className="text-slate-600">•</span>
                <span>📧 {partnerEmail}</span>
                <span className="text-slate-600">•</span>
                <span>🆔 {partnerId?.slice(0, 8) || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Duty Status */}
          <div className="relative z-10 flex items-center gap-3 bg-slate-800/80 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-700 shrink-0">
            <span className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <div>
              <span className="text-[9px] uppercase tracking-wider font-black text-slate-400 block">Dispatch Status</span>
              <span className="text-xs font-bold text-white">Online & Receiving Deliveries</span>
            </div>
          </div>
        </div>

        {/* ═══════════ COUNT METRICS DASHBOARD CARDS ═══════════ */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-5 mb-8">
          
          {/* Card 1: Total Assigned Orders */}
          <div 
            onClick={() => setActiveTab('active')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center ${
              activeTab === 'active' 
                ? 'bg-[#0D9488]/5 border-[#0D9488] shadow-md scale-[1.02]' 
                : 'bg-white border-slate-200/80 shadow-xs hover:border-[#0D9488]/40'
            }`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${activeTab === 'active' ? 'bg-[#0D9488]/20 text-[#0D9488]' : 'bg-slate-100 text-slate-500'}`}>
                📋
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'active' ? 'text-[#0D9488]' : 'text-slate-500'}`}>Total Assigned</p>
                <h3 className="text-xl font-black text-slate-900 font-mono">{assignedOrders.length}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Assigned to your queue</p>
          </div>

          {/* Card 2: Accepted / Ready */}
          <div 
            onClick={() => setActiveTab('accepted')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center ${
              activeTab === 'accepted' 
                ? 'bg-blue-50/50 border-blue-500 shadow-md scale-[1.02]' 
                : 'bg-white border-slate-200/80 shadow-xs hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${activeTab === 'accepted' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                📦
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'accepted' ? 'text-blue-700' : 'text-slate-500'}`}>Accepted</p>
                <h3 className="text-xl font-black text-slate-900 font-mono">{acceptedOrders.length}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Ready for store pickup</p>
          </div>

          {/* Card 3: In Transit */}
          <div 
            onClick={() => setActiveTab('in_transit')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center ${
              activeTab === 'in_transit' 
                ? 'bg-purple-50/50 border-purple-500 shadow-md scale-[1.02]' 
                : 'bg-white border-slate-200/80 shadow-xs hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${activeTab === 'in_transit' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                🚚
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'in_transit' ? 'text-purple-700' : 'text-slate-500'}`}>In Transit</p>
                <h3 className="text-xl font-black text-slate-900 font-mono">{inTransitOrders.length}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-500 mt-1">On the way to customer</p>
          </div>

          {/* Card 4: Completed Deliveries */}
          <div 
            onClick={() => setActiveTab('history')}
            className={`p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-center ${
              activeTab === 'history' 
                ? 'bg-emerald-50/50 border-emerald-500 shadow-md scale-[1.02]' 
                : 'bg-white border-slate-200/80 shadow-xs hover:border-emerald-300'
            }`}
          >
            <div className="flex items-center gap-4 mb-2">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${activeTab === 'history' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                ✅
              </div>
              <div className="min-w-0">
                <p className={`text-[10px] font-bold uppercase tracking-wider ${activeTab === 'history' ? 'text-emerald-700' : 'text-slate-500'}`}>Completed</p>
                <h3 className="text-xl font-black text-slate-900 font-mono">{completedOrders.length}</h3>
              </div>
            </div>
            <p className="text-[10px] font-medium text-slate-500 mt-1">Successfully delivered</p>
          </div>

        </div>

        {/* ═══════════ PHARMACY BRANCH BREAKDOWN SECTION ═══════════ */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-xs border border-emerald-200/80 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
                </svg>
                Assigned Orders by Branch
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Filter your delivery queue by specific pickup store.</p>
            </div>

            {/* Branch Filter Dropdown */}
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Filter:</span>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-900 outline-none cursor-pointer focus:ring-0 border-none p-0"
              >
                <option value="all">All Branches ({orders.length})</option>
                {branchList.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* "All Branches" Card */}
            <div
              onClick={() => setSelectedBranchId('all')}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                selectedBranchId === 'all'
                  ? 'border-[#0D9488] bg-[#0D9488]/5 shadow-sm'
                  : 'border-slate-100 bg-slate-50 hover:border-[#0D9488]/40'
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="font-extrabold text-sm text-slate-900">All Locations</span>
                <span className="text-[9px] bg-slate-200 text-slate-700 font-black px-2 py-0.5 rounded-lg uppercase tracking-wider">All</span>
              </div>
              <div className="mt-4 flex items-center justify-between text-xs">
                <span className="text-slate-500 font-bold uppercase tracking-wider text-[10px]">Total Orders:</span>
                <span className="font-black text-slate-900 text-sm font-mono">{orders.length}</span>
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
                      ? 'border-[#0D9488] bg-[#0D9488]/5 shadow-sm'
                      : 'border-slate-100 bg-slate-50 hover:border-[#0D9488]/40'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-extrabold text-sm text-slate-900 truncate pr-2" title={b.name}>{b.name}</span>
                      <span className="text-[9px] font-mono bg-white border border-slate-200 text-slate-700 font-black px-2 py-0.5 rounded-lg shrink-0">
                        {b.code}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-medium truncate">📍 {b.city}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px] font-bold">
                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded">{b.active} Act</span>
                    <span className="text-purple-600 bg-purple-50 px-2 py-0.5 rounded">{b.in_transit} Trn</span>
                    <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{b.delivered} Dlv</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ NAVIGATION TABS (ACTIVE / ACCEPTED / IN TRANSIT / HISTORY) ═══════════ */}
        <div className="flex border-b border-slate-200 mb-6 gap-6 overflow-x-auto no-scrollbar">
          {[
            { id: 'active', label: `Active (${activeAssignments.length})`, icon: '⚡' },
            { id: 'accepted', label: `Accepted (${acceptedOrders.length})`, icon: '📦' },
            { id: 'in_transit', label: `In Transit (${inTransitOrders.length})`, icon: '🚚' },
            { id: 'history', label: `History (${completedOrders.length})`, icon: '📜' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-xs font-black uppercase tracking-wider whitespace-nowrap transition-all border-b-2 flex items-center gap-1.5 ${
                activeTab === tab.id
                  ? 'border-[#0D9488] text-[#0D9488]'
                  : 'border-transparent text-slate-400 hover:text-slate-700'
              }`}
            >
              <span className="text-sm">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ═══════════ MAIN CONTENT SECTION: ASSIGNED ORDERS CARDS ═══════════ */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-emerald-200/80">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-extrabold text-slate-900 capitalize">
                  {activeTab === 'active' && `Active Assignments Queue`}
                  {activeTab === 'accepted' && `Accepted & Store Pickups`}
                  {activeTab === 'in_transit' && `Orders In Transit`}
                  {activeTab === 'history' && `Completed Order History`}
                </h2>
                {selectedBranchId !== 'all' && (
                  <span className="bg-slate-100 text-slate-600 border border-slate-200 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Filtered
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {activeTab === 'active' && 'All active assigned orders in queue. Click Track Order to update live status.'}
                {activeTab === 'accepted' && 'Orders accepted by you awaiting pickup or ready to start delivery.'}
                {activeTab === 'in_transit' && 'Track packages currently on route and mark complete on arrival.'}
                {activeTab === 'history' && 'Full history of your completed and delivered medicine packages.'}
              </p>
            </div>
            
            <button
              onClick={fetchDeliveries}
              className="bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5 self-start sm:self-auto shadow-sm uppercase tracking-wider"
            >
              <span>🔄 Refresh</span>
            </button>
          </div>

          {loading ? (
            <div className="py-16 text-center text-xs font-semibold text-slate-400 animate-pulse">
              <span className="text-3xl block mb-2">🚚</span>
              Fetching delivery jobs for partner {partnerName}...
            </div>
          ) : displayedOrders.length > 0 ? (
            <div className="grid grid-cols-1 gap-4">
              {displayedOrders.map((o) => {
                const isUpdating = updatingId === o.id;
                let statusPillClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (o.status === 'delivered') statusPillClass = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                else if (o.status === 'ready' || o.status === 'out_for_delivery') statusPillClass = 'bg-sky-50 text-sky-700 border-sky-200';
                else if (o.status === 'placed' || o.status === 'confirmed' || o.status === 'processing') statusPillClass = 'bg-amber-50 text-amber-700 border-amber-200';
                else if (o.status === 'cancelled') statusPillClass = 'bg-rose-50 text-rose-700 border-rose-200';

                return (
                  <div
                    key={o.id}
                    className="p-5 rounded-2xl border border-slate-200/80 hover:border-[#0D9488]/50 transition-all bg-slate-50/40 hover:bg-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 group"
                  >
                    <div className="space-y-4 flex-1 w-full">
                      {/* Order Number & Status Badges */}
                      <div className="flex flex-wrap items-center justify-between md:justify-start gap-3">
                        <Link href={`/delivery/orders/${o.id}`} className="font-black text-slate-900 text-base hover:text-[#0D9488] hover:underline flex items-center gap-1.5 transition-colors">
                          <span className="font-mono bg-white border border-slate-200 px-2 py-0.5 rounded-lg shadow-sm">#{o.order_number}</span>
                          <span className="text-xs text-[#0D9488] font-bold">↗</span>
                        </Link>
                        
                        <div className="flex items-center gap-2">
                           <span className={`text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider border ${statusPillClass}`}>
                            {o.status === 'out_for_delivery' ? 'In Transit 🚚' : o.status?.replace(/_/g, ' ')}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 bg-white border border-slate-100 px-2 py-0.5 rounded-lg font-bold">
                            {o.placed_at ? new Date(o.placed_at).toLocaleDateString('en-IN') : 'New'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Store Branch Details Box */}
                        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-start gap-3 relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-400"></div>
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0 border border-indigo-100">
                            🏬
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-0.5">
                              <span className="font-extrabold text-xs text-slate-900">{o.branch?.name || 'Pharmacy Branch'}</span>
                            </div>
                            <p className="text-[10px] font-medium text-slate-500 line-clamp-1">
                              {o.branch?.address || 'Branch location'}, {o.branch?.city || ''}
                            </p>
                          </div>
                        </div>

                        {/* Customer & Destination Info */}
                        <div className="bg-white border border-slate-200/80 p-3.5 rounded-xl flex items-start gap-3 relative overflow-hidden">
                           <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
                           <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center text-sm shrink-0 border border-emerald-100">
                            📍
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900 text-xs mb-0.5">{o.customer?.full_name || 'Customer'}</p>
                            <p className="text-slate-500 font-medium text-[10px] line-clamp-1">
                              {o.delivery_address?.line1 || o.delivery_partner_address?.line1 || 'Address attached'}, {o.delivery_address?.city || o.delivery_partner_address?.city || ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 mt-2">
                        <div>
                          <span className="font-bold text-slate-500 uppercase tracking-wider text-[9px]">Value: </span>
                          <span className="font-black text-slate-900 font-mono text-sm">₹{Number(o.total || 0).toFixed(2)}</span>
                        </div>

                        {/* Inline Status Updater */}
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider hidden sm:inline-block">Update:</span>
                          <select
                            value={o.status}
                            disabled={isUpdating}
                            onChange={(e) => handleUpdateStatus(o.id, e.target.value)}
                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-[10px] font-bold text-slate-700 outline-none focus:border-[#0D9488] cursor-pointer uppercase tracking-wider"
                          >
                            <option value="placed">Placed</option>
                            <option value="confirmed">Verified</option>
                            <option value="processing">Packed</option>
                            <option value="ready">Ready</option>
                            <option value="out_for_delivery">In Transit</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Action Controls & Primary Track Order Button */}
                    <div className="flex flex-col sm:flex-row md:flex-col items-stretch gap-2 w-full md:w-48 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-200/60">
                      
                      <Link
                        href={`/delivery/orders/${o.id}`}
                        className="w-full bg-[#0D9488] hover:bg-[#044E3B] text-white text-[11px] uppercase tracking-wider font-black py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-md shadow-[#0D9488]/20 text-center"
                      >
                        <span className="text-sm">📍</span>
                        <span>Track Order</span>
                      </Link>

                      {/* Quick Action Button based on status */}
                      {o.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'out_for_delivery')}
                          disabled={isUpdating}
                          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] uppercase tracking-wider font-black py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                        >
                          {isUpdating ? '...' : 'Start Delivery 🚚'}
                        </button>
                      )}

                      {o.status === 'out_for_delivery' && (
                        <button
                          onClick={() => handleUpdateStatus(o.id, 'delivered')}
                          disabled={isUpdating}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] uppercase tracking-wider font-black py-2.5 rounded-xl transition-all shadow-sm disabled:opacity-50"
                        >
                          {isUpdating ? '...' : 'Mark Delivered ✓'}
                        </button>
                      )}

                      {o.status === 'delivered' && (
                        <span className="w-full bg-emerald-50 text-emerald-700 font-black text-center text-[10px] uppercase tracking-wider py-2.5 rounded-xl border border-emerald-200">
                          ✓ Delivered
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
              <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-xl flex items-center justify-center mx-auto mb-3 text-2xl font-bold border border-slate-200">
                📦
              </div>
              <h3 className="text-sm font-bold text-slate-800">No orders found in this view</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1 max-w-sm mx-auto">
                {selectedBranchId !== 'all' ? 'No assigned orders match the selected branch filter.' : 'There are currently no orders in this status queue.'}
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}