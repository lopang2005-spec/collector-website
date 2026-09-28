"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  quantity: number;
  color: string | null;
  size: string | null;
  /** Label of the chosen price option (e.g. "Premium box"), or null. */
  option: string | null;
  availability: "in_stock" | "by_order";
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (
    id: string,
    color: string | null,
    size: string | null,
    option: string | null
  ) => void;
  updateQuantity: (
    id: string,
    color: string | null,
    size: string | null,
    option: string | null,
    quantity: number
  ) => void;
  clearCart: () => void;
  total: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);
const STORAGE_KEY = "tc_cart_v1";

type LineKey = {
  id: string;
  color: string | null;
  size: string | null;
  option?: string | null;
};

// Carts saved before v18 have no "option" field, so treat missing as null.
function sameLine(a: LineKey, b: LineKey) {
  return (
    a.id === b.id &&
    a.color === b.color &&
    a.size === b.size &&
    (a.option ?? null) === (b.option ?? null)
  );
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setItems(JSON.parse(stored));
      } catch {
        // Corrupt cart data — start fresh rather than crash the page.
      }
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, hydrated]);

  function addItem(item: Omit<CartItem, "quantity">, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item));
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item) ? { ...i, quantity: i.quantity + quantity } : i
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }

  function removeItem(
    id: string,
    color: string | null,
    size: string | null,
    option: string | null
  ) {
    setItems((prev) =>
      prev.filter((i) => !sameLine(i, { id, color, size, option }))
    );
  }

  function updateQuantity(
    id: string,
    color: string | null,
    size: string | null,
    option: string | null,
    quantity: number
  ) {
    if (quantity <= 0) {
      removeItem(id, color, size, option);
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        sameLine(i, { id, color, size, option }) ? { ...i, quantity } : i
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
