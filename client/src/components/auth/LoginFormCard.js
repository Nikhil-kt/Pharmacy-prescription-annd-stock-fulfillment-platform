'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  PillLogoIcon, 
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

export default function LoginFormCard({
  email,
  setEmail,
  password,
  setPassword,
  error,
  loading,
  handleSubmit
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  return (
    <div className="w-full max-w-lg mx-auto animate-slide-up">
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

      {/* Main Glassmorphic Login Card */}
      <div className="bg-white/90 backdrop-blur-xl border border-gray-200/80 rounded-[24px] shadow-[0_30px_60px_rgba(0,0,0,0.08)] p-6 sm:p-10 lg:p-12 transition-all duration-300">
        
        {/* Card Header */}
        <div className="mb-8">
          <h2 className="text-2xl sm:text-[28px] font-semibold text-gray-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-sm text-gray-500 mt-1.5 font-normal">
            Sign in to your RxConnect account
          </p>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200/80 text-red-700 text-sm flex items-start gap-3 animate-fade-in">
            <AlertCircleIcon className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{error}</div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Email
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
                placeholder="kanavujalu76@gmail.com"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Password
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
                className="w-full h-[56px] pl-12 pr-12 bg-slate-50/70 border border-gray-300/80 rounded-2xl text-base text-gray-900 placeholder-gray-400 outline-none focus:bg-white focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10 transition-all duration-200 font-normal"
                placeholder="••••••••••••"
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

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#2563EB] focus:ring-[#2563EB] transition cursor-pointer"
              />
              <span className="text-xs sm:text-sm text-gray-600 group-hover:text-gray-900 transition-colors">
                Remember me
              </span>
            </label>

            <Link
              href="/auth/forgot-password"
              className="text-xs sm:text-sm font-semibold text-[#0D9488] hover:text-[#065F46] hover:underline transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          {/* Primary Action Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-[56px] bg-gradient-to-r from-[#0D9488] via-[#0284C7] to-[#2563EB] hover:from-[#0F766E] hover:to-[#1D4ED8] text-white font-semibold text-base rounded-2xl shadow-lg shadow-teal-700/20 hover:shadow-xl hover:shadow-blue-600/30 transform hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2.5 disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? (
              <>
                <LoadingSpinnerIcon className="w-5 h-5" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Log In</span>
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

        {/* Account Switcher / Sign Up Link */}
        <div className="text-center mt-7">
          <p className="text-sm text-gray-600 font-normal">
            Don&apos;t have an account?{' '}
            <Link
              href="/auth/signup"
              className="text-[#0D9488] font-semibold hover:text-[#065F46] hover:underline transition-colors"
            >
              Sign up
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
