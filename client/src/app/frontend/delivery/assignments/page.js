'use client';

import { useState } from 'react';

const API_BASE_URL = 'http://localhost:5000/api';

export default function DeliveryAssignmentsPage() {
  const [partnerId, setPartnerId] = useState('');
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchHistory = async () => {
    if (!partnerId) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/history/${partnerId}`);
      const data = await res.json();
      if (res.ok) setHistory(data.history || []);
      else alert(data.error || 'Failed to fetch history');
    } catch (err) {
      alert('Network Error');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (assignmentId, orderId, newStatus) => {
    try {
      const res = await fetch(`${API_BASE_URL}/delivery/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignment_id: assignmentId, order_id: orderId, status: newStatus }),
      });
      if (res.ok) fetchHistory();
      else alert('Failed to update status');
    } catch (err) {
      alert('Network Error');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full">
            Tickets #38 & #30
          </span>
          <h1 className="text-xl font-bold text-slate-800 mt-2">Delivery Assignments & Status</h1>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Partner UUID..."
            value={partnerId}
            onChange={(e) => setPartnerId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={fetchHistory}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-300"
          >
            Load History
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-8 text-center text-sm text-slate-500">Loading assignments...</div>
      ) : history.length === 0 ? (
        <div className="py-8 text-center border-2 border-dashed border-slate-200 rounded-lg text-sm text-slate-400">
          No delivery assignments found.
        </div>
      ) : (
        <div className="space-y-3">
          {history.map((item) => (
            <div key={item.id} className="flex justify-between items-center p-4 rounded-lg border border-slate-200 bg-slate-50">
              <div>
                <p className="text-sm font-bold text-slate-800">Order ID: {item.orders?.id}</p>
                <p className="text-xs text-slate-600">Amount: ${item.orders?.total_amount}</p>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-xs font-semibold uppercase px-2.5 py-1 rounded bg-blue-100 text-blue-800">
                  {item.status}
                </span>
                <select
                  value={item.status}
                  onChange={(e) => handleStatusUpdate(item.id, item.orders?.id, e.target.value)}
                  className="text-xs border border-slate-300 rounded px-2 py-1"
                >
                  <option value="assigned">Assigned</option>
                  <option value="picked_up">Picked Up</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}