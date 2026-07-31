"use client";
import { useState, useEffect } from "react";
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";

const API = "http://localhost:5000/api";

export default function PharmacistApprovals() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [filter, setFilter] = useState("PENDING");
  const [selected, setSelected] = useState(null);
  const [remarks, setRemarks] = useState("");

  async function fetchPrescriptions() {
    setLoading(true);
    try {
      const url = filter === "ALL" ? `${API}/prescriptions/pending` : `${API}/prescriptions/pending`;
      const res = await fetch(url);
      const data = await res.json();
      setPrescriptions(data?.data || []);
    } catch (e) {
      setMessage({ type: "error", text: "Failed to load prescriptions." });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchPrescriptions(); }, [filter]);

  async function handleAction(id, action) {
    setActionLoading(id + action);
    try {
      const endpoint = action === "approve"
        ? `${API}/prescriptions/${id}/approve`
        : `${API}/prescriptions/${id}/reject`;
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ remarks: remarks || (action === "approve" ? "Approved by pharmacist" : "Rejected by pharmacist") }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Prescription ${action}d successfully.` });
        setSelected(null);
        setRemarks("");
        fetchPrescriptions();
      } else {
        setMessage({ type: "error", text: data.error || "Action failed." });
      }
    } catch (e) {
      setMessage({ type: "error", text: e.message });
    } finally {
      setActionLoading(null);
    }
  }

  const statusColors = {
    PENDING: "bg-amber-50 text-amber-700 border-amber-200",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200",
    REJECTED: "bg-red-50 text-red-700 border-red-200",
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Prescription Approvals</h1>
          <p className="text-xs text-gray-500 mt-1">Review, approve or reject customer prescription submissions.</p>
        </div>

        {message.text && (
          <div className={`p-3 rounded-xl text-xs font-medium border ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-700 border-red-200"}`}>
            {message.text}
          </div>
        )}

        {/* Review Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 space-y-4">
              <div className="flex justify-between items-start">
                <h2 className="font-bold text-lg text-gray-900">Review Prescription</h2>
                <button onClick={() => { setSelected(null); setRemarks(""); }} className="text-gray-400 hover:text-gray-700 text-xl font-bold">×</button>
              </div>
              {selected.image_url && (
                <img
                  src={selected.image_url}
                  alt="Prescription"
                  className="w-full max-h-64 object-contain rounded-xl border border-gray-200"
                  onError={(e) => { e.target.style.display = "none"; }}
                />
              )}
              <div className="text-xs space-y-1 text-gray-600">
                <p><span className="font-semibold">ID:</span> {selected.id}</p>
                <p><span className="font-semibold">Customer:</span> {selected.customer_id}</p>
                <p><span className="font-semibold">Status:</span> {selected.status}</p>
                <p><span className="font-semibold">Uploaded:</span> {selected.uploaded_at ? new Date(selected.uploaded_at).toLocaleString() : "—"}</p>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Add review notes here..."
                  className="w-full border border-gray-200 rounded-lg p-2.5 text-xs outline-none focus:ring-2 focus:ring-teal-400/30"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => handleAction(selected.id, "approve")}
                  disabled={!!actionLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading === selected.id + "approve" ? "Approving…" : "✓ Approve"}
                </button>
                <button
                  onClick={() => handleAction(selected.id, "reject")}
                  disabled={!!actionLoading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white text-xs font-bold py-2.5 rounded-xl transition disabled:opacity-50"
                >
                  {actionLoading === selected.id + "reject" ? "Rejecting…" : "✗ Reject"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Prescriptions Table */}
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 border-b flex justify-between items-center">
            <h2 className="font-bold text-gray-900">Prescriptions ({prescriptions.length})</h2>
            <button onClick={fetchPrescriptions} className="text-xs text-teal-700 font-semibold hover:underline">↻ Refresh</button>
          </div>
          {loading ? (
            <div className="p-10 text-center text-gray-400 text-sm">Loading prescriptions…</div>
          ) : prescriptions.length === 0 ? (
            <div className="p-10 text-center text-gray-400 text-sm">No pending prescriptions — all clear! 🎉</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                  <tr>
                    {["Prescription ID", "Customer ID", "Status", "Uploaded At", "Remarks", "Action"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {prescriptions.map((rx) => (
                    <tr key={rx.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-500">{rx.id?.slice(0, 12)}…</td>
                      <td className="px-4 py-3 text-gray-700">{rx.customer_id?.slice(0, 12) || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusColors[rx.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {rx.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{rx.uploaded_at ? new Date(rx.uploaded_at).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[160px] truncate">{rx.remarks || "—"}</td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => setSelected(rx)}
                          className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold transition"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}