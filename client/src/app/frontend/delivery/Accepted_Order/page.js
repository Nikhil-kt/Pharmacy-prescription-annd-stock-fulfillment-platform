"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function AcceptedOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function fetchOrders() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/delivery/`);
      const data = await res.json();
      // Show assigned deliveries (ready to be picked up)
      const assigned = (data?.deliveries || []).filter((d) => d.status === "ASSIGNED");
      setOrders(assigned);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchOrders(); }, []);

  async function markPickedUp(id) {
    setActionLoading(id);
    try {
      const res = await fetch(`${API}/delivery/${id}/pickup`, { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Order marked as picked up!" });
        fetchOrders();
      } else {
        setMessage({ type: "error", text: data.error || "Failed to update." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Accepted Orders</h1>
          <p className="text-xs text-slate-500 mt-1">Orders assigned and ready for pickup.</p>
        </div>
        <button onClick={fetchOrders} className="text-xs font-semibold text-blue-600 hover:underline">↻ Refresh</button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl text-xs font-medium border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading…</div>
      ) : orders.length === 0 ? (
        <div className="p-10 text-center text-slate-400 bg-white border border-slate-200 rounded-xl">
          No accepted orders waiting for pickup.
        </div>
      ) : (
        <div className="grid gap-4">
          {orders.map((d) => (
            <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1">
                <p className="text-xs font-mono text-slate-400">Delivery ID: {d.id?.slice(0, 16)}…</p>
                <p className="text-sm font-bold text-slate-800">Order: {d.order_id?.slice(0, 20)}…</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border bg-blue-50 text-blue-700 border-blue-200">
                  ASSIGNED — Ready for Pickup
                </span>
                {d.notes && <p className="text-xs text-slate-500 italic">Note: {d.notes}</p>}
                <p className="text-xs text-slate-400">Assigned at: {d.assigned_at ? new Date(d.assigned_at).toLocaleString() : "—"}</p>
              </div>
              <button
                onClick={() => markPickedUp(d.id)}
                disabled={actionLoading === d.id}
                className="shrink-0 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition disabled:opacity-50"
              >
                {actionLoading === d.id ? "Updating…" : "🛵 Mark Picked Up"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}