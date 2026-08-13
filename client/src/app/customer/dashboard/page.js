'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import MedicineCard from '@/components/MedicineCard';
import { useBranch } from '@/context/BranchContext';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

const categories = [
  { name: 'Medicines', icon: '💊', color: 'bg-blue-50/80 border-blue-100', href: '/customer/medicines?category=Medicines' },
  { name: 'Health Care', icon: '❤️', color: 'bg-red-50/80 border-red-100', href: '/customer/medicines?category=Health+Care' },
  { name: 'Personal Care', icon: '🧴', color: 'bg-purple-50/80 border-purple-100', href: '/customer/medicines?category=Personal+Care' },
  { name: 'Baby Care', icon: '👶', color: 'bg-pink-50/80 border-pink-100', href: '/customer/medicines?category=Baby+Care' },
  { name: 'Devices', icon: '🩺', color: 'bg-cyan-50/80 border-cyan-100', href: '/customer/medicines?category=Devices' },
  { name: 'Wellness', icon: '🌿', color: 'bg-emerald-50/80 border-emerald-100', href: '/customer/medicines?category=Wellness' },
];

const trustBadges = [
  { icon: '🛵', bg: 'bg-emerald-100/70 text-emerald-700', title: 'Super Fast Delivery', desc: 'On time, every time' },
  { icon: '🏷️', bg: 'bg-blue-100/70 text-blue-700', title: 'Best Prices', desc: 'Save more on every order' },
  { icon: '🛡️', bg: 'bg-purple-100/70 text-purple-700', title: 'Secure Payments', desc: '100% safe & secure' },
  { icon: '🎧', bg: 'bg-amber-100/70 text-amber-700', title: 'Expert Support', desc: "We're here to help you" },
];

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const { selectedBranchId } = useBranch();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
      return;
    }
    async function fetchMedicines() {
      try {
        const params = { limit: 6, is_active: true };
        if (selectedBranchId) params.branch_id = selectedBranchId;
        const res = await api.get('/api/medicines', params);
        setMedicines(res.data || []);
      } catch {
        setMedicines([]);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchMedicines();
  }, [user, authLoading, selectedBranchId, router]);

  if (authLoading || !user) return null;

  return (
    <div className="bg-[#F8FAFC] min-h-screen pb-16">
      
      {/* ═══════════ HERO SECTION ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 pt-6 md:pt-10">
        <div className="relative overflow-hidden rounded-[28px] border border-emerald-100/80 bg-gradient-to-r from-emerald-50/90 via-[#F0FDF4] to-slate-50 min-h-[460px] lg:min-h-[500px] shadow-sm flex flex-col justify-center">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 left-1/4 w-80 h-80 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none" />

          {/* Full-Height Background Photo covering the right side of the entire box */}
          <div className="absolute inset-y-0 right-0 w-full md:w-[48%] z-0 pointer-events-none overflow-hidden hidden md:block">
            <div 
              className="relative w-full h-full"
              style={{
                WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%)',
                maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 65%, rgba(0,0,0,0) 100%), linear-gradient(to right, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 25%)',
                WebkitMaskComposite: 'source-in',
                maskComposite: 'intersect'
              }}
            >
              <Image
                src="/images/pharmacys.webp"
                alt="Pharmacy Professional"
                fill
                priority
                className="object-cover object-right"
              />
              {/* Soft Gradient Overlay Fading Down and Left */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#F0FDF4] via-transparent to-transparent opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#F0FDF4] via-[#F0FDF4]/50 to-transparent" />
            </div>

            {/* Floating "Trusted by 2M+ Customers" Badge */}
            <div className="absolute bottom-6 right-6 z-20 bg-white/95 backdrop-blur-md rounded-2xl p-4 shadow-xl border border-gray-100/80 flex items-center gap-3 animate-float-slow hidden lg:flex">
              <div className="w-10 h-10 rounded-xl bg-[#0D9488] flex items-center justify-center text-white shrink-0 shadow-md shadow-teal-700/20">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Trusted by</p>
                <p className="text-sm font-bold text-gray-900 leading-tight">2M+ Customers</p>
                <div className="flex items-center gap-1 text-amber-400 text-xs mt-0.5">
                  ★★★★★ <span className="text-gray-500 font-semibold ml-1">4.8/5 Rating</span>
                </div>
              </div>
            </div>
          </div>

          {/* Left Hero Content */}
          <div className="relative z-10 p-6 md:p-12 lg:p-14 max-w-2xl animate-fade-in">
            <h1 className="text-4xl md:text-5xl lg:text-[54px] font-extrabold text-gray-900 leading-[1.12] tracking-tight mb-4">
              Your Health,<br />
              <span className="text-[#0D9488]">Our Commitment.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 mb-8 max-w-lg font-normal leading-relaxed">
              Genuine medicines, trusted brands and healthcare delivered to your doorstep with speed and care.
            </p>
            
            {/* Primary Call to Action Buttons */}
            <div className="flex flex-wrap gap-3 mb-9">
              <Link
                href="/customer/medicines"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-[#0D9488] via-[#0284C7] to-[#2563EB] hover:from-[#0F766E] hover:to-[#1D4ED8] text-white font-semibold text-base px-7 py-3.5 rounded-full shadow-lg shadow-teal-700/20 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <span>Shop Medicines</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
              </Link>

              <Link
                href="/customer/prescriptions"
                className="inline-flex items-center gap-2 bg-white border border-gray-300/90 text-gray-800 hover:border-[#0D9488] hover:text-[#0D9488] font-semibold text-base px-6 py-3.5 rounded-full hover:shadow-sm transition-all"
              >
                <svg className="w-5 h-5 text-[#0D9488]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                <span>Upload Prescription</span>
              </Link>
            </div>

            {/* Horizontal Mini Trust Indicators */}
            <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-emerald-200/60 text-xs sm:text-sm text-gray-600 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-xs font-bold">✓</span>
                <span>100% Genuine Products</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-xs font-bold">🔒</span>
                <span>Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-xs font-bold">↩️</span>
                <span>Easy Returns</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-[#0D9488] flex items-center justify-center text-xs font-bold">🎧</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ FLOATING TRUST BADGES BAR ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-6">
        <div className="bg-white rounded-2xl border border-gray-200/80 p-5 md:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.03)]">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {trustBadges.map((badge) => (
              <div
                key={badge.title}
                className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-default"
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 ${badge.bg}`}>
                  {badge.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 leading-tight">{badge.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5 font-normal">{badge.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ SHOP BY CATEGORY ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Shop by Category</h2>
            <p className="text-xs text-gray-500 mt-0.5">Browse healthcare essentials by department</p>
          </div>
          <Link 
            href="/customer/medicines" 
            className="text-sm font-semibold text-[#0D9488] hover:text-[#065F46] flex items-center gap-1 hover:underline transition-colors"
          >
            <span>View all categories</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              href={cat.href}
              className={`group flex flex-col items-center text-center p-5 rounded-2xl border transition-all duration-200 hover:shadow-md hover:-translate-y-1 ${cat.color}`}
            >
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-3xl mb-3 shadow-sm group-hover:scale-110 transition-transform">
                {cat.icon}
              </div>
              <span className="text-sm font-bold text-gray-900 group-hover:text-[#0D9488] transition-colors">{cat.name}</span>
              <span className="text-[10px] text-[#0D9488] font-extrabold mt-1 uppercase tracking-wider bg-white/80 px-2 py-0.5 rounded-md">
                UP TO 20% OFF
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════ BEST SELLING PRODUCTS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Best Selling Products</h2>
            <p className="text-xs text-gray-500 mt-0.5">Top-rated genuine medicines and wellness items</p>
          </div>
          <Link 
            href="/customer/medicines" 
            className="text-sm font-semibold text-[#0D9488] hover:text-[#065F46] flex items-center gap-1 hover:underline transition-colors"
          >
            <span>View all products</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-5 border border-gray-200/80 animate-pulse">
                <div className="bg-gray-100 rounded-xl aspect-square mb-3" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-3 bg-gray-100 rounded w-2/3 mb-3" />
                <div className="h-9 bg-gray-100 rounded-xl" />
              </div>
            ))}
          </div>
        ) : medicines.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {medicines.map((med) => (
              <MedicineCard key={med.id} medicine={med} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-200/80 text-gray-400">
            <div className="text-5xl mb-3">💊</div>
            <p className="text-lg font-bold text-gray-800">Products coming soon!</p>
            <p className="text-sm text-gray-500 mt-1">Check back later for our full branch catalog.</p>
          </div>
        )}
      </section>

      {/* ═══════════ PROMO & FEATURE BANNERS ═══════════ */}
      <section className="max-w-7xl mx-auto px-4 mt-14">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Banner 1: Free Delivery */}
          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#0D9488] text-white flex items-center justify-center text-2xl mb-4 shadow-md shadow-teal-700/20">
                🚚
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Free Delivery</h3>
              <p className="text-xs font-semibold text-[#0D9488] mb-2 uppercase tracking-wider">on orders over ₹500</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Fast, safe &amp; contactless delivery at your doorstep across all active pharmacy branches.
              </p>
            </div>
            <Link 
              href="/customer/medicines" 
              className="inline-flex items-center justify-center gap-2 bg-[#0D9488] hover:bg-[#0F766E] text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-md shadow-teal-700/15"
            >
              <span>Order Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>

          {/* Banner 2: Upload Prescription */}
          <div className="bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-200/60 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-[#0284C7] text-white flex items-center justify-center text-2xl mb-4 shadow-md shadow-blue-700/20">
                📋
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-1">Upload Prescription</h3>
              <p className="text-xs font-semibold text-[#0284C7] mb-2 uppercase tracking-wider">Verified by licensed pharmacists</p>
              <p className="text-xs text-gray-600 leading-relaxed mb-6">
                Get your prescription medicines verified and delivered in 3 simple steps.
              </p>
            </div>
            <Link 
              href="/customer/prescriptions" 
              className="inline-flex items-center justify-center gap-2 bg-white border border-[#0284C7] text-[#0284C7] hover:bg-[#0284C7] hover:text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm"
            >
              <span>Upload Now</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
            </Link>
          </div>

          {/* Banner 3: How it Works */}
          <div className="bg-gradient-to-br from-slate-50 to-gray-100 border border-gray-200/80 rounded-3xl p-6 lg:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">How it works?</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] text-xs font-bold flex items-center justify-center shrink-0">1</div>
                  <p className="text-xs text-gray-700 font-medium">Upload prescription or select medicines</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] text-xs font-bold flex items-center justify-center shrink-0">2</div>
                  <p className="text-xs text-gray-700 font-medium">Pharmacist verifies &amp; confirms order</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#0D9488]/15 text-[#0D9488] text-xs font-bold flex items-center justify-center shrink-0">3</div>
                  <p className="text-xs text-gray-700 font-medium">Fast delivery directly to your doorstep</p>
                </div>
              </div>
            </div>
            <Link 
              href="/customer/medicines" 
              className="mt-6 inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white text-sm font-semibold px-5 py-3 rounded-xl transition-all shadow-sm"
            >
              <span>Explore Products</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
