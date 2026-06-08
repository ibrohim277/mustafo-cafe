import { create } from "zustand";
import { persist } from "zustand/middleware";

// Mahsulot strukturasi
interface CartItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

// Store interfeysiga yangi funksiyalarni e'lon qilamiz
interface Store {
  cart: CartItem[];
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  addToCart: (
    product: Omit<CartItem, "quantity"> & { quantity?: number },
  ) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      cart: [],
      isOpen: false,

      // Savat panelini ochish/yopish
      setIsOpen: (value) => set({ isOpen: value }),

      // Savatga mahsulot qo'shish
      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find((item) => item.id === product.id);

        if (existing) {
          set({
            cart: cart.map((item) =>
              item.id === product.id
                ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                : item,
            ),
          });
        } else {
          set({
            cart: [
              ...cart,
              { ...product, quantity: product.quantity || 1 } as CartItem,
            ],
          });
        }
      },

      // Mahsulot miqdorini yangilash (Counter uchun)
      updateQuantity: (id, quantity) => {
        set({
          cart: get().cart.map((item) =>
            item.id === id ? { ...item, quantity: quantity } : item,
          ),
        });
      },

      // Mahsulotni savatdan butunlay o'chirish
      removeFromCart: (id) => {
        set({
          cart: get().cart.filter((item) => item.id !== id),
        });
      },

      // Buyurtma bergandan keyin savatni tozalash
      clearCart: () => {
        set({ cart: [] });
      },
    }),
    {
      name: "iphone-store-cart", // LocalStorage kalit nomi
    },
  ),
);
