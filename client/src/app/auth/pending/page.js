'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function PendingApprovalPage() {
  const { signOut, user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-orange-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-10 border border-gray-100 text-center">
          {/* Status Icon */}
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2">
            Account Pending Approval
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Your pharmacist account has been registered successfully.
          </p>

          {/* Info Card */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 mb-6 text-left">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-wider mb-3">
              What happens next?
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                <span className="text-sm text-amber-900">An admin will review your registration.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                <span className="text-sm text-amber-900">You will be assigned to a pharmacy branch.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                <span className="text-sm text-amber-900">Once approved, you can log in and start managing prescriptions &amp; stock.</span>
              </li>
            </ul>
          </div>

          {/* Email badge */}
          {user?.email && (
            <div className="bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 mb-6">
              <p className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Registered as</p>
              <p className="text-sm font-semibold text-gray-700">{user.email}</p>
            </div>
          )}

          {/* Sign Out */}
          <button
            onClick={handleSignOut}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-all text-sm"
          >
            Sign Out
          </button>

          <p className="text-xs text-gray-400 mt-4">
            Please check back later or contact your admin for faster approval.
          </p>
        </div>
      </div>
    </div>
  );
}
