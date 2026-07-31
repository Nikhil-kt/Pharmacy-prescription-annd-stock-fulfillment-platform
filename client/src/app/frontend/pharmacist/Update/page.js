"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";

const API = "http://localhost:5000/api";

export default function PharmacistUpdate() {
  const [medicines, setMedicines] = useState([]);
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [mode, setMode] = useState("add"); // "add" | "update"
  const [form, setForm] = useState({
    medicine_id: "", branch_id: "", quantity: "", manufacturing_date: "", expiry_date: ""
  });

  useEffect(() => {
    Promise.all([
      fetch(`${API}/admin/medicines`).then((r) => r.json()),
      fetch(`${API}/customer/branches`).then((r) => r.json()),
    ])
      .then(([mData, bData]) => {
        setMedicines(mData?.medicines || []);
        setBranches(bData?.branches || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: "", text: "" });
    try {
      let res, url, method, body;
      if (mode === "add") {
        url = `${API}/inventory/add`;
        method = "POST";
        body = form;
      } else {
        url = `${API}/inventory/${form.branch_id}/${form.medicine_id}`;
        method = "PUT";
        body = { quantity: form.quantity };
      }
      const r = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await r.json();
      if (data.success) {
        setMessage({ type: "success", text: mode === "add" ? "Medicine added to branch stock!" : "Stock updated successfully!" });
        setForm({ medicine_id: "", branch_id: "", quantity: "", manufacturing_date: "", expiry_date: "" });
      } else {
        setMessage({ type: "error", text: data.error || data.message || "Operation failed." });
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900">Update Stock</h1>
          <p className="text-xs text-gray-500 mt-1">Add new medicine to a branch or update existing quantity.</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-white border border-gray-200 rounded-xl p-1 w-fit">
          {["add", "update"].map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={`px-5 py-2 text-xs font-bold rounded-lg transition ${mode === m ? "bg-teal-600 text-white" : "text-gray-500 hover:text-gray-800"}`}>
              {m === "add" ? "Add New Stock" : "Update Quantity"}
            </button>
          ))}
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-medium border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {message.text}
          </div>
        )}

        {loading ? (
          <div className="p-8 text-center text-gray-400">Loading…</div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4 shadow-sm">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Branch</label>
              <select name="branch_id" value={form.branch_id} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/30">
                <option value="">-- Choose Branch --</option>
                {branches.map((b) => <option key={b.id} value={b.id}>{b.branch_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Select Medicine</label>
              <select name="medicine_id" value={form.medicine_id} onChange={handleChange} required
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/30">
                <option value="">-- Choose Medicine --</option>
                {medicines.map((m) => <option key={m.id} value={m.id}>{m.medicine_name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantity</label>
              <input name="quantity" type="number" min="0" value={form.quantity} onChange={handleChange} required
                placeholder="Enter quantity"
                className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/30" />
            </div>
            {mode === "add" && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Manufacturing Date</label>
                  <input name="manufacturing_date" type="date" value={form.manufacturing_date} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/30" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Expiry Date</label>
                  <input name="expiry_date" type="date" value={form.expiry_date} onChange={handleChange} required
                    className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/30" />
                </div>
              </>
            )}
            <button type="submit" disabled={submitting}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-3 rounded-xl transition disabled:opacity-50">
              {submitting ? "Saving…" : mode === "add" ? "Add to Inventory" : "Update Stock"}
            </button>
          </form>
        )}
      </main>
      <Footer />
    </div>
  );
}