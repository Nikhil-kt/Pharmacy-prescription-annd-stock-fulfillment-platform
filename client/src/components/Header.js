'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { useBranch } from '@/context/BranchContext';
import SearchBar from './SearchBar';
import { PharmacySymbolIcon } from '@/components/ui/AuthIcons';

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const { cartCount } = useCart();
  const { branches, selectedBranchId, selectBranch } = useBranch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pathname = usePathname();

  const isAuthPage = pathname?.startsWith('/auth') || pathname?.startsWith('/pharmacist');

  if (isAuthPage) return null;

  // Only treat user as authenticated once loading is finished AND a user exists AND not on auth pages
  const isAuthenticated = !loading && !!user && !isAuthPage;

  const categories = [
    { name: 'Medicines', href: '/customer/medicines' },
    { name: 'Health Care', href: '/customer/medicines?category=Health+Care' },
    { name: 'Personal Care', href: '/customer/medicines?category=Personal+Care' },
    { name: 'Baby Care', href: '/customer/medicines?category=Baby+Care' },
    { name: 'Wellness', href: '/customer/medicines?category=Wellness' },
    { name: 'Devices', href: '/customer/medicines?category=Devices' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-sm">
      {/* Top Announcement Bar (Matching reference header style) */}
      <div className="bg-[#044E3B] text-white text-xs py-2">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 truncate text-emerald-100">
            <span className="text-base">🚚</span>
            <span className="truncate font-medium">Free delivery on all orders above ₹500</span>
          </div>

          <div className="flex items-center gap-5 text-emerald-100 text-[11px] font-medium shrink-0">
            {isAuthenticated ? (
              <div className="flex items-center gap-1.5 bg-white/15 px-3 py-0.5 rounded-full text-white shrink-0">
                <span>📍 Branch:</span>
                <select
                  value={selectedBranchId}
                  onChange={(e) => selectBranch(e.target.value)}
                  className="bg-transparent text-white text-xs font-semibold outline-none cursor-pointer pr-1"
                >
                  <option value="" className="text-gray-900">All Branches</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id} className="text-gray-900">
                      {b.name} ({b.city})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <Link href="/auth/login" className="hover:text-white transition-colors">
                🔒 Sign in to select branch
              </Link>
            )}

            <Link href="/customer/branches" className="hover:text-white transition-colors hidden sm:inline">
              Store Locator
            </Link>
            <span className="text-emerald-300/40 hidden sm:inline">|</span>
            <Link href="/customer/orders" className="hover:text-white transition-colors hidden sm:inline">
              Track Order
            </Link>
            <span className="text-emerald-300/40 hidden sm:inline">|</span>
            <Link href="#" className="hover:text-white transition-colors hidden sm:inline">
              Help Center
            </Link>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-3.5">
        <div className="flex items-center gap-4 lg:gap-8 justify-between">
          {/* Logo with New Pharmacy Symbol Emblem */}
          <Link href={isAuthenticated ? '/customer/dashboard' : '/auth/login'} className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 flex items-center justify-center p-1 border border-teal-100 shadow-sm group-hover:scale-105 transition-transform duration-200">
              <PharmacySymbolIcon className="w-8 h-8" />
            </div>
            <div>
              <span className="text-xl font-extrabold tracking-tight text-gray-900 leading-none block">
                RxConnect
              </span>
              <span className="text-[10px] font-semibold text-[#0D9488] tracking-[0.25em] uppercase block mt-0.5">
                PHARMACY
              </span>
            </div>
          </Link>

          {/* Search bar — only when signed in */}
          {isAuthenticated && (
            <div className="flex-1 max-w-2xl hidden md:block">
              <SearchBar />
            </div>
          )}

          {/* Spacer when not authenticated */}
          {!isAuthenticated && <div className="flex-1" />}

          {/* Right Header Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
            {isAuthenticated && (
              <>
                {/* My Orders Button */}
                <Link
                  href="/customer/orders"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#0D9488] hover:bg-emerald-50/70 transition-all font-medium text-xs sm:text-sm"
                >
                  <svg className="w-5 h-5 text-gray-500 hover:text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                  <span className="hidden sm:inline">My Orders</span>
                </Link>

                {/* Cart Button */}
                <Link
                  href="/customer/cart"
                  className="relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-700 hover:text-[#0D9488] hover:bg-emerald-50/70 transition-all font-medium text-xs sm:text-sm"
                >
                  <div className="relative">
                    <svg className="w-5 h-5 text-gray-600 hover:text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {cartCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-[#0D9488] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:inline">Cart</span>
                </Link>
              </>
            )}

            {/* User Area Menu */}
            {loading ? (
              <div className="flex items-center gap-2 text-gray-300 animate-pulse">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </div>
            ) : isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-gray-200/80 hover:border-[#0D9488] text-gray-700 hover:text-[#0D9488] transition-all"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  <div className="hidden lg:block text-left">
                    <span className="block text-[10px] text-gray-400 leading-tight">Welcome</span>
                    <span className="block text-xs font-bold text-gray-800 leading-tight">{profile?.full_name || 'Account'}</span>
                  </div>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50 animate-fade-in">
                    <Link href="/customer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50" onClick={() => setUserMenuOpen(false)}>My Profile</Link>
                    {profile?.role === 'admin' && (
                      <Link href="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50" onClick={() => setUserMenuOpen(false)}>Admin Portal</Link>
                    )}
                    {profile?.role === 'pharmacist' && (
                      <Link href="/pharmacist/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50" onClick={() => setUserMenuOpen(false)}>Pharmacist Portal</Link>
                    )}
                    {(profile?.role === 'delivery' || profile?.role === 'delivery_partner') && (
                      <Link href="/delivery/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-emerald-50" onClick={() => setUserMenuOpen(false)}>Delivery Portal</Link>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { signOut(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth/login" className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs font-bold transition-all shadow-sm">
                Sign In
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              className="lg:hidden text-gray-600 p-1"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Category Navigation Bar (Matching reference header nav) */}
      {isAuthenticated && (
        <nav className="border-t border-gray-100 hidden lg:block bg-slate-50/50">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-8 text-xs sm:text-sm">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link
                    href={cat.href}
                    className="block py-2.5 font-semibold text-gray-700 hover:text-[#0D9488] border-b-2 border-transparent hover:border-[#0D9488] transition-all"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/customer/branches" className="block py-2.5 font-semibold text-[#0D9488] hover:text-[#065F46] flex items-center gap-1">
                  <span>📍 Store Locator &amp; Details</span>
                </Link>
              </li>
              <li className="ml-auto">
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#0D9488] bg-emerald-100/70 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  🔥 OFFERS
                </span>
              </li>
            </ul>
          </div>
        </nav>
      )}

      {/* Mobile Search Bar */}
      {isAuthenticated && (
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      )}
    </header>
  );
}
