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
  ShieldCheck,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) throw userError ?? new Error("Could not get user");

      // Fetch the user's role from the secure user_roles table
      const { data: roleRow, error: roleError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .single();

      if (roleError && roleError.code !== "PGRST116") throw roleError;

      const role = roleRow?.role ?? "user";

      switch (role) {
        case "admin":
          router.push("/admin/dashboard");
          break;
        case "pharmacist":
          router.push("/pharmacist/dashboard");
          break;
        case "delivery":
          router.push("/delivery/dashboard");
          break;
        default:
          router.push("/dashboard");
      }
    } catch (err) {
      setError(err.message ?? "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafcfb]">
      {/* Top trust bar */}
      <div className="bg-[#047857] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 px-4 py-2 text-xs font-medium">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5" />
            100% Genuine Medicines
          </span>
          <span className="hidden sm:inline">|</span>
          <span className="hidden sm:inline">Trusted by 2M+ Customers</span>
        </div>
      </div>

      <div className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-8 px-4 py-12 lg:flex-row lg:items-start lg:gap-16">
        {/* Branding panel */}
        <div className="flex max-w-md flex-col items-center text-center lg:items-start lg:text-left">
          <Link href="/" className="mb-6 inline-flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#047857] text-white">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="h-7 w-7"
                aria-hidden="true"
              >
                <path d="M12 6v12M6 12h12" strokeLinecap="round" />
              </svg>
            </div>
            <div className="text-left">
              <div className="text-xl font-bold leading-none tracking-tight text-[#111827]">
                HealthFirst
              </div>
              <div className="text-xs font-semibold uppercase tracking-widest text-[#047857]">
                Pharmacy
              </div>
            </div>
          </Link>

          <h1 className="text-3xl font-bold tracking-tight text-[#111827] sm:text-4xl">
            Your health, our commitment.
          </h1>
          <p className="mt-4 text-base text-[#6b7280]">
            Sign in to order genuine medicines, track prescriptions, and manage
            your healthcare needs from one secure place.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d1fae5] text-[#047857]">
                <ShieldCheck className="h-4 w-4" />
              </div>
              <span className="text-[#111827]">Secure Payments</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#d1fae5] text-[#047857]">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-4 w-4"
                >
                  <path
                    d="M5 12h14M12 5l7 7-7 7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="text-[#111827]">Fast Delivery</span>
            </div>
          </div>
        </div>

        {/* Login card */}
        <div className="w-full max-w-md rounded-xl border border-[#e5e7eb] bg-white p-6 shadow-lg">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-[#111827]">Welcome back</h2>
            <p className="text-sm text-[#6b7280]">
              Sign in to your HealthFirst account
            </p>
          </div>

          {error && (
            <div className="mb-4 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-[#111827]">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e5e7eb] bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-[#111827]">
                  Password
                </label>
                <Link
                  href="/reset-password"
                  className="text-xs font-medium text-[#047857] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9ca3af]" />
                <input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-md border border-[#e5e7eb] bg-white py-2 pl-10 pr-3 text-sm outline-none focus:border-[#047857] focus:ring-1 focus:ring-[#047857]"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#047857] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[#065f46] disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign in"}
              {!loading && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-[#6b7280]">Don&apos;t have an account?</span>{" "}
            <Link href="/signup" className="font-semibold text-[#047857] hover:underline">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
