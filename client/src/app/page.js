"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
export default function AuthPage() {
  const router = useRouter();

  // Mode state: 'login' or 'signup'
  const [isSignUp, setIsSignUp] = useState(false);

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [role, setRole] = useState("customer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setErrorMessage("");
    setSuccessMessage("");
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!role) {
      setErrorMessage("Please select your workspace role.");
      return;
    }

    // Firebase Auth requirement check
    if (isSignUp && password.length < 6) {
      setErrorMessage(
        "Password must be at least 6 characters long for Firebase Auth.",
      );
      return;
    }

    setLoading(true);

    const endpoint = isSignUp
      ? "http://localhost:5000/api/signup"
      : "http://localhost:5000/api/login";

    const payload = isSignUp
      ? { fullName, role, email, password }
      : { role, email, password };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (data.success) {
        if (isSignUp) {
          setSuccessMessage(
            "Account created successfully! Redirecting to sign in...",
          );
          setTimeout(() => {
            setIsSignUp(false);
            setSuccessMessage("");
          }, 1800);
        } else {
          // Redirect based on role returned from server
          if (data.role === "admin") router.push("/frontend/admin/dashboard");
          else if (data.role === "pharmacist")
            router.push("/frontend/pharmacist/dashboard");
          else if (data.role === "delivery")
            router.push("/frontend/delivery/dashboard");
          else router.push("/frontend/user/dashboard");
        }
      } else {
        setErrorMessage(
          data.message ||
            "Authentication failed. Please check your credentials.",
        );
      }
    } catch (err) {
      setErrorMessage(
        "Unable to connect to backend server. Make sure server.js is actively running on port 5000.",
      );
    } finally {
      setLoading(false);
    }
  }

  const roleConfigs = [
    {
      id: "customer",
      label: "Customer",
      icon: "👤",
      desc: "Order medicines & track prescriptions",
    },
    {
      id: "pharmacist",
      label: "Pharmacist",
      icon: "💊",
      desc: "Fulfill orders & verify inventory",
    },
    {
      id: "delivery",
      label: "Delivery",
      icon: "🚚",
      desc: "Manage dispatch & drop-offs",
    },
    {
      id: "admin",
      label: "Administrator",
      icon: "🏥",
      desc: "System control & store management",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between font-sans text-slate-100 antialiased relative overflow-hidden selection:bg-emerald-500 selection:text-white">
      {/* Animated Ambient Background Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl animate-[pulse_6s_ease-in-out_infinite]" />
      <div className="absolute top-1/2 right-[-10%] w-[500px] h-[500px] bg-teal-500/15 rounded-full blur-3xl animate-[pulse_8s_ease-in-out_infinite]" />

      {/* Top Status Banner */}
      <div className="relative z-20 bg-slate-950/80 backdrop-blur-md border-b border-emerald-900/40 text-emerald-300 text-xs py-2.5 px-4 text-center font-medium tracking-wide flex justify-center items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <span>RxConnect Gateway — Encrypted Healthcare Logistics Network</span>
      </div>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-5xl bg-slate-900/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-emerald-950/50 border border-slate-800 grid grid-cols-1 lg:grid-cols-12 min-h-[640px] overflow-hidden">
          {/* Left Hero Panel (Branding & Visuals) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900/90 to-slate-950 p-8 lg:p-10 flex flex-col justify-between relative border-b lg:border-b-0 lg:border-r border-slate-800/80">
            <div className="space-y-6 z-10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-emerald-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-2xl shadow-lg shadow-emerald-500/30">
                  💊
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-white leading-none">
                    RxConnect
                  </h1>
                  <span className="text-[10px] text-emerald-400 font-semibold tracking-widest uppercase">
                    Pharmacy Network
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-3xl font-extrabold tracking-tight text-white leading-snug">
                  {isSignUp
                    ? "Join the Network Today."
                    : "Smart Healthcare, Connected."}
                </h2>
                <p className="text-slate-300 text-xs leading-relaxed">
                  {isSignUp
                    ? "Create your account to request prescriptions, fulfill stock orders, or manage platform dispatch."
                    : "Unified portal access for customers, certified pharmacists, courier partners, and admins."}
                </p>
              </div>
            </div>

            {/* Floating Animated Core Badge */}
            <div className="my-6 relative z-10 flex flex-col items-center justify-center py-6 border border-emerald-500/20 rounded-2xl bg-slate-950/40 backdrop-blur-sm">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-dashed border-emerald-500/40 rounded-full animate-[spin_12s_linear_infinite]" />
                <div className="w-10 h-10 rounded-full bg-emerald-500/20 backdrop-blur-md flex items-center justify-center text-xl animate-[bounce_3s_ease-in-out_infinite]">
                  🛡️
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2 text-[11px] font-mono text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span>FIREBASE SYNC ACTIVE</span>
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> End-to-End
                Rx Hashing
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-400 font-bold">✓</span> Role-Based
                Dashboard Access
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="lg:col-span-7 p-8 lg:p-12 flex flex-col justify-center bg-slate-900/90">
            <div className="max-w-md mx-auto w-full space-y-6">
              {/* Tab Switcher */}
              <div className="flex bg-slate-950/80 p-1 rounded-xl border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(false);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    !isSignUp
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(true);
                    setErrorMessage("");
                    setSuccessMessage("");
                  }}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    isSignUp
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  Create Account
                </button>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-white tracking-tight">
                  {isSignUp ? "Create Your Account" : "Welcome Back"}
                </h3>
                <p className="text-slate-400 text-xs mt-1">
                  {isSignUp
                    ? "Enter your details below to register on RxConnect."
                    : "Select your role and enter credentials to sign in."}
                </p>
              </div>

              {/* Status Alert Boxes */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl text-rose-300 text-xs font-medium animate-[shake_0.4s_ease-in-out]">
                  ⚠️ {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-medium">
                  ✅ {successMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Full Name Field (Sign Up Only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-600 transition-all duration-200"
                    />
                  </div>
                )}

                {/* Role Selector */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Select Account Role
                  </label>
                  <div className="grid grid-cols-2 gap-2.5">
                    {roleConfigs.map((item) => {
                      const isSelected = role === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setRole(item.id)}
                          className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                            isSelected
                              ? "border-emerald-500 bg-emerald-950/60 text-white ring-1 ring-emerald-500/40 shadow-sm"
                              : "border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <div className="flex items-center justify-between w-full mb-1">
                            <span className="text-sm">{item.icon}</span>
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-emerald-400 shadow-[0_0_6px_#34d399]" : "bg-slate-700"}`}
                            />
                          </div>
                          <div>
                            <span className="text-xs font-bold block text-white">
                              {item.label}
                            </span>
                            <span className="text-[10px] text-slate-400 block mt-0.5 leading-tight">
                              {item.desc}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="name@rxconnect.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-600 transition-all duration-200"
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2.5 text-sm bg-slate-950/60 border border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-white placeholder:text-slate-600 transition-all duration-200"
                  />
                </div>

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-bold rounded-xl text-sm shadow-xl shadow-emerald-950/60 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Communicating with Server...
                    </span>
                  ) : (
                    <span>
                      {isSignUp
                        ? "Register Account →"
                        : "Sign In to Dashboard →"}
                    </span>
                  )}
                </button>
              </form>

              {/* Toggle Subtext */}
              <p className="text-center text-xs text-slate-400">
                {isSignUp
                  ? "Already registered on RxConnect?"
                  : "New user to the platform?"}{" "}
                <button
                  type="button"
                  onClick={toggleMode}
                  className="text-emerald-400 font-semibold hover:underline ml-1"
                >
                  {isSignUp ? "Sign In" : "Create an Account"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="relative z-10 py-3 border-t border-slate-800/60 bg-slate-950/60 text-center text-[11px] text-slate-500">
        © 2026 RxConnect Platform. All Rights Reserved.
      </footer>
    </div>
  );
}
