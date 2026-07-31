"use client";

import { useState, useEffect } from "react";

export default function OrderHistoryPage() {
  const [completedOrders, setCompletedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Base URL matching Express setup (e.g. http://localhost:5000/api/orders or /api/customer)
  const API_BASE_URL = "http://localhost:5000/api/customer";

  // Fetch Completed Orders
  const fetchOrderHistory = async () => {
    setLoading(true);
    setError("");

    try {
      // Endpoint for orders (adjust URL path according to your express route setup)
      const res = await fetch(`${API_BASE_URL}/orders/history`);
      const data = await res.json();

      if (res.ok && data.success) {
        const rawOrders = data.orders || data.data || [];

        // Filter explicitly for completed/delivered orders
        const completed = rawOrders.filter(
          (order) =>
            order.status?.toLowerCase() === "completed" ||
            order.status?.toLowerCase() === "delivered"
        );

        setCompletedOrders(completed);
      } else {
        setError(data.error || "Failed to load completed order history.");
      }
    } catch (err) {
      setError(`Network Error: ${err.message}. Check backend connection on port 5000.`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderHistory();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Completed Order History</h1>
          <p className="text-sm text-gray-500">
            View past fulfilled orders, delivered items, and transaction summaries.
          </p>
        </div>

        <button
          onClick={fetchOrderHistory}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh History
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="text-xs font-bold text-red-600 hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Fetching completed orders...
        </div>
      ) : completedOrders.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded-xl text-gray-500 text-sm">
          No completed order records found in history.
        </div>
      ) : (
        <div className="space-y-4">
          {completedOrders.map((order) => {
            const items = order.order_items || order.items || [];
            const branch = order.branches || order.branch || {};
            const createdDate = order.created_at
              ? new Date(order.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "N/A";

            return (
              <div
                key={order.id}
                className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 space-y-4 hover:shadow-md transition"
              >
                {/* Order Top Bar */}
                <div className="flex flex-wrap justify-between items-center border-b pb-3 text-sm gap-2">
                  <div>
                    <span className="font-bold text-gray-900">
                      Order #{String(order.id).slice(0, 8)}
                    </span>
                    <span className="text-gray-400 mx-2">•</span>
                    <span className="text-gray-500 text-xs">{createdDate}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                      ✓ Completed
                    </span>
                    <span className="font-bold text-gray-900 text-base">
                      ${Number(order.total_amount || order.price || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Details Meta */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-lg">
                  <p>
                    <strong className="text-gray-700">Branch:</strong>{" "}
                    {branch.branch_name || "Main Branch"}
                  </p>
                  <p>
                    <strong className="text-gray-700">Payment Status:</strong>{" "}
                    <span className="capitalize text-emerald-700 font-semibold">
                      {order.payment_status || "Paid"}
                    </span>
                  </p>
                  {order.delivery_address && (
                    <p className="col-span-1 sm:col-span-2">
                      <strong className="text-gray-700">Delivery Address:</strong>{" "}
                      {order.delivery_address}
                    </p>
                  )}
                </div>

                {/* Order Items Table */}
                {items.length > 0 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b text-gray-500 uppercase tracking-wider">
                          <th className="py-2 px-1 font-semibold">Medicine Item</th>
                          <th className="py-2 px-1 font-semibold">Quantity</th>
                          <th className="py-2 px-1 font-semibold">Price/Unit</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {items.map((item, idx) => {
                          const med = item.medicines1 || item.medicine || {};
                          return (
                            <tr key={idx} className="text-gray-700">
                              <td className="py-2 px-1 font-medium text-gray-900">
                                {med.medicine_name || item.medicine_name || "Medicine Item"}
                              </td>
                              <td className="py-2 px-1">{item.quantity || 1} units</td>
                              <td className="py-2 px-1">${med.price || item.price || 0}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}