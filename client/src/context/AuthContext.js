'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import api from '@/lib/api';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/api/profiles/me');
      setProfile(res.data);
      return res.data;
    } catch (e) {
      // If 403 with pending status, still try to get basic profile info from Supabase
      setProfile(null);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const initAuth = async () => {
      try {
        const { data: { session: s } } = await supabase.auth.getSession();
        if (!isMounted) return;
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          await fetchProfile();
        } else {
          setProfile(null);
        }
      } catch (e) {
        console.error('Auth initialization error:', e);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, s) => {
      if (!isMounted) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        await fetchProfile();
      } else {
        setProfile(null);
      }
      if (isMounted) setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const getDashboardForRole = (role) => {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'pharmacist':
        return '/pharmacist/dashboard';
      case 'delivery':
      case 'delivery_partner':
        return '/delivery/dashboard';
      case 'customer':
      default:
        return '/customer/dashboard';
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const metaRole = data.user?.user_metadata?.role;
    let userRole = metaRole || 'customer';
    let userStatus = 'active';

    try {
      const res = await api.get('/api/profiles/me');
      if (res.data) {
        setProfile(res.data);
        userRole = res.data.role || metaRole || 'customer';
        userStatus = res.data.status || 'active';

        // Auto-sync role mismatch: If metadata role differs from profile table role, update database profile!
        if (metaRole && res.data.role !== metaRole) {
          try {
            const updated = await api.put('/api/profiles/me', { role: metaRole });
            if (updated?.data) {
              setProfile(updated.data);
              userRole = metaRole;
            }
          } catch (syncErr) {
            console.error('Role sync error:', syncErr);
          }
        }
      }
    } catch (err) {
      if (err.message && err.message.includes('pending')) {
        userStatus = 'pending';
        userRole = metaRole || 'customer';
      } else if (err.message && err.message.includes('rejected')) {
        userStatus = 'rejected';
        userRole = metaRole || 'customer';
      }
    }

    if (userStatus === 'pending' || userStatus === 'rejected') {
      return { ...data, role: userRole, status: userStatus, dashboard: '/auth/pending' };
    }

    return { ...data, role: userRole, status: userStatus, dashboard: getDashboardForRole(userRole) };
  };

  const signUp = async (email, password, fullName, phone, role = 'customer') => {
    const userRole = role || 'customer';

    // 1. First attempt registration via backend (creates auth user + upserts profile with role using service key)
    try {
      const res = await api.post('/api/profiles/register', {
        email,
        password,
        fullName,
        phone,
        role: userRole,
      });

      if (res && res.success) {
        return await signIn(email, password);
      }
    } catch (regErr) {
      console.warn('Backend register failed, trying client auth fallback:', regErr.message);
      if (regErr.message && regErr.message.toLowerCase().includes('already registered')) {
        throw new Error('An account with this email address already exists. Please sign in on the login page.');
      }
    }

    // 2. Client-side Supabase auth fallback
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, phone, role: userRole },
      },
    });

    if (authError) {
      const errMsg = authError.message ? authError.message : '';
      if (errMsg.toLowerCase().includes('already registered')) {
        throw new Error('An account with this email address already exists. Please sign in on the login page.');
      }
      if (!errMsg.toLowerCase().includes('database error')) {
        throw authError;
      }
    }

    // 3. Establish session & return dashboard
    try {
      return await signIn(email, password);
    } catch {
      const dashboard = userRole === 'pharmacist'
        ? '/auth/pending'
        : (userRole === 'delivery' || userRole === 'delivery_partner')
          ? '/delivery/dashboard'
          : getDashboardForRole(userRole);

      return {
        user: authData?.user,
        role: userRole,
        status: userRole === 'pharmacist' ? 'pending' : 'active',
        dashboard,
      };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, session, loading, signIn, signUp, signOut, getDashboardForRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
