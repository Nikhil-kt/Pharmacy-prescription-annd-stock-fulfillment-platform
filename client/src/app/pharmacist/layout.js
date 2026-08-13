'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { useBranch } from '@/context/BranchContext';
import { PharmacySymbolIcon } from '@/components/ui/AuthIcons';

function PharmacistSidebarContent({ children }) {
  const { user, profile, loading: authLoading, signOut } = useAuth();
  const { branches, selectedBranchId, selectBranch } = useBranch();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentTab = searchParams.get('tab');
  const [pendingCount, setPendingCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || (profile && profile.role !== 'pharmacist' && profile.role !== 'admin'))) {
      router.push('/');
      return;
    }
    if (user) {
      fetchCounts();
    }
  }, [user, profile, authLoading]);

  async function fetchCounts() {
    try {
      const [rxRes, ordersRes] = await Promise.all([
        api.get('/api/prescriptions', { status: 'pending' }).catch(() => ({ data: [] })),
        api.get('/api/orders', { limit: 20 }).catch(() => ({ data: [] })),
      ]);
      setPendingCount((rxRes.data || []).length);
      setOrdersCount((ordersRes.data || []).length);
    } catch {
      /* empty */
    }
  }

  if (authLoading || !user) return null;

  const pharmacistName = profile?.full_name || user?.user_metadata?.full_name || 'Pharmacist';
  const initials = pharmacistName
    ? pharmacistName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
    : 'HK';

  const isDashboardActive = pathname === '/pharmacist/dashboard' && (!currentTab || currentTab === 'dashboard');
  const isPrescriptionsActive = pathname === '/pharmacist/dashboard' && currentTab === 'prescriptions';
  const isOrdersActive = pathname === '/pharmacist/dashboard' && currentTab === 'orders';
  const isInventoryActive = pathname === '/pharmacist/update_stock';

  return (
    <div className="bg-[#F0FDF4]/70 min-h-screen flex text-slate-800">
      
      {/* ═════════════════ LEFT SIDEBAR ═════════════════ */}
      <aside className="w-64 bg-white border-r border-emerald-200/80 flex flex-col justify-between p-5 shrink-0 hidden lg:flex sticky top-0 h-screen z-30 shadow-xs">
        <div>
          {/* Logo */}
          <Link href="/pharmacist/dashboard" className="flex items-center gap-2.5 mb-8 px-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex items-center justify-center p-1 border border-teal-100 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <PharmacySymbolIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-slate-900 leading-none block">
                RxConnect
              </span>
              <span className="text-[10px] font-bold text-[#0D9488] tracking-[0.25em] uppercase block mt-0.5">
                PHARMACY
              </span>
            </div>
          </Link>

          {/* Sidebar Menu Items */}
          <nav className="space-y-2">
            
            {/* 1. Dashboard */}
            <Link
              href="/pharmacist/dashboard"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                isDashboardActive
                  ? 'bg-emerald-100/80 text-emerald-950 border-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-700 border-transparent hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 transition-colors ${isDashboardActive ? 'text-emerald-700' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </div>
            </Link>

            {/* 2. Prescriptions */}
            <Link
              href="/pharmacist/dashboard?tab=prescriptions"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                isPrescriptionsActive
                  ? 'bg-emerald-100/80 text-emerald-950 border-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-700 border-transparent hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 transition-colors ${isPrescriptionsActive ? 'text-emerald-700' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <span>Prescriptions</span>
              </div>
              {pendingCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                  {pendingCount}
                </span>
              )}
            </Link>

            {/* 3. Orders */}
            <Link
              href="/pharmacist/dashboard?tab=orders"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                isOrdersActive
                  ? 'bg-emerald-100/80 text-emerald-950 border-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-700 border-transparent hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 transition-colors ${isOrdersActive ? 'text-emerald-700' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span>Orders</span>
              </div>
              {ordersCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold shadow-xs">
                  {ordersCount}
                </span>
              )}
            </Link>

            {/* 4. Inventory */}
            <Link
              href="/pharmacist/update_stock"
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 border cursor-pointer ${
                isInventoryActive
                  ? 'bg-emerald-100/80 text-emerald-950 border-emerald-300 shadow-xs font-extrabold'
                  : 'text-slate-700 border-transparent hover:bg-emerald-50 hover:text-emerald-900 hover:border-emerald-200/90'
              }`}
            >
              <div className="flex items-center gap-3">
                <svg className={`w-4 h-4 transition-colors ${isInventoryActive ? 'text-emerald-700' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Inventory</span>
              </div>
            </Link>

          </nav>
        </div>

        <div>
          {/* Promo Card with Rich Pharmacy Theme Colors */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-100/90 via-teal-50 to-emerald-50 border border-emerald-300/80 mb-4 shadow-xs">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shadow-xs">🛡️</span>
              <div>
                <p className="text-xs font-extrabold text-[#044E3B] leading-tight">Your Health, Our Priority</p>
              </div>
            </div>
            <p className="text-[10px] font-semibold text-emerald-900/80 leading-relaxed mt-1">
              Ensuring safe, verified & compliant pharmacy operations.
            </p>
          </div>

          {/* User Profile Pill at Sidebar Bottom */}
          <div className="relative">
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="w-full p-2.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100/80 transition-colors flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-extrabold text-xs shrink-0 shadow-xs">
                  {initials}
                </div>
                <div className="text-left truncate">
                  <p className="text-xs font-bold text-emerald-950 truncate leading-tight">{pharmacistName}</p>
                  <p className="text-[10px] font-semibold text-emerald-700">Pharmacist</p>
                </div>
              </div>
              <svg className="w-4 h-4 text-emerald-700 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {userDropdownOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl border border-emerald-200 shadow-xl p-2 text-xs space-y-1 z-50">
                <Link
                  href="/customer/profile"
                  className="block px-3 py-2 rounded-xl text-slate-700 hover:bg-emerald-50 font-semibold"
                >
                  👤 My Profile
                </Link>
                <button
                  onClick={signOut}
                  className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-bold"
                >
                  🚪 Sign Out
                </button>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* ═════════════════ MAIN CONTENT AREA ═════════════════ */}
      <main className="flex-1 min-w-0 flex flex-col">
        
        {/* Top Header Navigation Bar */}
        <header className="bg-white border-b border-emerald-200/80 border-t-4 border-t-emerald-600 sticky top-0 z-20 px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">Pharmacist Dashboard</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                PHARMACIST
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            
            {/* Branch Selector */}
            <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200 rounded-2xl p-1.5 px-3">
              <svg className="w-4 h-4 text-emerald-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
              </svg>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold uppercase text-emerald-800/70 tracking-wider">Select Branch</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => selectBranch(e.target.value)}
                  className="bg-transparent text-emerald-950 text-xs font-bold outline-none cursor-pointer pr-2"
                >
                  <option value="">All Pharmacy Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            </div>

          </div>

        </header>

        {/* Page Children */}
        <div className="flex-1">
          {children}
        </div>

      </main>
    </div>
  );
}

export default function PharmacistLayout({ children }) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PharmacistSidebarContent>{children}</PharmacistSidebarContent>
    </Suspense>
  );
}

