'use client'

// ════════════════════════════════════════════════════════════
// TOASTER — Global toast notification system
// Lives in the root layout. Toasts are triggered via the
// useToast hook from anywhere in the app.
// ════════════════════════════════════════════════════════════

import { useEffect, useState, useCallback } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Toast, ToastType } from '@/types'
import { generateId } from '@/lib/utils'

// ── TOAST STORE (simple pub/sub — no Zustand needed) ─────────

type ToastListener = (toasts: Toast[]) => void

class ToastStore {
  private toasts:    Toast[]        = []
  private listeners: ToastListener[] = []

  subscribe(listener: ToastListener) {
    this.listeners.push(listener)
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(l => l([...this.toasts]))
  }

  add(toast: Omit<Toast, 'id'>) {
    const id = generateId()
    const newToast: Toast = { id, duration: 3500, ...toast }
    this.toasts = [...this.toasts, newToast]
    this.notify()

    // Auto-dismiss
    setTimeout(() => this.remove(id), newToast.duration)
  }

  remove(id: string) {
    this.toasts = this.toasts.filter(t => t.id !== id)
    this.notify()
  }
}

export const toastStore = new ToastStore()

// ── useToast HOOK ─────────────────────────────────────────────
// Import and use anywhere in the app:
//   const toast = useToast()
//   toast.success('Added to cart!')
//   toast.error('Something went wrong')

export function useToast() {
  const add = useCallback((toast: Omit<Toast, 'id'>) => {
    toastStore.add(toast)
  }, [])

  return {
    success: (message: string, duration?: number) =>
      add({ type: 'success', message, duration }),
    error:   (message: string, duration?: number) =>
      add({ type: 'error', message, duration: duration ?? 5000 }),
    info:    (message: string, duration?: number) =>
      add({ type: 'info', message, duration }),
    warning: (message: string, duration?: number) =>
      add({ type: 'warning', message, duration }),
  }
}

// ── TOAST ICON ───────────────────────────────────────────────

const ICONS: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={18} className="text-success flex-shrink-0" />,
  error:   <XCircle     size={18} className="text-danger flex-shrink-0" />,
  warning: <AlertTriangle size={18} className="text-warning flex-shrink-0" />,
  info:    <Info        size={18} className="text-info flex-shrink-0" />,
}

const BORDER_COLORS: Record<ToastType, string> = {
  success: 'border-l-success',
  error:   'border-l-danger',
  warning: 'border-l-warning',
  info:    'border-l-info',
}

// ── SINGLE TOAST ─────────────────────────────────────────────

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast
  onRemove: (id: string) => void
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Animate in
    const t = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(t)
  }, [])

  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        'flex items-start gap-3 w-full max-w-sm',
        'bg-white border border-border border-l-4',
        'rounded-lg shadow-toast px-4 py-3',
        'transition-all duration-300 ease-smooth',
        BORDER_COLORS[toast.type],
        visible
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2'
      )}
    >
      {/* Icon */}
      <div className="mt-0.5">
        {ICONS[toast.type]}
      </div>

      {/* Message */}
      <p className="flex-1 text-sm text-dark leading-snug">
        {toast.message}
      </p>

      {/* Dismiss */}
      <button
        onClick={() => onRemove(toast.id)}
        className="mt-0.5 text-muted hover:text-dark transition-colors flex-shrink-0"
        aria-label="Dismiss notification"
      >
        <X size={15} />
      </button>
    </div>
  )
}

// ── TOASTER ──────────────────────────────────────────────────

export function Toaster() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    return toastStore.subscribe(setToasts)
  }, [])

  const removeToast = useCallback((id: string) => {
    toastStore.remove(id)
  }, [])

  if (toasts.length === 0) return null

  return (
    // Fixed bottom-right on desktop, bottom-center on mobile
    <div
      aria-label="Notifications"
      className={cn(
        'fixed z-toast',
        'bottom-5 right-5',
        'flex flex-col gap-2 items-end',
        'xs:right-5',
        // Mobile: center align
        'max-xs:right-4 max-xs:left-4 max-xs:items-stretch'
      )}
    >
      {toasts.map(toast => (
        <ToastItem
          key={toast.id}
          toast={toast}
          onRemove={removeToast}
        />
      ))}
    </div>
  )
}
