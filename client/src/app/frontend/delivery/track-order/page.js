"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function TrackOrder() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch(`${API}/delivery/`)
      .then((r) => r.json())
      .then((d) => setDeliveries(d?.deliveries || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = deliveries.filter((d) =>
    d.order_id?.toLowerCase().includes(search.toLowerCase()) ||
    d.id?.toLowerCase().includes(search.toLowerCase())
  );

  const steps = ["ASSIGNED", "PICKED_UP", "OUT_FOR_DELIVERY", "DELIVERED"];
  const stepLabel = { ASSIGNED: "Assigned", PICKED_UP: "Picked Up", OUT_FOR_DELIVERY: "Out for Delivery", DELIVERED: "Delivered" };
  const stepIcon = { ASSIGNED: "📦", PICKED_UP: "🛵", OUT_FOR_DELIVERY: "🚚", DELIVERED: "✅" };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Track Orders</h1>
        <p className="text-xs text-slate-500 mt-1">Monitor real-time delivery progress.</p>
      </div>

      <input type="text" placeholder="Search by order ID or delivery ID..."
        value={search} onChange={(e) => setSearch(e.target.value)}
        className="border border-slate-200 rounded-lg px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-blue-400/30 w-80" />

      {loading ? (
        <div className="p-10 text-center text-slate-400">Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="p-10 text-center text-slate-400">No deliveries found.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((d) => {
            const currentStep = steps.indexOf(d.status);
            return (
              <div key={d.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-mono text-slate-400">Order: {d.order_id?.slice(0, 20)}…</p>
                    <p className="text-sm font-bold text-slate-800 mt-0.5">Delivery ID: {d.id?.slice(0, 16)}…</p>
                    <p className="text-xs text-slate-400 mt-0.5">Assigned: {d.assigned_at ? new Date(d.assigned_at).toLocaleString() : "—"}</p>
                  </div>
                  {d.status === "DELIVERED" && (
                    <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-3 py-1 rounded-full border border-emerald-200">
                      Completed ✓
                    </span>
                  )}
                </div>
                {/* Progress Bar */}
                <div className="flex items-center gap-0">
                  {steps.map((step, i) => {
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    return (
                      <div key={step} className="flex items-center flex-1 last:flex-none">
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition
                            ${done ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300 text-slate-400"}
                            ${active ? "ring-4 ring-blue-200" : ""}`}>
                            {done ? stepIcon[step] : i + 1}
                          </div>
                          <span className={`text-[10px] font-semibold text-center ${done ? "text-blue-700" : "text-slate-400"}`}>
                            {stepLabel[step]}
                          </span>
                        </div>
                        {i < steps.length - 1 && (
                          <div className={`flex-1 h-0.5 mb-4 mx-1 ${i < currentStep ? "bg-blue-500" : "bg-slate-200"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}