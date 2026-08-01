"use client";

import { useState, useEffect } from "react";

export default function TrackOrderPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [message, setMessage] = useState("");

  // Helper function to format ISO timestamps into clear, human-readable date and time
  const formatDateTime = (timestamp) => {
    if (!timestamp) return "-";
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) return "-";

    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Fetch active deliveries from the backend
  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/delivery/");
      const data = await res.json();

      if (res.ok && data.success) {
        setDeliveries(data.deliveries || []);
      } else {
        console.error("Failed to load deliveries:", data.error);
      }
    } catch (err) {
      console.error("Network error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Generic handler to call status update endpoints
  const handleStatusUpdate = async (id, endpoint, actionLabel) => {
    setUpdatingId(id);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/delivery/${id}/${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage(`✅ Order status updated to: ${actionLabel}`);
        fetchDeliveries(); // Refresh list to get updated backend timestamps
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to update status."}`);
      }
    } catch (err) {
      setMessage(`❌ Network Error: ${err.message}`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "PICKED_UP":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "OUT_FOR_DELIVERY":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "DELIVERED":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Track & Update Deliveries</h1>
          <p className="text-sm text-gray-500">
            Manage real-time lifecycle stages for assigned orders.
          </p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh
        </button>
      </div>

      {message && (
        <div className="p-3 bg-blue-50 text-blue-800 border border-blue-200 rounded-lg text-sm font-medium">
          {message}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Loading delivery records...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded-xl text-gray-500 text-sm">
          No deliveries found in the system.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {deliveries.map((item) => (
            <div
              key={item.id}
              className="border border-gray-200 rounded-xl p-5 bg-white shadow-sm space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-semibold text-gray-400 block">
                      DELIVERY ID
                    </span>
                    <span className="font-mono text-sm text-gray-800 font-bold">
                      #{item.id?.slice(0, 8)}...
                    </span>
                  </div>
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div className="text-xs text-gray-600 space-y-1 pt-2 border-t">
                  <p>
                    <strong className="text-gray-700">Order ID:</strong>{" "}
                    <span className="font-mono">{item.order_id?.slice(0, 8)}...</span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Partner ID:</strong>{" "}
                    <span className="font-mono">
                      {item.delivery_partner_id?.slice(0, 8)}...
                    </span>
                  </p>
                  <p>
                    <strong className="text-gray-700">Notes:</strong>{" "}
                    {item.notes || "None"}
                  </p>
                </div>

                {/* Updated Lifecycle Timestamps Container */}
                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 space-y-1.5 border">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Assigned:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateTime(item.assigned_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Picked Up:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateTime(item.picked_up_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Out for Delivery:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateTime(item.out_for_delivery_at)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-500">Delivered:</span>
                    <span className="font-medium text-gray-800">
                      {formatDateTime(item.delivered_at)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Stage Buttons */}
              <div className="pt-2 flex gap-2">
                {item.status === "ASSIGNED" && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, "pickup", "Picked Up")}
                    disabled={updatingId === item.id}
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white text-xs font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {updatingId === item.id ? "Updating..." : "Mark as Picked Up"}
                  </button>
                )}

                {item.status === "PICKED_UP" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        item.id,
                        "out-for-delivery",
                        "Out for Delivery"
                      )
                    }
                    disabled={updatingId === item.id}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {updatingId === item.id ? "Updating..." : "Start Delivery"}
                  </button>
                )}

                {item.status === "OUT_FOR_DELIVERY" && (
                  <button
                    onClick={() => handleStatusUpdate(item.id, "delivered", "Delivered")}
                    disabled={updatingId === item.id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium py-2 rounded-lg transition disabled:opacity-50"
                  >
                    {updatingId === item.id ? "Updating..." : "Mark as Delivered"}
                  </button>
                )}

                {item.status === "DELIVERED" && (
                  <div className="w-full text-center text-xs font-bold text-emerald-600 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                    ✓ Completed
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}