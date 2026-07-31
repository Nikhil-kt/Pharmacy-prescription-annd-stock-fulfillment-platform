"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function ManualOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    const fetchPendingOrders = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/admin/pending-orders");
        const data = await res.json();
        if (data.success) {
          setOrders(data.data || []);
        }
      } catch (err) {
        console.error("Error fetching pending orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchPendingOrders();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch(`http://localhost:5000/api/admin/orders/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        // Remove approved or rejected order from the list
        setOrders((prev) => prev.filter((o) => o.id !== orderId));
      } else {
        alert(data.message || "Failed to update order status");
      }
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Network error updating order status");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <Link
              href="/frontend/admin/dashboard"
              className="text-xs font-semibold text-[#0E7C50] hover:underline"
            >
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Order Approval & Verification
            </h1>
          </div>
          <span className="text-xs px-3 py-1 bg-amber-50 text-amber-800 font-semibold border border-amber-200 rounded-full">
            Pending Approvals: {orders.length}
          </span>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">
              Loading pending orders...
            </div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-sm font-medium text-emerald-600 bg-emerald-50">
              No orders requiring manual approval at this time.
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Order ID</th>
                  <th className="py-3 px-4 font-semibold">Customer</th>
                  <th className="py-3 px-4 font-semibold">Branch</th>
                  <th className="py-3 px-4 font-semibold">Total Amount</th>
                  <th className="py-3 px-4 font-semibold">Prescription Check</th>
                  <th className="py-3 px-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {orders.map((order, idx) => (
                  <tr key={order.id || idx} className="hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-900">
                      #{order.id}
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.customers?.full_name || order.customers?.email || "Guest Customer"}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      {order.branch?.name || "N/A"}
                    </td>
                    <td className="py-3 px-4 font-bold text-[#0E7C50]">
                      ₹{order.total_amount || 0}
                    </td>
                    <td className="py-3 px-4">
                      {order.prescription_id ? (
                        <span className="px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
                          Prescription Attached
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                          Standard Order
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleUpdateStatus(order.id, "approved")}
                        disabled={updatingId === order.id}
                        className="px-3 py-1 bg-[#0E7C50] text-white text-xs font-medium rounded hover:bg-[#0B6A44] transition-colors disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, "rejected")}
                        disabled={updatingId === order.id}
                        className="px-3 py-1 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded hover:bg-rose-100 transition-colors disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}