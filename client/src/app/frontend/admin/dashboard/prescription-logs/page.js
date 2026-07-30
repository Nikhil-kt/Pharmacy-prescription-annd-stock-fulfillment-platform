"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function PrescriptionLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:5000/api/admin/prescription-logs");
        const data = await res.json();
        if (data.success) setLogs(data.data);
      } catch (err) {
        console.error("Error fetching prescription logs:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col justify-between">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between pb-6 border-b border-gray-200">
          <div>
            <Link href="/frontend/admin/dashboard" className="text-xs font-semibold text-[#0E7C50] hover:underline">
              ← Back to Dashboard
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-1">
              Prescription Verification Logs
            </h1>
          </div>
        </div>

        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Loading verification logs...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase tracking-wider">
                  <th className="py-3 px-4 font-semibold">Prescription ID</th>
                  <th className="py-3 px-4 font-semibold">Verified By</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {logs.length > 0 ? (
                  logs.map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium text-gray-900">#{log.prescription_id || log.id}</td>
                      <td className="py-3 px-4 text-gray-600">{log.verified_by || "Pharmacist"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                          log.status === "Approved" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {log.status || "Verified"}
                        </span>
                      </td>
                     <td className="py-3 px-4 text-gray-500 text-xs">
  {log.created_at ? new Date(log.created_at).toLocaleString() : "N/A"}
</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="py-6 text-center text-gray-500">No prescription logs found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}