"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function TodaysOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/todays-orders");
        const data = await res.json();
        if (data.success) setOrders(data.data);
      } catch (err) {
        console.error("Error fetching today's orders:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <Link href="/frontend/admin/dashboard" className="text-xs font-semibold text-[#0E7C50] hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Todays Orders
            </h1>
          </div>
          <span className="text-xs px-3 py-1 bg-green-50 text-[#0E7C50] font-semibold border border-green-200 rounded-full">
            Total Orders: {orders.length}
          </span>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading todays orders...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.length > 0 ? (
                  orders.map((order, idx) => (
                    <tr key={order.id || idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">#{order.id || idx + 1}</td>
                      <td className="py-3 px-4">{order.customer_name || "Guest Customer"}</td>
                      <td className="py-3 px-4 font-bold text-[#0E7C50]">₹{order.total_amount || 0}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded border border-blue-200 font-medium">
                          {order.status || "Completed"}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">No orders placed today.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}