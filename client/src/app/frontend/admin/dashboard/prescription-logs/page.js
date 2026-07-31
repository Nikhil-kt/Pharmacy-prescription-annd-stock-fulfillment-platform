"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

const API = "http://localhost:5000/api/admin";

export default function PrescriptionLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/prescription-logs`)
      .then((r) => r.json())
      .then((d) => setLogs(d?.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statusBadge = { APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200", REJECTED: "bg-red-50 text-red-700 border-red-200", PENDING: "bg-amber-50 text-amber-700 border-amber-200" };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div>
          <Link href="/frontend/admin/dashboard" className="text-xs text-[#0E7C50] hover:underline">← Admin Dashboard</Link>
          <h1 className="text-2xl font-extrabold text-gray-900 mt-1">Prescription Logs</h1>
          <p className="text-xs text-gray-500 mt-1">History of all prescription review actions by pharmacists.</p>
        </div>
        {loading ? (
          <div className="p-10 text-center text-gray-400">Loading…</div>
        ) : logs.length === 0 ? (
          <div className="p-10 text-center text-gray-400 bg-white border rounded-xl">No prescription review logs yet.</div>
        ) : (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 border-b text-gray-500 uppercase tracking-wide">
                  <tr>
                    {["Review ID", "Prescription", "Pharmacist", "Status", "Remarks", "Reviewed At"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono text-gray-400">{log.id?.slice(0, 10)}…</td>
                      <td className="px-4 py-3 font-mono text-gray-500">{log.prescription_id?.slice(0, 12) || "—"}…</td>
                      <td className="px-4 py-3 text-gray-700">{log.pharmacists?.full_name || log.pharmacist_id?.slice(0, 10) || "—"}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold border ${statusBadge[log.status] || "bg-gray-100 text-gray-600 border-gray-200"}`}>
                          {log.status || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{log.remarks || "—"}</td>
                      <td className="px-4 py-3 text-gray-500">{log.reviewed_at ? new Date(log.reviewed_at).toLocaleString() : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}