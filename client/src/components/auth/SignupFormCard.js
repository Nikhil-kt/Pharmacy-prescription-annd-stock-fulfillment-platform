'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PillLogoIcon, 
  UserIcon,
  PhoneIcon,
  MailIcon, 
  LockIcon, 
  EyeIcon, 
  EyeOffIcon, 
  ArrowRightIcon, 
  GoogleIcon, 
  FacebookIcon, 
  AppleIcon, 
  AlertCircleIcon, 
  LoadingSpinnerIcon,
  ShieldCheckIcon 
} from '@/components/ui/AuthIcons';

const roles = [
  { id: 'customer', title: 'Customer', icon: '🛒', desc: 'Order genuine medicines online' },
  { id: 'pharmacist', title: 'Pharmacist', icon: '💊', desc: 'Manage branch stock & verify Rx' },
  { id: 'delivery_partner', title: 'Delivery Partner', icon: '🚚', desc: 'Deliver orders to customers' },
  { id: 'admin', title: 'Admin', icon: '🛡️', desc: 'Master store & system control' },
];

export default function SignupFormCard({
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  password,
  setPassword,
  role,
  setRole,
  error,
  loading,
  handleSubmit
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full max-w-xl mx-auto animate-slide-up my-6">
      {/* Mobile-Only Header Brand Branding */}
      <div className="lg:hidden text-center mb-6">
        <Link href="/" className="inline-flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-[#0D5C58] to-[#2563EB] rounded-xl flex items-center justify-center shadow-md">
            <PillLogoIcon className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="text-xl font-bold text-gray-900 leading-none block">RxConnect</span>
            <span className="text-[9px] font-semibold text-emerald-600 tracking-wider uppercase block">PHARMACY</span>
          </div>
        </Link>
      </div>

      {/* Main Glassmorphic Signup Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] p-6 sm:p-10 lg:p-12 transition-all duration-300">
        
        {/* Card Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-gray-900 tracking-tight">
            Create Account
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 font-normal">
            Select your account role to join RxConnect
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Account Role Selector Grid */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2.5">
              Select Account Role *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((r) => {
                const isSelected = role === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`cursor-pointer p-3.5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50/60 border-[#0D9488] shadow-sm ring-2 ring-[#0D9488]/10'
                        : 'bg-slate-50/70 border-gray-200/80 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-2xl">{r.icon}</span>
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#0D9488] text-white flex items-center justify-center text-[10px] font-bold">
                          ✓
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900">{r.title}</h4>
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{r.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Full Name Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Full Name *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-gray-400">
                <UserIcon className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full h-[56px] pl-12 pr-4 bg-slate-50/70 border border-gray-300/80 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-200 font-normal"
                placeholder="Dr. Jane Smith"
              />
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Phone Number
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-gray-400">
                <PhoneIcon className="w-5 h-5" />
              </div>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full h-[56px] pl-12 pr-4 bg-slate-50/70 border border-gray-300/80 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-200 font-normal"
                placeholder="+91 98765 43210"
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Email Address *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-gray-400">
                <MailIcon className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full h-[56px] pl-12 pr-4 bg-slate-50/70 border border-gray-300/80 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-200 font-normal"
                placeholder="you@rxconnect.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Password *
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 pointer-events-none text-gray-400">
                <LockIcon className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full h-[56px] pl-12 pr-12 bg-slate-50/70 border border-gray-300/80 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-200 font-normal"
                placeholder="Min 6 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none p-1 transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] mt-2 bg-gradient-to-r from-[#0D9488] via-[#0284C7] to-[#2563EB] hover:from-[#0F766E] hover:to-[#1D4ED8] text-white font-semibold text-base rounded-2xl shadow-lg shadow-teal-700/20 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <LoadingSpinnerIcon className="w-5 h-5" />
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Create {roles.find(r => r.id === role)?.title || 'Account'}</span>
                <ArrowRightIcon className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Divider with "or continue with" */}
        <div className="relative my-7">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200/80" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-medium">
              or continue with
            </span>
          </div>
        </div>

        {/* Social Authentication Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 px-3 border border-gray-200 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all hover:shadow-sm"
          >
            <GoogleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Google</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 px-3 border border-gray-200 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all hover:shadow-sm"
          >
            <FacebookIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Facebook</span>
          </button>

          <button
            type="button"
            className="flex items-center justify-center gap-2 h-12 px-3 border border-gray-200 rounded-xl bg-white hover:bg-slate-50 text-xs font-semibold text-gray-700 transition-all hover:shadow-sm"
          >
            <AppleIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Apple</span>
          </button>
        </div>

        {/* Already Have Account Link */}
        <div className="text-center mt-7">
          <p className="text-sm text-gray-600 font-normal">
            Already have an account?{' '}
            <Link
              href="/auth/login"
              className="text-[#0D9488] font-semibold hover:text-[#065F46] hover:underline transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Security & Privacy Guarantee */}
        <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-center gap-2 text-center text-xs text-gray-400 font-medium">
          <ShieldCheckIcon className="w-4 h-4 text-emerald-500 shrink-0" />
          <span>We never share your information with anyone.</span>
        </div>
      </div>
    </div>
  );
}
