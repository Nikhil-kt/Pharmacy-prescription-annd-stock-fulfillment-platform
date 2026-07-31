'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DeliveryDashboard({ partnerId = '1' }) {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pending: 0,
    inTransit: 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      try {
        // Pointing to your registered backend route with partner ID
        const res = await fetch(
          `http://localhost:5000/api/delivery/partner/${partnerId}/dashboard`
        );

        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        } else {
          console.warn(
            'Backend returned non-JSON response. Ensure Express server is running and endpoint route exists.'
          );
        }
      } catch (err) {
        console.warn('Backend server unreachable or endpoint error:', err.message);
      } finally {
        setLoading(false);
      }
    }

    if (partnerId) {
      fetchStats();
    }
  }, [partnerId]);

  const pages = [
    { name: 'Assign Partner', path: '/frontend/delivery/assign-partner', desc: 'Pair orders with drivers' },
    { name: 'Active Assignments', path: '/frontend/delivery/assignments', desc: 'Manage live deliveries' },
    { name: 'Track Orders', path: '/frontend/delivery/track-order', desc: 'Real-time order tracking' },
    { name: 'Accepted Orders', path: '/frontend/delivery/Accepted_Order', desc: 'Orders ready for packaging' },
    { name: 'Branch Stock', path: '/frontend/delivery/Branch_stock', desc: 'Check inventory levels' },
    { name: 'Order History', path: '/frontend/delivery/Order_history', desc: 'Past delivery logs' },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Summary Card Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Orders */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.totalOrders ?? stats.total ?? 0}
          </p>
        </div>

        {/* Pending */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-amber-600 font-medium">Pending</p>
          <p className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.pending}
          </p>
        </div>

        {/* In Transit */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-blue-600 font-medium">In Transit</p>
          <p className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.inTransit}
          </p>
        </div>

        {/* Completed */}
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-emerald-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-slate-800">
            {loading ? '...' : stats.completed}
          </p>
        </div>
      </div>

      {/* Navigation Grid to Sub-pages */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {pages.map((item) => (
          <Link
            key={item.path}
            href={item.path}
            className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm hover:border-blue-500 hover:shadow-md transition group"
          >
            <h3 className="font-semibold text-slate-800 group-hover:text-blue-600">
              {item.name} {'\u2192'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}