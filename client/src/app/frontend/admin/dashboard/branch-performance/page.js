"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/footer";

export default function BranchPerformancePage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReport() {
      try {
        const res = await fetch(
          "http://localhost:5000/api/admin/branch-performance"
        );
        const result = await res.json();
        if (result.success) setData(result.data || []);
      } catch (err) {
        console.error("Failed to fetch branch performance report:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchReport();
  }, []);

  const downloadCSV = () => {
    if (data.length === 0) return;

    const headers = [
      "Branch ID",
      "Branch Name",
      "Address",
      "Total Orders",
      "Completed Orders",
      "Cancelled Orders",
      "Total Revenue (INR)",
    ];

    const rows = data.map((item) => [
      `"${item.branchId || item.branch_id || ""}"`,
      `"${item.branchName || item.branch_name || ""}"`,
      `"${item.address || ""}"`,
      item.totalOrders ?? item.total_orders ?? 0,
      item.completedOrders ?? item.completed_orders ?? 0,
      item.cancelledOrders ?? item.cancelled_orders ?? 0,
      item.totalRevenue ?? item.total_revenue ?? 0,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `Branch_Performance_Report_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#0E7C50] tracking-wider uppercase">
              Management Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-0.5">
              Export Branch Performance Report
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/frontend/admin/dashboard"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </Link>
            <button
              onClick={downloadCSV}
              disabled={loading || data.length === 0}
              className="px-4 py-2 bg-[#0E7C50] text-white text-xs font-medium rounded-md shadow-sm hover:bg-[#0B6A44] transition-colors disabled:opacity-50"
            >
              Export CSV Report
            </button>
          </div>
        </div>

        {/* Performance Data Table */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-sm text-gray-500">
              Generating branch performance metrics...
            </div>
          ) : data.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">
              No branch performance data found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm divide-y divide-gray-200">
                <thead className="bg-gray-50 text-gray-500 text-xs font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3">Branch Name</th>
                    <th className="px-6 py-3">Address</th>
                    <th className="px-6 py-3 text-center">Total Orders</th>
                    <th className="px-6 py-3 text-center">Completed</th>
                    <th className="px-6 py-3 text-center">Cancelled</th>
                    <th className="px-6 py-3 text-right">Total Revenue</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {data.map((row, index) => (
                    <tr
                      key={row.branchId || row.branch_id || row.id || index}
                      className="hover:bg-gray-50/80 transition-colors"
                    >
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {row.branchName || row.branch_name || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-gray-600 max-w-xs truncate">
                        {row.address || "N/A"}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-gray-700">
                        {row.totalOrders ?? row.total_orders ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-emerald-600 font-medium">
                        {row.completedOrders ?? row.completed_orders ?? 0}
                      </td>
                      <td className="px-6 py-4 text-center font-mono text-rose-600 font-medium">
                        {row.cancelledOrders ?? row.cancelled_orders ?? 0}
                      </td>
                      <td className="px-6 py-4 text-right font-mono font-bold text-[#0E7C50]">
                        ₹{(row.totalRevenue ?? row.total_revenue ?? 0).toLocaleString("en-IN")}
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