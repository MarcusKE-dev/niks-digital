'use client'

import { useEffect, useRef } from 'react'

interface Props {
  isOpen:    boolean
  title:     string
  message:   string
  confirmLabel?: string
  cancelLabel?:  string
  variant?:  'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel:  () => void
}

export function ConfirmDialog({
  isOpen, title, message,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  variant      = 'danger',
  onConfirm, onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (isOpen) confirmRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [isOpen, onCancel])

  if (!isOpen) return null

  const ICONS    = { danger: '🗑', warning: '⚠️', info: 'ℹ️' }
  const COLORS   = {
    danger:  'bg-red-50 text-danger border-red-100',
    warning: 'bg-orange-50 text-orange-600 border-orange-100',
    info:    'bg-blue-50 text-blue-600 border-blue-100',
  }
  const BTN_COLORS = {
    danger:  'bg-danger hover:bg-red-700 text-white',
    warning: 'bg-orange-500 hover:bg-orange-600 text-white',
    info:    'bg-primary hover:bg-primary-600 text-white',
  }

  return (
    <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />

      {/* Dialog */}
      <div className="relative bg-white rounded-2xl shadow-modal w-full max-w-sm p-6 animate-slide-up">

        {/* Icon */}
        <div className={`w-12 h-12 rounded-full border flex items-center justify-center text-2xl mx-auto mb-4 ${COLORS[variant]}`}>
          {ICONS[variant]}
        </div>

        {/* Content */}
        <h3 className="text-lg font-extrabold text-dark text-center mb-2">{title}</h3>
        <p className="text-sm text-muted text-center leading-relaxed mb-6">{message}</p>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 h-11 border border-border rounded-full text-sm font-semibold text-dark hover:bg-surface transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmRef}
            onClick={onConfirm}
            className={`flex-1 h-11 rounded-full text-sm font-semibold transition-colors ${BTN_COLORS[variant]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}