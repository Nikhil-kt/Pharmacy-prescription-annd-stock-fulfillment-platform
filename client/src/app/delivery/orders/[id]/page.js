'use client';

import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export default function DeliveryOrderDetailPage({ params }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const { user, profile, loading: authLoading } = useAuth();
  const router = useRouter();

  const [order, setOrder] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [remarks, setRemarks] = useState('');
  const [previewPrescription, setPreviewPrescription] = useState(false);

  useEffect(() => {
    const role = profile?.role || user?.user_metadata?.role;
    if (!authLoading && (!user || (role && role !== 'delivery' && role !== 'delivery_partner' && role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (user && orderId) {
      fetchOrderDetails();
    }
  }, [user, profile, authLoading, orderId]);

  async function fetchOrderDetails() {
    setLoading(true);
    try {
      const [orderRes, historyRes] = await Promise.all([
        api.get(`/api/orders/${orderId}`),
        api.get(`/api/orders/${orderId}/history`).catch(() => ({ data: [] })),
      ]);

      if (orderRes.data) {
        setOrder(orderRes.data);
        setSelectedStatus(orderRes.data.status || 'placed');
      }
      setHistory(historyRes.data || []);
    } catch (err) {
      console.error('Failed to fetch order details:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (statusToSet) => {
    const targetStatus = statusToSet || selectedStatus;
    if (!targetStatus || targetStatus === order?.status) return;

    setUpdating(true);
    try {
      await api.patch(`/api/orders/${orderId}/status`, {
        status: targetStatus,
        remarks: remarks || `Status updated to ${targetStatus.replace(/_/g, ' ')} by delivery partner`,
      });
      setRemarks('');
      await fetchOrderDetails();
    } catch (err) {
      alert(err.message || 'Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50/50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-4xl block mb-3 animate-bounce">🚚</span>
          <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider">Loading order tracking data...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-slate-50/50 p-8 text-center flex flex-col items-center justify-center">
        <h2 className="text-lg font-black text-slate-900">Order Not Found</h2>
        <p className="text-xs font-medium text-slate-500 mt-2 mb-6">The requested order does not exist or has been removed.</p>
        <Link href="/delivery/dashboard" className="inline-flex bg-[#0D9488] text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-xl hover:bg-[#044E3B] transition-colors">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { key: 'placed', label: 'Placed', icon: '📝' },
    { key: 'confirmed', label: 'Verified', icon: '✓' },
    { key: 'processing', label: 'Packed', icon: '📦' },
    { key: 'ready', label: 'Ready', icon: '🏪' },
    { key: 'out_for_delivery', label: 'In Transit', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="bg-slate-50/50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-8">

        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <Link
              href="/delivery/dashboard"
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 bg-white px-3 py-1.5 rounded-lg border border-slate-200 mb-3 transition-colors shadow-sm"
            >
              <span>← Dashboard</span>
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 flex flex-wrap items-center gap-3">
              <span className="font-mono bg-white border border-slate-200 px-3 py-1 rounded-xl shadow-sm">#{order.order_number}</span>
              <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg uppercase tracking-wider border shadow-sm ${
                order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : order.status === 'out_for_delivery' ? 'bg-purple-50 text-purple-700 border-purple-200'
                : order.status === 'ready' ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}>
                {order.status === 'out_for_delivery' ? 'Out for Delivery 🚚' : order.status?.replace(/_/g, ' ')}
              </span>
            </h1>
            <p className="text-[11px] text-slate-500 mt-2 font-mono font-bold">
              Placed on: {order.placed_at ? new Date(order.placed_at).toLocaleString('en-IN') : 'N/A'}
            </p>
          </div>

          <button
            onClick={fetchOrderDetails}
            className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-[10px] uppercase tracking-wider font-black px-4 py-2.5 rounded-xl transition-all self-start sm:self-auto shadow-sm flex items-center gap-2"
          >
            <span>🔄</span> Refresh Tracking
          </button>
        </div>

        {/* ═══════════ LIVE TRACKING TIMELINE BAR ═══════════ */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-emerald-200/80 mb-8">
          <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-6 flex items-center gap-2">
            <svg className="w-4 h-4 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Live Delivery Timeline
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
            {statusSteps.map((st, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = order.status === st.key;

              return (
                <div key={st.key} className="flex flex-col items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 relative">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-base mb-2 transition-all ${
                    isCurrent
                      ? 'bg-[#0D9488] text-white ring-4 ring-[#0D9488]/20 scale-110 shadow-lg'
                      : isPast
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-200 text-slate-400'
                  }`}>
                    {isPast && !isCurrent ? '✓' : st.icon}
                  </div>
                  <span className={`text-[10px] uppercase tracking-wider font-black mt-1 ${isCurrent ? 'text-[#0D9488]' : isPast ? 'text-emerald-700' : 'text-slate-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ STATUS UPDATE PANEL ═══════════ */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8 border border-slate-800 relative overflow-hidden">
           <div className="absolute top-0 right-0 w-64 h-64 bg-[#0D9488]/10 rounded-full blur-3xl pointer-events-none" />
           
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="bg-[#0D9488] text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md inline-block mb-3 tracking-widest shadow-sm">
                Command Center
              </span>
              <h2 className="text-xl font-black">Status Controller</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-1">
                Update the live package status and add optional dispatch remarks.
              </p>
            </div>

            {/* Quick Status Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleUpdateStatus('confirmed')}
                disabled={updating}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              >
                ✓ Verify
              </button>
              <button
                onClick={() => handleUpdateStatus('processing')}
                disabled={updating}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              >
                📦 Pack
              </button>
              <button
                onClick={() => handleUpdateStatus('ready')}
                disabled={updating}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl border border-slate-700 transition-colors disabled:opacity-50"
              >
                🏪 Ready
              </button>
              <button
                onClick={() => handleUpdateStatus('out_for_delivery')}
                disabled={updating}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-indigo-900/50 disabled:opacity-50"
              >
                🚚 Dispatch
              </button>
              <button
                onClick={() => handleUpdateStatus('delivered')}
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-black text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-colors shadow-md shadow-emerald-900/50 disabled:opacity-50"
              >
                ✅ Delivered
              </button>
            </div>
          </div>

          {/* Detailed Status Selector Form */}
          <div className="relative z-10 mt-6 pt-6 border-t border-slate-800 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-slate-800 text-white text-xs font-bold px-4 py-3 rounded-xl outline-none border border-slate-700 focus:border-[#0D9488] min-w-[200px] uppercase tracking-wider"
            >
              <option value="placed">Placed</option>
              <option value="confirmed">Verified ✓</option>
              <option value="processing">Packed 📦</option>
              <option value="ready">Ready for Pickup 🏪</option>
              <option value="out_for_delivery">In Transit 🚚</option>
              <option value="delivered">Delivered ✅</option>
              <option value="cancelled">Cancelled ❌</option>
            </select>

            <input
              type="text"
              placeholder="Add optional dispatch notes..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="flex-1 bg-slate-800 text-white placeholder-slate-500 border border-slate-700 rounded-xl px-4 py-3 text-xs font-medium outline-none focus:border-[#0D9488] transition-colors"
            />

            <button
              onClick={() => handleUpdateStatus(selectedStatus)}
              disabled={updating}
              className="bg-[#0D9488] text-white font-black text-[10px] uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-[#044E3B] transition-colors shadow-lg shadow-[#0D9488]/20 shrink-0 disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Commit Status'}
            </button>
          </div>
        </div>

        {/* ═══════════ MAIN DETAILS GRID: STORE, CUSTOMER & ITEMS ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8">

          {/* Left 2 Columns: Order Items & Billing Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Items List */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Manifest & Inventory ({order.order_items?.length || 0})
                </h3>
                <span className="bg-slate-50 border border-slate-200 text-slate-800 font-mono text-[11px] font-black px-3 py-1.5 rounded-lg shadow-sm">
                  TOTAL: ₹{Number(order.total || 0).toFixed(2)}
                </span>
              </div>

              {order.order_items && order.order_items.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4 group">
                      <div className="flex items-center gap-4">
                        {item.medicine?.image_url ? (
                          <img
                            src={item.medicine.image_url}
                            alt={item.medicine.name}
                            className="w-14 h-14 object-contain bg-white border border-slate-100 rounded-xl p-1 shrink-0 group-hover:border-[#0D9488]/40 transition-colors"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center font-bold text-2xl shrink-0 group-hover:border-[#0D9488]/40 transition-colors">
                            💊
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-slate-900 text-sm group-hover:text-[#0D9488] transition-colors">
                            {item.medicine?.name || 'Medicine Product'}
                          </p>
                          <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                            {item.medicine?.generic_name || 'Generic'}
                          </p>
                          {item.requires_prescription && (
                            <span className="inline-block mt-1.5 bg-amber-50 text-amber-800 border border-amber-200 text-[8px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                              Rx Reqd
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-black text-slate-900 text-sm font-mono block">
                          ₹{Number((item.unit_price || item.medicine?.mrp || 0) * item.quantity).toFixed(2)}
                        </span>
                        <p className="text-[10px] font-bold text-slate-400 font-mono mt-1">
                          {item.quantity} × ₹{Number(item.unit_price || item.medicine?.mrp || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-xs font-semibold text-slate-500">No individual items recorded in manifest.</p>
                </div>
              )}

              {/* Order Billing Summary */}
              <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5 text-xs font-bold">
                <div className="flex justify-between text-slate-500 uppercase tracking-wider text-[10px]">
                  <span>Subtotal:</span>
                  <span className="font-mono text-slate-800 text-xs">₹{Number(order.subtotal || order.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-500 uppercase tracking-wider text-[10px]">
                  <span>Delivery Fee:</span>
                  <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">FREE</span>
                </div>
                <div className="flex justify-between items-end pt-3 border-t border-slate-100 mt-3">
                  <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider">Grand Total:</span>
                  <span className="text-[#0D9488] text-xl font-black font-mono">₹{Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status History Timeline Log */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-slate-200/80">
              <h3 className="text-base font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Audit & Status Log
              </h3>

              {history.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:inset-0 before:ml-[13px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-slate-100">
                  {history.map((h, i) => (
                    <div key={h.id || i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       <div className="flex items-center justify-center w-7 h-7 rounded-full border-4 border-white bg-indigo-100 text-indigo-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                       </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-black text-slate-900 text-[11px] uppercase tracking-wider">{h.to_status?.replace(/_/g, ' ')}</span>
                          <span className="text-[9px] font-mono font-bold text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-100">
                            {h.changed_at ? new Date(h.changed_at).toLocaleTimeString('en-IN', {hour: '2-digit', minute:'2-digit'}) : ''}
                          </span>
                        </div>
                        {h.remarks && <p className="text-slate-500 text-[10px] font-medium leading-relaxed mt-1.5">{h.remarks}</p>}
                        <div className="mt-2 text-[8px] font-black text-slate-400 uppercase tracking-widest text-right">
                           By: {h.changed_by_profile?.full_name || 'System'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                   <p className="text-xs font-semibold text-slate-500">No previous status history logged.</p>
                </div>
              )}
            </div>

          </div>

          {/* Right 1 Column: Store Pickup & Customer Info */}
          <div className="space-y-5">

            {/* Store Pickup Location Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-indigo-100 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[9px] font-black text-indigo-800 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="text-sm">🏬</span> Store Pickup
                </span>
                <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 font-mono font-black text-[9px] px-2 py-0.5 rounded-lg shadow-sm">
                  {order.branch?.code || 'MAIN'}
                </span>
              </div>
              <h4 className="font-black text-slate-900 text-sm">{order.branch?.name || 'Main Pharmacy Branch'}</h4>
              <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">📍 {order.branch?.address || 'Branch Store Address'}</p>
              <p className="text-[11px] font-black text-indigo-700 mt-1 uppercase tracking-wider bg-indigo-50 inline-block px-2 py-0.5 rounded">{order.branch?.city || 'City'}</p>
            </div>

            {/* Customer Destination Card */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-emerald-100 relative overflow-hidden">
               <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500"></div>
              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1.5 mb-4">
                <span className="text-sm">📍</span> Delivery Destination
              </span>
              <h4 className="font-black text-slate-900 text-sm">{order.customer?.full_name || 'Customer'}</h4>
              <p className="text-[11px] text-slate-500 mt-2 font-medium leading-relaxed">
                {order.delivery_address?.line1 || order.delivery_partner_address?.line1 || 'Address attached in system'}, {order.delivery_address?.city || order.delivery_partner_address?.city || ''}
              </p>
              <div className="mt-4 pt-3 border-t border-slate-100">
                <a href={`tel:${order.customer?.phone}`} className="inline-flex items-center gap-1.5 text-[11px] font-black text-emerald-700 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors">
                  <span>📱 Call:</span>
                  <span className="font-mono">{order.customer?.phone || 'N/A'}</span>
                </a>
              </div>
            </div>

            {/* Prescription Attachment Card (If attached) */}
            {order.prescription && (
              <div className="bg-white rounded-3xl p-6 shadow-xs border border-purple-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500"></div>
                <span className="text-[9px] font-black text-purple-800 uppercase tracking-wider flex items-center gap-1.5 mb-3">
                  <span className="text-sm">📄</span> Attached Rx
                </span>
                <p className="text-[10px] text-slate-500 mb-4 font-bold">Document verified by pharmacist.</p>
                {order.prescription.file_url && (
                  <button
                    onClick={() => setPreviewPrescription(true)}
                    className="w-full bg-purple-50 hover:bg-purple-100 border border-purple-200 text-purple-700 font-black text-[10px] uppercase tracking-wider py-2.5 rounded-xl transition-all shadow-sm"
                  >
                    View Document
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Prescription Document Modal */}
      {previewPrescription && order?.prescription?.file_url && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-2 shadow-2xl relative max-h-[95vh] flex flex-col">
            <div className="flex justify-between items-center p-4">
              <h3 className="font-black text-slate-900 text-sm uppercase tracking-wider">Document Preview</h3>
              <button
                onClick={() => setPreviewPrescription(false)}
                className="text-slate-400 hover:text-slate-800 bg-slate-100 p-2 rounded-xl transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-slate-900 rounded-2xl mx-2 mb-2 p-4">
              <img
                src={order.prescription.file_url}
                alt="Prescription Document"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}