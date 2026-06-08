import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [], // { id, name, brand, image, pricePerDay, stock, quantity }

      addItem: (camera) => {
        const items = get().items
        const exists = items.find((i) => i.id === camera.id)
        if (exists) {
          // Already in cart, don't duplicate
          return false
        }
        set({
          items: [
            ...items,
            {
              id: camera.id,
              name: camera.name,
              brand: camera.brand,
              image: camera.images?.[0] || null,
              pricePerDay: camera.pricePerDay,
              stock: camera.stock,
              category: camera.category,
            },
          ],
        })
        return true
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i.id !== id) })
      },

      clearCart: () => set({ items: [] }),

      isInCart: (id) => get().items.some((i) => i.id === id),

      totalItems: () => get().items.length,
    }),
    {
      name: 'lensify-cart',
    }
  )
)

export default useCartStore
