'use client';

import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function AssignPartnerPage() {
  const [orderId, setOrderId] = useState('');
  const [partnerId, setPartnerId] = useState('');

  const handleAssign = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, delivery_partner_id: partnerId }),
      });
      const data = await res.json();
      if (res.ok) {
        alert('Partner assigned successfully!');
        setOrderId('');
        setPartnerId('');
      } else {
        alert(data.error || 'Assignment failed');
      }
    } catch (err) {
      alert('Network Error: Cannot connect to server.');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
        Ticket #28
      </span>
      <h1 className="text-xl font-bold text-slate-800 mt-2 mb-4">Assign Delivery Partner</h1>
      <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Order UUID"
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <input
          type="text"
          placeholder="Delivery Partner UUID"
          value={partnerId}
          onChange={(e) => setPartnerId(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 px-4 rounded-lg shadow-sm transition"
        >
          Assign Partner
        </button>
      </form>
    </div>
  );
}