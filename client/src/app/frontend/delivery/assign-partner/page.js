"use client";
import { useState, useEffect } from "react";

const API = "http://localhost:5000/api";

export default function AssignPartner() {
  const [orders, setOrders] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [form, setForm] = useState({ order_id: "", delivery_partner_id: "", notes: "" });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/pending-orders`).then((r) => r.json()),
      fetch(`${API}/admin/delivery-partners`).then((r) => r.json()),
    ])
      .then(([oData, pData]) => {
        setOrders(oData?.data || []);
        setPartners(pData?.deliveryPartners || pData?.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      const res = await fetch(`${API}/delivery/assign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Delivery partner assigned successfully!" });
        setForm({ order_id: "", delivery_partner_id: "", notes: "" });
      } else {
        setMessage({ type: "error", text: data.error || "Assignment failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-800">Assign Delivery Partner</h1>
        <p className="text-xs text-slate-500 mt-1">Pair a pending order with an available delivery partner.</p>
      </div>

      {message.text && (
        <div className={`p-3 rounded-xl text-xs font-medium border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
          {message.text}
        </div>
      )}

      {loading ? (
        <div className="p-8 text-center text-slate-400">Loading…</div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm max-w-lg">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Order</label>
            <select value={form.order_id} onChange={(e) => setForm((f) => ({ ...f, order_id: e.target.value }))} required
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-400/30">
              <option value="">-- Choose Pending Order --</option>
              {orders.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.id?.slice(0, 12)}… — ₹{o.total_amount} ({o.status})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Select Delivery Partner</label>
            <select value={form.delivery_partner_id} onChange={(e) => setForm((f) => ({ ...f, delivery_partner_id: e.target.value }))} required
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-400/30">
              <option value="">-- Choose Partner --</option>
              {partners.map((p) => (
                <option key={p.id} value={p.id}>{p.full_name} — {p.phone || "N/A"} ({p.status})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notes (Optional)</label>
            <textarea rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Any special delivery instructions..."
              className="w-full border border-slate-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-blue-400/30" />
          </div>
          <button type="submit" disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-3 rounded-xl transition disabled:opacity-50">
            {submitting ? "Assigning…" : "Assign Partner"}
          </button>
        </form>
      )}
    </div>
  );
}