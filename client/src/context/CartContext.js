'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const CartContext = createContext({});

const STORAGE_KEY = 'rxconnect_cart';

function loadCart() {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [attachedPrescription, setAttachedPrescription] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setItems(loadCart());
    if (typeof window !== 'undefined') {
      try {
        const savedRx = localStorage.getItem('rxconnect_attached_prescription');
        if (savedRx) setAttachedPrescription(JSON.parse(savedRx));
      } catch { /* empty */ }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      if (attachedPrescription) {
        localStorage.setItem('rxconnect_attached_prescription', JSON.stringify(attachedPrescription));
      } else {
        localStorage.removeItem('rxconnect_attached_prescription');
      }
    }
  }, [attachedPrescription, isLoaded]);

  const addItem = useCallback((medicine, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item.id === medicine.id);
      if (existing) {
        return prev.map(item =>
          item.id === medicine.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...medicine, quantity }];
    });
  }, []);

  const buyNow = useCallback((medicine, quantity = 1, prescription = null) => {
    setItems([{ ...medicine, quantity }]);
    if (prescription) {
      setAttachedPrescription(prescription);
    }
  }, []);

  const removeItem = useCallback((medicineId) => {
    setItems(prev => prev.filter(item => item.id !== medicineId));
  }, []);

  const updateQuantity = useCallback((medicineId, quantity) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(item => item.id !== medicineId));
      return;
    }
    setItems(prev =>
      prev.map(item =>
        item.id === medicineId ? { ...item, quantity } : item
      )
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAttachedPrescription(null);
  }, []);

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);

  return (
    <CartContext.Provider value={{
      items, addItem, buyNow, removeItem, updateQuantity, clearCart,
      attachedPrescription, setAttachedPrescription,
      cartCount, cartTotal, isLoaded
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
