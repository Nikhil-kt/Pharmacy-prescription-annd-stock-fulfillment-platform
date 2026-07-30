'use client';

import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [returnReason, setReturnReason] = useState('');

  const handleTrack = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/order/track/${orderId}`);
      const data = await res.json();
      if (res.ok) setTrackedOrder(data.order);
      else alert(data.error || 'Order not found');
    } catch (err) {
      alert('Network Error');
    }
  };

  const handleCancel = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/order/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: trackedOrder.id, cancellation_reason: cancelReason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Order cancelled!');
        setTrackedOrder(data.order);
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  const handleReturn = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/order/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: trackedOrder.id, return_reason: returnReason }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Return requested!');
        setTrackedOrder(data.order);
      }
    } catch (err) {
      alert('Network Error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
        Tickets #29, #31, #32
      </span>
      <h1 className="text-xl font-bold text-slate-800 mt-2">Order Tracking & Actions</h1>

      <form onSubmit={handleTrack} className="flex gap-3">
        <input
          type="text"
          placeholder="Order UUID..."
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="flex-1 px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
          Track
        </button>
      </form>

      {trackedOrder && (
        <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 space-y-4">
          <p className="text-sm font-bold">Order ID: {trackedOrder.id}</p>
          <p className="text-xs text-slate-600">Status: <strong className="uppercase">{trackedOrder.status}</strong></p>

          {/* Cancel Option */}
          {['pending', 'processing', 'assigned'].includes(trackedOrder.status) && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <input
                type="text"
                placeholder="Cancellation reason..."
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
              <button onClick={handleCancel} className="bg-rose-600 text-white text-xs px-3 py-1.5 rounded">
                Cancel Order
              </button>
            </div>
          )}

          {/* Return Option */}
          {trackedOrder.status === 'delivered' && (
            <div className="pt-3 border-t border-slate-200 space-y-2">
              <input
                type="text"
                placeholder="Return reason..."
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full px-3 py-1.5 border border-slate-300 rounded text-xs"
              />
              <button onClick={handleReturn} className="bg-amber-600 text-white text-xs px-3 py-1.5 rounded">
                Request Return
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}