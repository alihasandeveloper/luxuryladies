"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface CartItem {
  id: string; // Composite unique key: `${productId}-${variationId || 0}-${attributesHash}`
  productId: number;
  variationId?: number;
  name: string;
  slug: string;
  sku?: string;
  price: number;
  regularPrice?: number;
  image: string;
  quantity: number;
  selectedAttributes?: Record<string, string>;
  stockStatus?: string;
}

export type ShippingLocation = "inside_dhaka" | "outside_dhaka";

export interface AppliedCoupon {
  code: string;
  discountPercent?: number;
  discountAmount?: number;
}

interface CartContextType {
  cart: CartItem[];
  cartCount: number;
  subtotal: number;
  discount: number;
  shippingCost: number;
  total: number;
  shippingLocation: ShippingLocation;
  setShippingLocation: (location: ShippingLocation) => void;
  freeShippingThreshold: number;
  isFreeShipping: boolean;
  freeShippingDiff: number;
  appliedCoupon: AppliedCoupon | null;
  addToCart: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, newQuantity: number) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "luxuryladies_cart_v1";
const FREE_SHIPPING_THRESHOLD = 3000;
const SHIPPING_RATES: Record<ShippingLocation, number> = {
  inside_dhaka: 60,
  outside_dhaka: 120,
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [shippingLocation, setShippingLocation] =
    useState<ShippingLocation>("inside_dhaka");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);

  // Load cart from localStorage on client mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setCart(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isInitialized) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.warn("Failed to persist cart to localStorage:", e);
    }
  }, [cart, isInitialized]);

  // Derived calculations
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const freeShippingDiff = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingCost = isFreeShipping || cart.length === 0 ? 0 : SHIPPING_RATES[shippingLocation];

  // Calculate discount
  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discountPercent) {
      discount = Math.round((subtotal * appliedCoupon.discountPercent) / 100);
    } else if (appliedCoupon.discountAmount) {
      discount = Math.min(subtotal, appliedCoupon.discountAmount);
    }
  }

  const total = Math.max(0, subtotal - discount + shippingCost);

  // Cart operations
  const addToCart = (
    item: Omit<CartItem, "quantity">,
    qtyToAdd: number = 1
  ) => {
    const quantity = Math.max(1, qtyToAdd);

    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((i) => i.id === item.id);
      if (existingIndex > -1) {
        const nextCart = [...prevCart];
        nextCart[existingIndex] = {
          ...nextCart[existingIndex],
          quantity: nextCart[existingIndex].quantity + quantity,
        };
        return nextCart;
      }
      return [...prevCart, { ...item, quantity }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (rawCode: string): { success: boolean; message: string } => {
    const code = rawCode.trim().toUpperCase();
    if (!code) {
      return { success: false, message: "Please enter a promo code." };
    }

    if (code === "LUXURY10") {
      setAppliedCoupon({ code, discountPercent: 10 });
      return { success: true, message: "Coupon applied! 10% discount added." };
    }

    if (code === "WELCOME200") {
      if (subtotal < 1000) {
        return {
          success: false,
          message: "WELCOME200 requires minimum order of Tk 1,000.",
        };
      }
      setAppliedCoupon({ code, discountAmount: 200 });
      return { success: true, message: "Coupon applied! Tk 200 discount added." };
    }

    if (code === "PINK15") {
      setAppliedCoupon({ code, discountPercent: 15 });
      return { success: true, message: "Coupon applied! 15% discount added." };
    }

    return {
      success: false,
      message: "Invalid or expired coupon code.",
    };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        cartCount,
        subtotal,
        discount,
        shippingCost,
        total,
        shippingLocation,
        setShippingLocation,
        freeShippingThreshold: FREE_SHIPPING_THRESHOLD,
        isFreeShipping,
        freeShippingDiff,
        appliedCoupon,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
