'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function DeliveryDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inTransit: 0,
    completed: 0,
  });

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('http://localhost:5000/api/delivery/stats');
        
        // 1. Check if response is actually JSON before parsing
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.stats) {
            setStats(data.stats);
          }
        } else {
          console.warn('Backend returned non-JSON response (likely 404 HTML page). Check endpoint.');
        }
      } catch (err) {
        console.warn('Backend server unreachable or stats endpoint not ready yet.');
      }
    }

    fetchStats();
  }, []);

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
      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-slate-500 font-medium">Total Orders</p>
          <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-amber-600 font-medium">Pending</p>
          <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-blue-600 font-medium">In Transit</p>
          <p className="text-2xl font-bold text-slate-800">{stats.inTransit}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
          <p className="text-xs text-emerald-600 font-medium">Completed</p>
          <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
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
              {item.name} {"\u2192"}
            </h3>
            <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}