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
        remarks: remarks || `Status updated to ${targetStatus} by delivery partner`,
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <span className="text-4xl block mb-2 animate-bounce">🚚</span>
          <p className="text-xs text-gray-500 font-semibold">Loading order details & tracking information...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 p-8 text-center">
        <h2 className="text-lg font-bold text-gray-800">Order Not Found</h2>
        <p className="text-xs text-gray-500 mt-1">The requested order does not exist or has been removed.</p>
        <Link href="/delivery/dashboard" className="mt-4 inline-block bg-primary text-white text-xs font-bold px-4 py-2 rounded-xl">
          ← Back to Delivery Dashboard
        </Link>
      </div>
    );
  }

  const statusSteps = [
    { key: 'placed', label: 'Order Placed', icon: '📝' },
    { key: 'confirmed', label: 'Verified', icon: '✓' },
    { key: 'processing', label: 'Packed & Prepared', icon: '📦' },
    { key: 'ready', label: 'Ready for Pickup', icon: '🏪' },
    { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🚚' },
    { key: 'delivered', label: 'Delivered', icon: '✅' },
  ];

  const currentStepIdx = statusSteps.findIndex((s) => s.key === order.status);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Top Header & Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <Link
              href="/delivery/dashboard"
              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200 mb-2 transition-all"
            >
              <span>←</span> Back to Delivery Dashboard
            </Link>
            <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
              <span>Order #{order.order_number}</span>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full uppercase tracking-wider ${
                order.status === 'delivered'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  : order.status === 'out_for_delivery'
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : order.status === 'ready'
                  ? 'bg-blue-100 text-blue-800 border border-blue-200'
                  : 'bg-amber-100 text-amber-800 border border-amber-200'
              }`}>
                {order.status === 'out_for_delivery' ? 'Out for Delivery 🚚' : order.status?.replace(/_/g, ' ')}
              </span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              Placed on: {order.placed_at ? new Date(order.placed_at).toLocaleString() : 'N/A'}
            </p>
          </div>

          <button
            onClick={fetchOrderDetails}
            className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-xs font-bold px-4 py-2 rounded-xl transition-all self-start sm:self-auto shadow-sm"
          >
            🔄 Refresh Order
          </button>
        </div>

        {/* ═══════════ LIVE TRACKING TIMELINE BAR ═══════════ */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-8">
          <h2 className="text-sm font-extrabold text-gray-900 uppercase tracking-wider mb-6 flex items-center gap-2">
            <span>🚚</span> Live Order Delivery Timeline
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-center">
            {statusSteps.map((st, idx) => {
              const isPast = currentStepIdx >= idx;
              const isCurrent = order.status === st.key;

              return (
                <div key={st.key} className="flex flex-col items-center p-3 rounded-2xl bg-gray-50/70 border border-gray-100 relative">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-base mb-2 transition-all ${
                    isCurrent
                      ? 'bg-amber-600 text-white ring-4 ring-amber-600/20 scale-110 shadow-lg'
                      : isPast
                      ? 'bg-emerald-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isPast && !isCurrent ? '✓' : st.icon}
                  </div>
                  <span className={`text-xs font-extrabold ${isCurrent ? 'text-amber-700' : isPast ? 'text-emerald-700' : 'text-gray-400'}`}>
                    {st.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ═══════════ STATUS UPDATE PANEL ═══════════ */}
        <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 text-white rounded-3xl p-6 md:p-8 shadow-xl mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <span className="bg-white/20 text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full inline-block mb-2">
                Order Status Controller
              </span>
              <h2 className="text-xl font-extrabold">Update Delivery Order Status</h2>
              <p className="text-xs text-amber-100 mt-1">
                Select and update the live status to Verified, Packed, Out for Delivery, or Delivered.
              </p>
            </div>

            {/* Quick Status Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => handleUpdateStatus('confirmed')}
                disabled={updating}
                className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all disabled:opacity-50"
              >
                ✓ Mark Verified
              </button>
              <button
                onClick={() => handleUpdateStatus('processing')}
                disabled={updating}
                className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all disabled:opacity-50"
              >
                📦 Mark Packed
              </button>
              <button
                onClick={() => handleUpdateStatus('ready')}
                disabled={updating}
                className="bg-white/15 hover:bg-white/25 text-white font-extrabold text-xs px-3.5 py-2.5 rounded-xl border border-white/20 transition-all disabled:opacity-50"
              >
                🏪 Ready for Pickup
              </button>
              <button
                onClick={() => handleUpdateStatus('out_for_delivery')}
                disabled={updating}
                className="bg-white text-amber-900 hover:bg-amber-100 font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                🚚 Out for Delivery
              </button>
              <button
                onClick={() => handleUpdateStatus('delivered')}
                disabled={updating}
                className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-md disabled:opacity-50"
              >
                ✅ Mark Delivered
              </button>
            </div>
          </div>

          {/* Detailed Status Selector Form */}
          <div className="mt-6 pt-6 border-t border-white/20 flex flex-col md:flex-row items-stretch md:items-center gap-3">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white text-gray-900 text-xs font-bold px-4 py-3 rounded-xl outline-none min-w-[200px]"
            >
              <option value="placed">Placed (Order Received)</option>
              <option value="confirmed">Confirmed / Verified ✓</option>
              <option value="processing">Processing / Packed 📦</option>
              <option value="ready">Ready for Store Pickup 🏪</option>
              <option value="out_for_delivery">Out for Delivery 🚚</option>
              <option value="delivered">Delivered ✅</option>
              <option value="cancelled">Cancelled ❌</option>
            </select>

            <input
              type="text"
              placeholder="Add optional status remarks (e.g. Package packed by pharmacist)..."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="flex-1 bg-white/10 text-white placeholder-amber-200 border border-white/20 rounded-xl px-4 py-3 text-xs outline-none focus:bg-white/20"
            />

            <button
              onClick={() => handleUpdateStatus(selectedStatus)}
              disabled={updating}
              className="bg-white text-amber-950 font-black text-xs px-6 py-3 rounded-xl hover:bg-amber-100 transition-all shadow-lg shrink-0 disabled:opacity-50"
            >
              {updating ? 'Saving Status...' : 'Apply Status Update'}
            </button>
          </div>
        </div>

        {/* ═══════════ MAIN DETAILS GRID: STORE, CUSTOMER & ITEMS ═══════════ */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">

          {/* Left 2 Columns: Order Items & Billing Summary */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Order Items List */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-base font-extrabold text-gray-900">
                  Medicines & Order Items ({order.order_items?.length || 0})
                </h3>
                <span className="bg-gray-100 text-gray-700 font-mono text-xs font-bold px-2.5 py-1 rounded-lg">
                  Total: ₹{Number(order.total || 0).toFixed(2)}
                </span>
              </div>

              {order.order_items && order.order_items.length > 0 ? (
                <div className="divide-y divide-gray-100">
                  {order.order_items.map((item) => (
                    <div key={item.id} className="py-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        {item.medicine?.image_url ? (
                          <img
                            src={item.medicine.image_url}
                            alt={item.medicine.name}
                            className="w-12 h-12 object-contain bg-gray-50 border border-gray-100 rounded-xl p-1 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-amber-100 text-amber-800 rounded-xl flex items-center justify-center font-bold text-xl shrink-0">
                            💊
                          </div>
                        )}
                        <div>
                          <p className="font-extrabold text-gray-900 text-xs md:text-sm">
                            {item.medicine?.name || 'Medicine Product'}
                          </p>
                          <p className="text-[11px] text-gray-400">
                            {item.medicine?.generic_name || 'Generic Medicine'}
                          </p>
                          {item.requires_prescription && (
                            <span className="inline-block mt-1 bg-red-100 text-red-700 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                              Rx Required
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-extrabold text-gray-900 text-xs md:text-sm">
                          ₹{Number((item.unit_price || item.medicine?.mrp || 0) * item.quantity).toFixed(2)}
                        </span>
                        <p className="text-[11px] text-gray-400">
                          Qty: {item.quantity} × ₹{Number(item.unit_price || item.medicine?.mrp || 0).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-6 text-center">No individual items recorded for this order.</p>
              )}

              {/* Order Billing Summary */}
              <div className="mt-6 pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-gray-800">₹{Number(order.subtotal || order.total || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Delivery Charge:</span>
                  <span className="font-semibold text-emerald-600">FREE</span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-gray-900 pt-2 border-t border-gray-100">
                  <span>Grand Total:</span>
                  <span className="text-emerald-600 text-base font-black">₹{Number(order.total || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Status History Timeline Log */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100">
              <h3 className="text-base font-extrabold text-gray-900 mb-4 flex items-center gap-2">
                <span>📜</span> Order Audit & Status Change History
              </h3>

              {history.length > 0 ? (
                <div className="space-y-3">
                  {history.map((h, i) => (
                    <div key={h.id || i} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 flex items-start justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 capitalize">Status → {h.to_status?.replace(/_/g, ' ')}</span>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {h.changed_at ? new Date(h.changed_at).toLocaleString() : ''}
                          </span>
                        </div>
                        {h.remarks && <p className="text-gray-500 text-[11px] mt-0.5">{h.remarks}</p>}
                      </div>
                      <span className="text-[10px] font-semibold text-gray-600 bg-white px-2 py-0.5 rounded border">
                        {h.changed_by_profile?.full_name || 'System'}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 py-4 text-center">No previous status history logged.</p>
              )}
            </div>

          </div>

          {/* Right 1 Column: Store Pickup & Customer Info */}
          <div className="space-y-6">

            {/* Store Pickup Location Card */}
            <div className="bg-amber-50/90 rounded-3xl p-6 shadow-sm border border-amber-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider">🏬 Store Pickup Location</span>
                <span className="bg-amber-200 text-amber-900 font-mono font-bold text-[10px] px-2 py-0.5 rounded">
                  {order.branch?.code || 'MAIN'}
                </span>
              </div>
              <h4 className="font-extrabold text-gray-900 text-base">{order.branch?.name || 'Main Pharmacy Branch'}</h4>
              <p className="text-xs text-gray-700 mt-2 font-medium">📍 {order.branch?.address || 'Branch Store Address'}</p>
              <p className="text-xs font-bold text-amber-800 mt-1 font-mono">{order.branch?.city || 'City'}</p>
            </div>

            {/* Customer Destination Card */}
            <div className="bg-blue-50/90 rounded-3xl p-6 shadow-sm border border-blue-200">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-wider block mb-3">📍 Customer Delivery Address</span>
              <h4 className="font-extrabold text-gray-900 text-base">{order.customer?.full_name || 'Customer'}</h4>
              <p className="text-xs text-gray-700 mt-2 font-medium">
                {order.delivery_address?.line1 || order.delivery_partner_address?.line1 || 'Address details'}, {order.delivery_address?.city || order.delivery_partner_address?.city || ''}
              </p>
              <p className="text-xs font-bold text-blue-800 mt-2 font-mono flex items-center gap-1">
                <span>📱 Contact Phone:</span>
                <a href={`tel:${order.customer?.phone}`} className="underline hover:text-blue-900">
                  {order.customer?.phone || 'No phone'}
                </a>
              </p>
            </div>

            {/* Prescription Attachment Card (If attached) */}
            {order.prescription && (
              <div className="bg-purple-50/90 rounded-3xl p-6 shadow-sm border border-purple-200">
                <span className="text-[10px] font-black text-purple-900 uppercase tracking-wider block mb-2">📄 Attached Prescription</span>
                <p className="text-xs text-gray-700 mb-3 font-semibold">Rx File Verified by Pharmacist</p>
                {order.prescription.file_url && (
                  <button
                    onClick={() => setPreviewPrescription(true)}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all"
                  >
                    View Prescription File 📄
                  </button>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Prescription Document Modal */}
      {previewPrescription && order?.prescription?.file_url && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center pb-3 mb-3 border-b border-gray-100">
              <h3 className="font-extrabold text-gray-900 text-sm">Prescription Document Preview</h3>
              <button
                onClick={() => setPreviewPrescription(false)}
                className="text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-900 rounded-2xl p-2">
              <img
                src={order.prescription.file_url}
                alt="Prescription"
                className="max-h-[65vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
