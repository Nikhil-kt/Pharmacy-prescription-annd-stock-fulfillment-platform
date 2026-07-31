"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AlertCircle,
  ArrowRight,
  Lock,
  Mail,
  Phone,
  User,
  ShieldCheck,
} from "lucide-react";

export default function SignupPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: form.full_name,
          email: form.email,
          password: form.password,
          role: "customer"
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage("Account created successfully! Redirecting to login...");
        setTimeout(() => router.push("/login"), 1500);
      } else {
        throw new Error(data.message || "Sign up failed");
      }
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f4faf7]">
      {/* Trust bar */}
      <div className="w-full bg-[#047857] py-2 text-center text-xs font-medium text-white">
        100% Genuine Medicines · Licensed Pharmacists · Free Delivery Over $30
      </div>

      <div className="mx-auto flex max-w-6xl flex-col items-center justify-center gap-10 px-4 py-12 lg:flex-row lg:items-start lg:gap-16">
        {/* Branding */}
        <div className="max-w-md text-center lg:text-left">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#047857] text-white">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-7 w-7">
                <path d="M12 6v12M6 12h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold leading-none text-[#0f172a]">HealthFirst</div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#047857]">
                Pharmacy
              </div>
            </div>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-[#0f172a] sm:text-4xl">
            Join HealthFirst today
          </h1>
          <p className="mt-4 text-base text-[#6b7280]">
            Create an account to order medicines, upload prescriptions, and track
            deliveries right to your door.
          </p>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#047857] lg:justify-start">
            <ShieldCheck className="h-4 w-4" />
            Your health data is encrypted and secure
          </div>
        </div>

        {/* Card */}
        <div className="w-full max-w-md rounded-2xl border border-[#e2e8f0] bg-white p-8 shadow-lg">
          <h2 className="text-2xl font-bold text-[#0f172a]">Create account</h2>
          <p className="mt-1 text-sm text-[#6b7280]">Enter your details to get started</p>

          {message && (
            <div className="mt-5 rounded-lg border border-[#047857]/20 bg-[#047857]/10 p-3 text-sm text-[#047857]">
              {message}
            </div>
          )}

          {error && (
            <div className="mt-5 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="mt-6 space-y-4">
            <div className="space-y-2">
              <label htmlFor="full_name" className="text-sm font-medium text-[#0f172a]">
                Full name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  placeholder="John Doe"
                  value={form.full_name}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#0f172a]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium text-[#0f172a]">
                Phone number
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={form.phone}
                  onChange={handleChange}
                  className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-[#0f172a]">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Create a password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/20"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium text-[#0f172a]">
                Confirm password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Re-enter your password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  minLength={8}
                  className="h-11 w-full rounded-lg border border-[#e2e8f0] bg-white pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-2 focus:ring-[#047857]/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[#047857] text-sm font-semibold text-white transition-colors hover:bg-[#036b4e] disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#6b7280]">Already have an account?</span>{" "}
            <Link href="/login" className="font-semibold text-[#047857] hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}