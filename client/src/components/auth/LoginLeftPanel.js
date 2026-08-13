'use client';

import Link from 'next/link';
import Image from 'next/image';
import { PharmacySymbolIcon, ShieldCheckIcon, TruckIcon, MapPinIcon } from '@/components/ui/AuthIcons';

const BACKGROUND_IMAGE_URL = '/images/pharmacys.webp';

export default function LoginLeftPanel() {
  return (
    <div className="relative hidden lg:flex flex-col justify-between w-[55%] xl:w-[58%] min-h-screen text-white p-12 xl:p-16 overflow-hidden select-none">
      {/* Background Hero Photo */}
      <div className="absolute inset-0 z-0">
        <Image
          src={BACKGROUND_IMAGE_URL}
          alt="Pharmacy"
          fill
          priority
          className="object-cover"
        />
      </div>

      {/* Teal Gradient Overlay (Branded tint over the photo) */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#06373A]/95 via-[#0C5858]/85 to-[#04282B]/95 mix-blend-multiply" />
      <div className="absolute inset-0 z-[1] bg-gradient-to-br from-[#06373A]/70 via-[#0C5858]/55 to-[#04282B]/80" />

      {/* Dynamic ambient floating blur circles */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow z-[2]" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none animate-float-slow z-[2]" />
      <div className="absolute top-10 right-1/3 w-72 h-72 bg-teal-400/15 rounded-full blur-2xl pointer-events-none animate-float-reverse z-[2]" />

      {/* Decorative subtle dot grid */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay bg-cover bg-center z-[2]"
        style={{ backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.15) 1px, transparent 1px)`, backgroundSize: '32px 32px' }}
      />

      {/* Header Logo */}
      <div className="relative z-10">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md p-1.5 shadow-lg shadow-emerald-900/40 group-hover:scale-105 transition-transform duration-300 flex items-center justify-center border border-white/40">
            <PharmacySymbolIcon className="w-9 h-9" />
          </div>
          <div>
            <span className="text-2xl font-bold tracking-tight text-white block leading-none">
              RxConnect
            </span>
            <span className="text-[11px] font-semibold text-emerald-300 tracking-[0.25em] uppercase block mt-1">
              PHARMACY
            </span>
          </div>
        </Link>
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-xl my-auto py-8">
        <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.15] mb-4">
          Your health, <br />
          <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
            our priority
          </span>
        </h1>
        <p className="text-emerald-100/80 text-base xl:text-lg leading-relaxed mb-10 max-w-lg font-normal">
          Connect with trusted pharmacies, upload prescriptions, track orders and get genuine medicines delivered with care.
        </p>

        {/* Feature List Badges */}
        <div className="space-y-4 max-w-md">
          {/* Feature 1 */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
              <ShieldCheckIcon className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Secure &amp; Private</h3>
              <p className="text-emerald-100/70 text-sm">Your health data is always protected</p>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-400/30 flex items-center justify-center shrink-0">
              <TruckIcon className="w-6 h-6 text-teal-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Fast Delivery</h3>
              <p className="text-emerald-100/70 text-sm">Genuine medicines at your doorstep</p>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 shadow-xl hover:bg-white/15 transition-all duration-300 transform hover:-translate-y-0.5">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center shrink-0">
              <MapPinIcon className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-base">Near You</h3>
              <p className="text-emerald-100/70 text-sm">Find nearby trusted licensed pharmacies</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Trust Stat */}
      <div className="relative z-10 flex items-center justify-between pt-6 border-t border-white/10 text-xs text-emerald-200/60 font-medium">
        <span>© 2026 RxConnect Pharmacy. All rights reserved.</span>
        <span className="flex items-center gap-1.5 text-emerald-300 font-semibold">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          Live Pharmacy Network Active
        </span>
      </div>

      {/* Organic S-Curve Division into Right Side */}
      <div className="absolute top-0 right-0 bottom-0 w-24 pointer-events-none hidden xl:block z-10">
        <svg className="h-full w-full text-slate-50 fill-current" viewBox="0 0 100 1000" preserveAspectRatio="none">
          <path d="M0,0 C70,300 70,700 0,1000 L100,1000 L100,0 Z" />
        </svg>
      </div>
    </div>
  );
}