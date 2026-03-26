import { create } from 'zustand';

const loadCart = () => { try { return JSON.parse(localStorage.getItem('jothi_cart')) || []; } catch { return []; } };
const saveCart = (cart) => localStorage.setItem('jothi_cart', JSON.stringify(cart));

const useCartStore = create((set, get) => ({
  items: loadCart(),

  addItem: (product, quantity = 1) => {
    const items = get().items;
    const existing = items.find(i => i._id === product._id);
    const updated = existing
      ? items.map(i => i._id === product._id ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) } : i)
      : [...items, { ...product, quantity }];
    saveCart(updated);
    set({ items: updated });
  },

  removeItem: (id) => { const u = get().items.filter(i => i._id !== id); saveCart(u); set({ items: u }); },

  updateQuantity: (id, qty) => {
    if (qty < 1) { get().removeItem(id); return; }
    const u = get().items.map(i => i._id === id ? { ...i, quantity: qty } : i);
    saveCart(u); set({ items: u });
  },

  clearCart: () => { saveCart([]); set({ items: [] }); },
  getCount: () => get().items.reduce((s, i) => s + i.quantity, 0),
  getSubtotal: () => get().items.reduce((s, i) => s + i.price * i.quantity, 0),
  getShipping: () => get().getSubtotal() > 10000 ? 0 : 500,
  getGrandTotal: () => get().getSubtotal() + get().getShipping(),
}));

export default useCartStore;
