'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/store/cartStore'

export function ClearCart() {
  const router    = useRouter()
  const clearCart = useCartStore(s => s.clearCart)

  useEffect(() => {
    // Clear the cart
    clearCart()

    // Push current page onto history stack twice so
    // pressing back goes home instead of cart/checkout
    window.history.pushState(null, '', window.location.href)

    const handleBack = () => {
      router.replace('/')
    }

    window.addEventListener('popstate', handleBack)
    return () => window.removeEventListener('popstate', handleBack)
  }, [])

  return null
}