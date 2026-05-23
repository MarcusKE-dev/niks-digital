// ════════════════════════════════════════════════════════════
// CART STORE 
// ════════════════════════════════════════════════════════════

import { create }        from 'zustand'
import { persist,
         createJSONStorage } from 'zustand/middleware'
import type { CartItem, CartState, Product, ProductSummary } from '@/types'
import { FREE_DELIVERY_THRESHOLD, DELIVERY_AREAS }            from '@/types'

// Default delivery fee when no area is selected (KES)
const DEFAULT_DELIVERY_FEE = 300

// ── STORE ────────────────────────────────────────────────────

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      // ── ACTIONS ────────────────────────────────────────────

      /**
       * Add a product to the cart, or increment its quantity.
       * Respects stock_qty limit.
       */
      addItem: (product: Product | ProductSummary, qty = 1) => {
        set(state => {
          const existing = state.items.find(item => item.id === product.id)

          if (existing) {
            // Already in cart — increment quantity (up to stock limit)
            const newQty = Math.min(
              existing.qty + qty,
              product.stock_qty
            )
            return {
              items: state.items.map(item =>
                item.id === product.id
                  ? { ...item, qty: newQty }
                  : item
              ),
            }
          }

          // New item — add to cart
          const newItem: CartItem = {
            id:        product.id,
            name:      product.name,
            slug:      product.slug,
            thumbnail: product.thumbnail,
            price:     product.price,
            qty:       Math.min(qty, product.stock_qty),
            stock_qty: product.stock_qty,
            brand:     product.brand,
          }

          return { items: [...state.items, newItem] }
        })
      },

      /**
       * Remove an item from the cart entirely.
       */
      removeItem: (productId: string) => {
        set(state => ({
          items: state.items.filter(item => item.id !== productId),
        }))
      },

      /**
       * Update the quantity of a cart item.
       * Setting qty to 0 removes the item.
       */
      updateQty: (productId: string, qty: number) => {
        if (qty <= 0) {
          get().removeItem(productId)
          return
        }

        set(state => ({
          items: state.items.map(item =>
            item.id === productId
              ? { ...item, qty: Math.min(qty, item.stock_qty) }
              : item
          ),
        }))
      },

      /**
       * Remove all items from the cart.
       * Called after a successful order.
       */
      clearCart: () => set({ items: [] }),

      // ── COMPUTED ───────────────────────────────────────────

      /**
       * Total number of items (sum of all quantities).
       */
      totalItems: () => {
        return get().items.reduce((sum, item) => sum + item.qty, 0)
      },

      /**
       * Cart subtotal in KES (before delivery fee).
       */
      subtotal: () => {
        return get().items.reduce(
          (sum, item) => sum + item.price * item.qty,
          0
        )
      },

      /**
       * Delivery fee. Returns 0 if subtotal qualifies for free delivery.
       * Otherwise returns the default fee (area-specific fee is applied
       * at checkout when the customer selects their delivery area).
       */
      deliveryFee: () => 0,

      total: () => {
        return get().subtotal() + get().deliveryFee()
      },
    }),

    // ── PERSISTENCE CONFIG ─────────────────────────────────
    {
      name: 'niks-digital-cart',   // localStorage key
      storage: createJSONStorage(() => localStorage),

      // Only persist the items array (not computed functions)
      partialize: (state) => ({ items: state.items }),

      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Filter out any items that no longer have stock
        // (basic safeguard; full validation happens at checkout)
        state.items = state.items.filter(item => item.stock_qty > 0)
      },
    }
  )
)

// ── SELECTOR HOOKS ───────────────────────────────────────────

/** Is a specific product in the cart? */
export const useIsInCart = (productId: string) =>
  useCartStore(state => state.items.some(item => item.id === productId))

/** Get the quantity of a specific product in the cart. */
export const useCartQty = (productId: string) =>
  useCartStore(state =>
    state.items.find(item => item.id === productId)?.qty ?? 0
  )

/** Total number of items (for nav badge). */
export const useCartCount = () =>
  useCartStore(state => state.items.reduce((s, i) => s + i.qty, 0))

/** Cart subtotal. */
export const useCartSubtotal = () =>
  useCartStore(state => state.items.reduce((s, i) => s + i.price * i.qty, 0))
