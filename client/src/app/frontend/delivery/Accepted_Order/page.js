"use client";

import { useState, useEffect } from "react";

export default function AcceptedOrderPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [selectedDeliveryId, setSelectedDeliveryId] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState("");

  // 1. Fetch real deliveries from the database on page load
  const fetchDeliveries = async () => {
    setFetching(true);
    try {
      const res = await fetch("http://localhost:5000/api/delivery/");
      const data = await res.json();

      if (res.ok && data.success) {
        // Filter for orders that are assigned but not yet picked up/completed
        const pendingPickups = (data.deliveries || []).filter(
          (item) => item.status === "ASSIGNED" || item.status === "PENDING"
        );
        setDeliveries(pendingPickups.length > 0 ? pendingPickups : data.deliveries || []);
      } else {
        setMessage(`❌ Error fetching orders: ${data.error || "Failed to load"}`);
      }
    } catch (err) {
      setMessage(`❌ Network Error: ${err.message}`);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  // 2. Handle Pickup Action (Persists to database via PUT /api/delivery/:id/pickup)
  const handlePickup = async () => {
    if (!selectedDeliveryId || selectedDeliveryId === "undefined") {
      alert("Please select a valid order to pick up.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch(`http://localhost:5000/api/delivery/${selectedDeliveryId}/pickup`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setMessage("✅ Order marked as Picked Up in the database!");
        setSelectedDeliveryId("");
        fetchDeliveries(); // Refresh list after status update
      } else {
        setMessage(`❌ Error: ${data.error || "Failed to pick up order"}`);
      }
    } catch (err) {
      setMessage(`❌ Network Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <h1 className="text-2xl font-bold text-gray-800">Accepted Orders</h1>
        <p className="text-gray-500 text-sm">Select an accepted order to mark as picked up.</p>

        {message && (
          <div className="p-3 rounded-lg bg-blue-50 text-blue-800 text-sm font-medium border border-blue-100">
            {message}
          </div>
        )}

        {fetching ? (
          <p className="text-sm text-gray-500">Loading accepted orders from database...</p>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Select Order
              </label>
              <select
                value={selectedDeliveryId}
                onChange={(e) => setSelectedDeliveryId(e.target.value)}
                className="w-full border border-gray-300 p-2.5 rounded-lg text-sm bg-white focus:ring-2 focus:ring-amber-500"
              >
                <option value="">-- Choose Accepted Order --</option>
                {deliveries.map((item) => {
                  const validId = item.id || item.delivery_id;
                  return (
                    <option key={validId} value={validId}>
                      Delivery #{validId ? validId.slice(0, 8) : "N/A"} - Status: {item.status}
                    </option>
                  );
                })}
              </select>
            </div>

            <button
              onClick={handlePickup}
              disabled={loading || !selectedDeliveryId}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50"
            >
              {loading ? "Updating Database..." : "Mark as Picked Up"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}