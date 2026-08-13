'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const statusBadgeStyles = {
  placed: {
    bg: 'bg-blue-50 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
    label: 'Placed'
  },
  confirmed: {
    bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
    label: 'Confirmed'
  },
  processing: {
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    label: 'Processing'
  },
  ready: {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
    label: 'Ready for Pickup'
  },
  out_for_delivery_partner: {
    bg: 'bg-orange-50 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
    label: 'Out for Delivery'
  },
  delivered: {
    bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    dot: 'bg-emerald-500',
    label: 'Delivered'
  },
  cancelled: {
    bg: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-500',
    label: 'Cancelled'
  },
};

const filterTabs = [
  { key: '', label: 'All Orders' },
  { key: 'placed', label: 'Placed' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'ready', label: 'Ready' },
  { key: 'out_for_delivery_partner', label: 'Out for Delivery' },
  { key: 'delivered', label: 'Delivered' },
  { key: 'cancelled', label: 'Cancelled' },
];

export default function CustomerOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login?redirect=/customer/orders');
      return;
    }
    if (user) fetchOrders();
  }, [user, authLoading, statusFilter]);

  async function fetchOrders() {
    setLoading(true);
    try {
      const params = { limit: 20 };
      if (statusFilter) params.status = statusFilter;
      const res = await api.get('/api/orders', params);
      setOrders(res.data || []);
    } catch {
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || !user) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Breadcrumbs & Header */}
        <div className="mb-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
            <span>/</span>
            <span className="text-slate-700">My Orders</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">My Orders</h1>
              <p className="text-xs text-slate-500 mt-1">Track and manage your pharmacy orders and prescription fulfillments</p>
            </div>
            {orders.length > 0 && !loading && (
              <span className="px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold self-start sm:self-auto">
                {orders.length} {orders.length === 1 ? 'Order' : 'Orders'} Found
              </span>
            )}
          </div>
        </div>

        {/* Status Filter Tab Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 scrollbar-none">
          {filterTabs.map((tab) => {
            const isActive = statusFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border cursor-pointer ${
                  isActive
                    ? 'bg-[#044E3B] text-white border-[#044E3B] shadow-sm shadow-emerald-900/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-[#0D9488] hover:text-[#0D9488]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content list */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm animate-pulse">
                <div className="flex justify-between items-center mb-4">
                  <div className="h-5 bg-slate-200 rounded-md w-1/4" />
                  <div className="h-6 bg-slate-100 rounded-full w-24" />
                </div>
                <div className="h-4 bg-slate-100 rounded w-1/3 mb-2" />
                <div className="h-4 bg-slate-100 rounded w-1/5" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusConfig = statusBadgeStyles[order.status] || {
                bg: 'bg-slate-100 text-slate-700 border-slate-200',
                dot: 'bg-slate-400',
                label: order.status?.replace(/_/g, ' ') || 'Unknown'
              };

              const formattedDate = new Date(order.placed_at || order.createdAt).toLocaleDateString('en-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <Link
                  key={order.id}
                  href={`/customer/orders/${order.id}`}
                  className="block bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-emerald-300 transition-all duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    
                    {/* Order ID & Date */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 border border-slate-200/80 px-2.5 py-1 rounded-lg">
                        {order.order_number}
                      </span>
                      <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formattedDate}
                      </span>
                    </div>

                    {/* Status Badge */}
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${statusConfig.bg} self-start sm:self-auto`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot}`} />
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Branch & Total Bar */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-sm">
                    <div className="flex items-center gap-1.5 text-slate-600 font-medium text-xs sm:text-sm">
                      <svg className="w-4 h-4 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span>{order.branch?.name || 'Main Pharmacy Branch'}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total</span>
                        <span className="text-base sm:text-lg font-black text-slate-900 font-mono">
                          ₹{Number(order.total || 0).toFixed(2)}
                        </span>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200/80 group-hover:bg-emerald-50 group-hover:border-emerald-200 text-slate-400 group-hover:text-emerald-700 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 border border-slate-200/80 shadow-sm text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-slate-50 border border-slate-100 flex items-center justify-center text-4xl">
              📦
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Orders Found</h3>
            <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
              {statusFilter
                ? `You don't have any orders matching the status "${statusFilter.replace(/_/g, ' ')}".`
                : "You haven't placed any pharmacy orders yet."}
            </p>
            <Link
              href="/customer/medicines"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#044E3B] to-[#0D9488] hover:from-[#033B2C] hover:to-[#0B7A70] text-white font-bold px-6 py-3 rounded-xl shadow-md shadow-teal-900/20 text-sm transition-all hover:scale-[1.02]"
            >
              <span>Browse Medicines</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}

