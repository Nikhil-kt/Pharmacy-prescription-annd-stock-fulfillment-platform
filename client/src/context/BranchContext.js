'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import api from '@/lib/api';

const BranchContext = createContext({});

const STORAGE_KEY = 'rxconnect_selected_branch_id';

export function BranchProvider({ children }) {
  const [branches, setBranches] = useState([]);
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [loadingBranches, setLoadingBranches] = useState(true);

  useEffect(() => {
    fetchBranches();
  }, []);

  async function fetchBranches() {
    setLoadingBranches(true);
    try {
      const res = await api.get('/api/branches', { is_active: true });
      const branchList = res.data || [];
      setBranches(branchList);

      // Restore saved branch from localStorage or default to first branch
      if (typeof window !== 'undefined') {
        const savedId = localStorage.getItem(STORAGE_KEY);
        if (savedId && branchList.some(b => b.id === savedId)) {
          setSelectedBranchId(savedId);
        } else if (branchList.length > 0) {
          setSelectedBranchId(branchList[0].id);
        }
      }
    } catch (e) {
      console.error('Failed to load branches:', e);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  }

  const selectBranch = (branchId) => {
    setSelectedBranchId(branchId);
    if (typeof window !== 'undefined') {
      if (branchId) {
        localStorage.setItem(STORAGE_KEY, branchId);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  };

  const selectedBranch = branches.find(b => b.id === selectedBranchId) || null;

  return (
    <BranchContext.Provider
      value={{
        branches,
        selectedBranch,
        selectedBranchId,
        selectBranch,
        loadingBranches,
      }}
    >
      {children}
    </BranchContext.Provider>
  );
}

export const useBranch = () => useContext(BranchContext);
