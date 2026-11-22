"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
} from "react";

export interface CartItem {
  cartKey: string; // `${productId}__${finishId}__${sizeId}`
  productId: string;
  productSlug: string;
  categorySlug: string;
  title: string;
  finishId: string;
  finishName: string;
  finishHex: string;
  sizeId: string;
  sizeLabel: string;
  dimensionsText: string;
  unitPrice: number;
  thumbnailUrl: string;
  quantity: number;
}

export interface CartContextValue {
  items: CartItem[];
  totalItems: number;
  estimatedTotal: number;
  isOpen: boolean;
  addItem: (item: Omit<CartItem, "cartKey" | "quantity">, quantity?: number) => void;
  removeItem: (cartKey: string) => void;
  updateQuantity: (cartKey: string, quantity: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const STORAGE_KEY = "green_steel_cart_v1";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate safely on client mount without SSR mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch (err) {
      console.warn("[CartContext] Failed to load cart from localStorage:", err);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  // Persist to localStorage on change after initial hydration
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.warn("[CartContext] Failed to persist cart to localStorage:", err);
    }
  }, [items, isHydrated]);

  const addItem = useCallback(
    (item: Omit<CartItem, "cartKey" | "quantity">, quantity = 1) => {
      const cartKey = `${item.productId}__${item.finishId}__${item.sizeId}`;

      setItems((prev) => {
        const existingIndex = prev.findIndex((i) => i.cartKey === cartKey);
        if (existingIndex > -1) {
          const updated = [...prev];
          const current = updated[existingIndex];
          updated[existingIndex] = {
            ...current,
            quantity: current.quantity + quantity,
          };
          return updated;
        }
        return [...prev, { ...item, cartKey, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((cartKey: string) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
  }, []);

  const updateQuantity = useCallback((cartKey: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.cartKey !== cartKey));
      return;
    }
    setItems((prev) =>
      prev.map((i) => (i.cartKey === cartKey ? { ...i, quantity } : i))
    );
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => setIsOpen(true), []);
  const closeCart = useCallback(() => setIsOpen(false), []);
  const toggleCart = useCallback(() => setIsOpen((prev) => !prev), []);

  const totalItems = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  );

  const estimatedTotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0),
    [items]
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      totalItems,
      estimatedTotal,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    }),
    [
      items,
      totalItems,
      estimatedTotal,
      isOpen,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      toggleCart,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

