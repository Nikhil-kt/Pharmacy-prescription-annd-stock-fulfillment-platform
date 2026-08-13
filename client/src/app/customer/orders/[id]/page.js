'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

const statusSteps = ['placed', 'confirmed', 'processing', 'ready', 'out_for_delivery_partner', 'delivered'];

const statusStepLabels = {
  placed: 'Placed',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready',
  out_for_delivery_partner: 'Out for Delivery',
  delivered: 'Delivered',
};

export default function CustomerOrderDetailPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetch() {
      try {
        const [orderRes, historyRes] = await Promise.all([
          api.get(`/api/orders/${id}`),
          api.get(`/api/orders/${id}/history`).catch(() => ({ data: [] })),
        ]);
        setOrder(orderRes.data);
        setHistory(historyRes.data || []);
      } catch { /* empty */ }
      finally { setLoading(false); }
    }
    fetch();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 animate-pulse">
        <div className="h-8 bg-slate-200 rounded w-1/3 mb-6" />
        <div className="h-40 bg-slate-100 rounded-2xl mb-6" />
        <div className="h-60 bg-slate-100 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-[70vh] bg-[#F8FAFC] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 mb-4 rounded-3xl bg-slate-100 flex items-center justify-center text-4xl">📦</div>
        <p className="text-xl font-bold text-slate-900 mb-2">Order Not Found</p>
        <p className="text-slate-500 text-sm mb-6">The requested order details could not be retrieved.</p>
        <Link href="/customer/orders" className="inline-flex items-center gap-2 bg-[#044E3B] text-white font-bold px-6 py-2.5 rounded-xl hover:bg-[#033B2C] transition-colors">
          Back to Orders
        </Link>
      </div>
    );
  }

  const currentStepIndex = statusSteps.indexOf(order.status);

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-6">
          <Link href="/" className="hover:text-emerald-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/customer/orders" className="hover:text-emerald-700 transition-colors">Orders</Link>
          <span>/</span>
          <span className="text-slate-800 font-mono">{order.order_number}</span>
        </nav>

        {/* Order Header Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">{order.order_number}</h1>
                <span className="px-3 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold capitalize">
                  {order.status?.replace(/_/g, ' ')}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Placed on {new Date(order.placed_at || order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
            <div className="sm:text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Amount</span>
              <p className="text-2xl font-black text-slate-900 font-mono">₹{Number(order.total || 0).toFixed(2)}</p>
            </div>
          </div>

          {/* Industrial Status Stepper */}
          {order.status !== 'cancelled' && (
            <div>
              <div className="flex items-center justify-between mb-3 px-2">
                {statusSteps.map((step, i) => {
                  const isCompleted = i <= currentStepIndex;
                  return (
                    <div key={step} className="flex-1 flex items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all shrink-0 ${
                          isCompleted
                            ? 'bg-[#044E3B] text-white shadow-md shadow-emerald-900/20 ring-4 ring-emerald-50'
                            : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isCompleted ? '✓' : i + 1}
                      </div>
                      {i < statusSteps.length - 1 && (
                        <div
                          className={`flex-1 h-1.5 mx-1.5 rounded-full transition-colors ${
                            i < currentStepIndex ? 'bg-[#0D9488]' : 'bg-slate-100'
                          }`}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-between text-[11px] font-semibold text-slate-500 px-1">
                {statusSteps.map((s, i) => (
                  <span
                    key={s}
                    className={`capitalize text-center flex-1 truncate ${
                      i <= currentStepIndex ? 'text-slate-900 font-bold' : 'text-slate-400'
                    }`}
                  >
                    {statusStepLabels[s] || s.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Order Items Column */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                Order Items ({order.order_items?.length || 0})
              </h2>

              <div className="divide-y divide-slate-100">
                {order.order_items?.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="w-14 h-14 bg-gradient-to-br from-slate-50 to-emerald-50/50 rounded-xl border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                      💊
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-slate-900 truncate">{item.medicine?.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Qty: {item.quantity} × ₹{Number(item.unit_price).toFixed(2)}
                      </p>
                      {item.substitute && (
                        <span className="inline-block text-[11px] font-medium text-teal-700 bg-teal-50 px-2 py-0.5 rounded mt-1 border border-teal-100">
                          Substituted with: {item.substitute.name}
                        </span>
                      )}
                    </div>
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      ₹{(item.quantity * item.unit_price).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status History Timeline */}
            {history.length > 0 && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
                <h2 className="text-base font-extrabold text-slate-900 mb-4 pb-3 border-b border-slate-100">
                  Status History
                </h2>
                <div className="space-y-4">
                  {history.map((h, idx) => (
                    <div key={h.id || idx} className="flex items-start gap-3.5">
                      <div className="w-3 h-3 bg-[#0D9488] rounded-full mt-1.5 shrink-0 ring-4 ring-teal-50" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 capitalize">
                          {statusStepLabels[h.to_status] || h.to_status?.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                          {new Date(h.changed_at || h.createdAt).toLocaleString('en-IN')}
                        </p>
                        {h.remarks && <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2 rounded-lg border border-slate-100">{h.remarks}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Side Info Cards */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Delivery Address</h3>
              {order.delivery_partner_address || order.delivery_address ? (
                <div className="text-sm text-slate-700 leading-relaxed font-medium">
                  <p className="font-bold text-slate-900">{(order.delivery_partner_address || order.delivery_address).name || 'Recipient'}</p>
                  <p>{(order.delivery_partner_address || order.delivery_address).line1}</p>
                  {(order.delivery_partner_address || order.delivery_address).line2 && <p>{(order.delivery_partner_address || order.delivery_address).line2}</p>}
                  <p>
                    {(order.delivery_partner_address || order.delivery_address).city}
                    {(order.delivery_partner_address || order.delivery_address).state ? `, ${(order.delivery_partner_address || order.delivery_address).state}` : ''}
                  </p>
                  <p className="font-mono text-xs text-slate-500 mt-1">
                    Pincode: {(order.delivery_partner_address || order.delivery_address).pincode}
                  </p>
                </div>
              ) : (
                <p className="text-xs text-slate-400 font-medium">Address details not provided</p>
              )}
            </div>

            {/* Payment Summary */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
              <h3 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-3">Payment Summary</h3>
              <div className="space-y-2.5 text-sm pb-3 border-b border-slate-100">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span className="font-mono font-semibold text-slate-900">₹{Number(order.subtotal || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery Fee</span>
                  <span className="text-emerald-700 font-semibold">Free</span>
                </div>
              </div>
              <div className="pt-3 flex justify-between items-center font-extrabold text-slate-900">
                <span>Total Paid</span>
                <span className="text-lg font-mono font-black">₹{Number(order.total || 0).toFixed(2)}</span>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}

