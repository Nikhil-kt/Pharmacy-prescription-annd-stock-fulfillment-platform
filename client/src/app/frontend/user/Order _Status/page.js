"use client";

import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";
import { Package, Clock, CheckCircle2, AlertCircle } from "lucide-react";

export default function OrderStatusPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const API_BASE_URL = "http://localhost:5000/api/customer";

  useEffect(() => {
    async function fetchOrders() {
      try {
        const stored = typeof window !== "undefined" ? localStorage.getItem("user") : null;
        const user = stored ? JSON.parse(stored) : null;
        const customerId = user?.id;
        const url = customerId
          ? `${API_BASE_URL}/orders?customer_id=${customerId}`
          : `${API_BASE_URL}/orders`;
        const res = await fetch(url);
        const data = await res.json();
        if (res.ok && data.success) {
          setOrders(data.orders || []);
        } else {
          setError(data.error || "Failed to load order history.");
        }
      } catch (err) {
        setError(`Connection failed: ${err.message}`);
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
      case "completed":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            <CheckCircle2 size={12} /> Delivered
          </span>
        );
      case "processing":
      case "accepted":
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-blue-200">
            <Clock size={12} /> Processing
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-bold px-2.5 py-1 rounded-full border border-amber-200">
            <Clock size={12} /> Pending Review
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-50">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Orders & Status</h1>
          <p className="text-xs text-gray-500 mt-1">Track live status for medicine deliveries and past purchases.</p>
        </div>

        {error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-xl text-xs border border-red-200 flex items-center gap-2">
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-400">Loading order status...</div>
        ) : orders.length === 0 ? (
          <div className="bg-white border rounded-2xl p-10 text-center text-xs text-gray-500 space-y-2">
            <Package size={32} className="mx-auto text-gray-300" />
            <p className="font-semibold text-gray-700">No active or past orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm text-gray-900">Order #{order.id}</span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    Date: {new Date(order.created_at || Date.now()).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">
                    Branch: {order.branch_name || "Primary Branch"}
                  </p>
                </div>

                <div className="text-right sm:text-right flex sm:flex-col justify-between items-center sm:items-end border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                  <span className="text-xs text-gray-400">Total Amount</span>
                  <span className="text-base font-extrabold text-[#0E7C50]">
                    ${Number(order.total_price || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}