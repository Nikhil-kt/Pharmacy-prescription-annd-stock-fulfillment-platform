"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Relative path imports matching your project structure
import Navbar from "../../../components/Navbar";
import Footer from "../../../components/footer";

export default function AdminDashboard() {
  const [topMedicines, setTopMedicines] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [todaysOrders, setTodaysOrders] = useState([]);
  const [prescriptionLogs, setPrescriptionLogs] = useState([]);
  const [stockAlerts, setStockAlerts] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [
          topRes,
          stockRes,
          perfRes,
          ordersRes,
          logsRes,
          alertsRes,
        ] = await Promise.all([
          fetch("http://localhost:5000/api/admin/top-selling-medicines"),
          fetch("http://localhost:5000/api/admin/low-stock-report"),
          fetch("http://localhost:5000/api/admin/branch-performance"),
          fetch("http://localhost:5000/api/admin/todays-orders"),
          fetch("http://localhost:5000/api/admin/prescription-logs"),
          fetch("http://localhost:5000/api/admin/branch-stock-alerts"),
        ]);

        const topData = await topRes.json();
        const stockData = await stockRes.json();
        const perfData = await perfRes.json();
        const ordersData = await ordersRes.json();
        const logsData = await logsRes.json();
        const alertsData = await alertsRes.json();

        if (topData.success) setTopMedicines(topData.data || []);
        if (stockData.success) setLowStock(stockData.data || []);
        if (perfData.success) setPerformance(perfData.data || []);
        if (ordersData.success) setTodaysOrders(ordersData.data || []);
        if (logsData.success) setPrescriptionLogs(logsData.data || []);
        if (alertsData.success) setStockAlerts(alertsData.data || []);
      } catch (err) {
        console.error("Failed to fetch admin dashboard metrics:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans flex flex-col justify-between">
      {/* Top Navbar */}
      <Navbar />

      {/* Admin Dashboard Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Header / Navigation Bar */}
        <div className="flex flex-col xl:flex-row xl:items-center justify-between pb-6 border-b border-gray-200 gap-4">
          <div>
            <span className="text-xs font-semibold text-[#0E7C50] tracking-wider uppercase">
              Management Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight mt-0.5">
              Admin Dashboard
            </h1>
          </div>

          {/* Navigation Links including New Routes */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/frontend/admin/dashboard"
              className="px-4 py-2 bg-[#0E7C50] text-white text-xs font-medium rounded-md shadow-sm hover:bg-[#0B6A44] transition-colors"
            >
              Overview
            </Link>
            <Link
              href="/frontend/admin/dashboard/todays-orders"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Todays Orders ({todaysOrders.length})
            </Link>
            <Link
              href="/frontend/admin/dashboard/manual-orders"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Manual Orders
            </Link>
            <Link
              href="/frontend/admin/dashboard/branch-performance"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Branch Report
            </Link>
            <Link
              href="/frontend/admin/dashboard/stock-failures"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Stock Failures
            </Link>
            <Link
              href="/frontend/admin/dashboard/stock-alerts"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Branch Alerts ({stockAlerts.length})
            </Link>
            <Link
              href="/frontend/admin/dashboard/prescription-logs"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Rx Logs ({prescriptionLogs.length})
            </Link>
            <Link
              href="/frontend/admin/dashboard/top-selling"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Top Selling
            </Link>
            <Link
              href="/frontend/admin/dashboard/low-stock"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Low Stock ({lowStock.length})
            </Link>

<Link
              href="/frontend/admin/dashboard/manual-orders"
              className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-medium rounded-md hover:bg-gray-50 transition-colors"
            >
              Order Approval
            </Link>

          </div>
        </div>

        {/* Dashboard Cards Grid */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Top Selling Medicine
            </span>
            <p className="text-xl font-bold text-[#0E7C50] mt-2">
              {loading ? "Loading..." : topMedicines[0]?.name || "N/A"}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {loading ? "" : `${topMedicines[0]?.totalSold || 0} units sold`}
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Low Stock Items
            </span>
            <p className="text-2xl font-bold text-amber-600 mt-2">
              {loading ? "..." : lowStock.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Items requiring reorder
            </p>
          </div>

          <div className="bg-white border border-gray-200 p-6 rounded-lg shadow-sm">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Active Branches
            </span>
            <p className="text-2xl font-bold text-gray-900 mt-2">
              {loading ? "..." : performance.length}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Branch network status
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}