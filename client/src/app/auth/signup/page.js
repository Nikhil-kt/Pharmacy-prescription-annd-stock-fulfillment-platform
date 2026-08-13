'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import LoginLeftPanel from '@/components/auth/LoginLeftPanel';
import SignupFormCard from '@/components/auth/SignupFormCard';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!role) {
      setError('Please select an account role.');
      return;
    }

    setLoading(true);
    try {
      const res = await signUp(email, password, fullName, phone, role);
      router.push(res.dashboard || '/');
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] overflow-hidden animate-fade-in relative">
      {/* Left Side Hero Panel (55-60% width on Desktop) */}
      <LoginLeftPanel />

      {/* Right Side Form Panel (Centered Glass Signup Card) */}
      <div className="flex-1 flex flex-col justify-center items-center p-4 sm:p-8 lg:p-12 relative z-10 overflow-y-auto min-h-screen">
        {/* Ambient floating glow Orbs */}
        <div className="absolute top-10 right-10 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />

        <SignupFormCard
          fullName={fullName}
          setFullName={setFullName}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          role={role}
          setRole={setRole}
          error={error}
          loading={loading}
          handleSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
