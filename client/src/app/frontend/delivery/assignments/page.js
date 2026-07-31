"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function DeliveryAssignments() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function fetchDeliveries() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/delivery/`);
      const data = await res.json();
      setDeliveries(data?.deliveries || []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }

  useEffect(() => { fetchDeliveries(); }, []);

  async function handleUpdate(id, action) {
    setActionLoading(id + action);
    const endpoints = {
      pickup: `${API}/delivery/${id}/pickup`,
      out: `${API}/delivery/${id}/out-for-delivery`,
      delivered: `${API}/delivery/${id}/delivered`,
    };
    try {
      const res = await fetch(endpoints[action], { method: "PUT" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Delivery status updated!" });
        fetchDeliveries();
      } else {
        setMessage({ type: "error", text: data.error || "Update failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(null);
    }
  }

  const statusColor = {
    ASSIGNED: "bg-blue-50 text-blue-700 border-blue-200",
    PICKED_UP: "bg-amber-50 text-amber-700 border-amber-200",
    OUT_FOR_DELIVERY: "bg-purple-50 text-purple-700 border-purple-200",
    DELIVERED: "bg-emerald-50 text-emerald-700 border-emerald-200",
  };

  const nextAction = {
    ASSIGNED: { label: "Mark Picked Up", key: "pickup", color: "bg-amber-500 hover:bg-amber-600" },
    PICKED_UP: { label: "Out for Delivery", key: "out", color: "bg-purple-500 hover:bg-purple-600" },
    OUT_FOR_DELIVERY: { label: "Mark Delivered", key: "delivered", color: "bg-emerald-500 hover:bg-emerald-600" },
    DELIVERED: null,
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Active Assignments</h1>
          <p className="text-xs text-slate-500 mt-1">Manage and update the status of current deliveries.</p>
        </div>
        <button onClick={fetchDeliveries} className="text-xs font-semibold text-blue-600 hover:underline">↻ Refresh</button>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl text-xs font-medium border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading deliveries…</div>
      ) : deliveries.length === 0 ? (
        <div className="p-10 text-center text-slate-400">No active deliveries found.</div>
      ) : (
        <div className="grid gap-4">
          {deliveries.map((d) => {
            const action = nextAction[d.status];
            return (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="space-y-1">
                  <p className="text-xs font-mono text-slate-400">Delivery: {d.id?.slice(0, 16)}…</p>
                  <p className="text-sm font-bold text-slate-800">Order: {d.order_id?.slice(0, 16)}…</p>
                  <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColor[d.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                    {d.status?.replace(/_/g, " ")}
                  </span>
                  <p className="text-xs text-slate-400">Assigned: {d.assigned_at ? new Date(d.assigned_at).toLocaleString() : "—"}</p>
                </div>
                {action && (
                  <button
                    onClick={() => handleUpdate(d.id, action.key)}
                    disabled={!!actionLoading}
                    className={`shrink-0 px-4 py-2 text-white text-xs font-bold rounded-xl transition disabled:opacity-50 ${action.color}`}
                  >
                    {actionLoading === d.id + action.key ? "Updating…" : action.label}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}