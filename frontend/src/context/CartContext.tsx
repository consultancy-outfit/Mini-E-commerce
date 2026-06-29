'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface CartProduct {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
  stock: number;
  category: string;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  product: CartProduct;
}

export interface Cart {
  id: string | null;
  items: CartItem[];
  total: string;
  itemCount: number;
}

interface CartContextValue {
  cart: Cart;
  isOpen: boolean;
  loading: boolean;
  cartReady: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  updateItem: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearCart: () => Promise<void>;
}

const EMPTY_CART: Cart = { id: null, items: [], total: '0.00', itemCount: 0 };

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuth();
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cartReady, setCartReady] = useState(false);

  const refreshCart = useCallback(async () => {
    if (!token) {
      setCart(EMPTY_CART);
      setCartReady(true);
      return;
    }
    try {
      const data = await apiFetch<Cart>('/cart', { token });
      setCart(data);
    } catch {
      setCart(EMPTY_CART);
    } finally {
      setCartReady(true);
    }
  }, [token]);

  useEffect(() => {
    setCartReady(false);
    if (user && token) {
      refreshCart();
    } else {
      setCart(EMPTY_CART);
      setCartReady(true);
    }
  }, [user, token, refreshCart]);

  async function addItem(productId: string, quantity = 1) {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<Cart>('/cart/items', {
        method: 'POST',
        body: { productId, quantity },
        token,
      });
      setCart(data);
      setIsOpen(true);
    } finally {
      setLoading(false);
    }
  }

  async function updateItem(productId: string, quantity: number) {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<Cart>(`/cart/items/${productId}`, {
        method: 'PATCH',
        body: { quantity },
        token,
      });
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  async function removeItem(productId: string) {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<Cart>(`/cart/items/${productId}`, {
        method: 'DELETE',
        token,
      });
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  async function clearCart() {
    if (!token) return;
    setLoading(true);
    try {
      const data = await apiFetch<Cart>('/cart', { method: 'DELETE', token });
      setCart(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        isOpen,
        loading,
        cartReady,
        openCart: () => setIsOpen(true),
        closeCart: () => setIsOpen(false),
        addItem,
        updateItem,
        removeItem,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside <CartProvider>');
  return ctx;
}
