import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { ProductSummary } from '@/types'

interface WishlistState {
  items: ProductSummary[]
  addItem:    (product: ProductSummary) => void
  removeItem: (id: string) => void
  isWishlisted: (id: string) => boolean
  clear: () => void
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product) => {
        if (get().isWishlisted(product.id)) return
        set(s => ({ items: [...s.items, product] }))
      },
      removeItem: (id) => set(s => ({ items: s.items.filter(i => i.id !== id) })),
      isWishlisted: (id) => get().items.some(i => i.id === id),
      clear: () => set({ items: [] }),
    }),
    {
      name: 'niks-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)