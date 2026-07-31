"use client";

import { useState, useEffect } from "react";

export default function AssignmentsPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch all delivery assignments from database
  const fetchDeliveries = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/delivery/");
      const data = await res.json();

      if (res.ok && data.success) {
        setDeliveries(data.deliveries || []);
      } else {
        setError(data.error || "Failed to load assignments from database.");
      }
    } catch (err) {
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // Helper for badge color based on status
  const getStatusBadge = (status) => {
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
          <h1 className="text-2xl font-bold text-gray-900">Delivery Assignments</h1>
          <p className="text-sm text-gray-500">
            Real-time delivery records pulled directly from Supabase.
          </p>
        </div>
        <button
          onClick={fetchDeliveries}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-4 py-2 rounded-lg transition"
        >
          🔄 Refresh
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-gray-500 text-sm">
          Fetching assignments from database...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="p-8 text-center bg-gray-50 border rounded-xl text-gray-500 text-sm">
          No delivery assignments found in the database.
        </div>
      ) : (
        <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-sm bg-white">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Delivery ID</th>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Partner ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Assigned At</th>
                <th className="py-3 px-4">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {deliveries.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">
                    {item.id ? `${item.id.slice(0, 8)}...` : "N/A"}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">
                    {item.order_id ? `${item.order_id.slice(0, 8)}...` : "N/A"}
                  </td>
                  <td className="py-3 px-4 font-mono text-xs text-gray-600">
                    {item.delivery_partner_id
                      ? `${item.delivery_partner_id.slice(0, 8)}...`
                      : "N/A"}
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-block px-2.5 py-1 rounded-full text-xs font-bold border ${getStatusBadge(
                        item.status
                      )}`}
                    >
                      {item.status || "UNKNOWN"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-500">
                    {item.assigned_at
                      ? new Date(item.assigned_at).toLocaleString()
                      : "-"}
                  </td>
                  <td className="py-3 px-4 text-xs text-gray-600 italic">
                    {item.notes || "No notes"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}