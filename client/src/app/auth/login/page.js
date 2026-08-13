'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginLeftPanel from '@/components/auth/LoginLeftPanel';
import LoginFormCard from '@/components/auth/LoginFormCard';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user, profile, loading: authLoading, signIn, getDashboardForRole } = useAuth();
  const router = useRouter();

  // If already signed in, redirect to dashboard automatically
  useEffect(() => {
    if (!authLoading && user) {
      const role = profile?.role || user?.user_metadata?.role || 'customer';
      router.push(getDashboardForRole(role));
    }
  }, [user, profile, authLoading, router, getDashboardForRole]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await signIn(email, password);
      router.push(res.dashboard || '/customer/dashboard');
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-hidden animate-fade-in relative">
      {/* Left Side Hero Panel (55-60% width on Desktop) */}
      <LoginLeftPanel />

      {/* Right Side Form Panel (Centered Glass Login Card) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative z-10 overflow-y-auto min-h-screen">
        {/* Ambient floating glow Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />

        <LoginFormCard
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          error={error}
          loading={loading}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
