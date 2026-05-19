'use client'

// ════════════════════════════════════════════════════════════
// BUTTON COMPONENT
// Single source of truth for all buttons in the app.
// Variants: primary | secondary | outline | ghost | danger
// Sizes: sm | md | lg
// ════════════════════════════════════════════════════════════

import { forwardRef } from 'react'
import { Loader2 }    from 'lucide-react'
import { cn }         from '@/lib/utils'

// ── TYPES ─────────────────────────────────────────────────────

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'whatsapp'
type ButtonSize    = 'xs' | 'sm' | 'md' | 'lg'

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:   ButtonVariant
  size?:      ButtonSize
  loading?:   boolean
  icon?:      React.ReactNode   // icon on the left
  iconRight?: React.ReactNode   // icon on the right
  fullWidth?: boolean
  pill?:      boolean           // extra-rounded corners
}

// ── STYLE MAPS ────────────────────────────────────────────────

const BASE =
  'inline-flex items-center justify-center gap-2 font-semibold ' +
  'transition-all duration-normal ease-smooth select-none ' +
  'focus-visible:outline-none focus-visible:ring-2 ' +
  'focus-visible:ring-primary focus-visible:ring-offset-2 ' +
  'disabled:cursor-not-allowed disabled:opacity-50 ' +
  'active:scale-[0.98]'

const VARIANTS: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-white hover:bg-primary-600 ' +
    'shadow-btn-primary hover:shadow-none',

  secondary:
    'bg-dark text-white hover:bg-dark-400',

  outline:
    'bg-white text-dark border border-border ' +
    'hover:border-primary hover:text-primary',

  ghost:
    'bg-transparent text-dark hover:bg-gray-100',

  danger:
    'bg-danger text-white hover:bg-red-700',

  whatsapp:
    'bg-whatsapp text-white hover:bg-green-600 ' +
    'shadow-[0_4px_12px_rgba(37,211,102,0.30)] hover:shadow-none',
}

const SIZES: Record<ButtonSize, string> = {
  xs: 'h-7  px-3   text-xs  gap-1.5',
  sm: 'h-9  px-4   text-sm  gap-1.5',
  md: 'h-11 px-5   text-base gap-2',
  lg: 'h-12 px-6   text-md  gap-2',
}

// ── COMPONENT ─────────────────────────────────────────────────

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant   = 'primary',
      size      = 'md',
      loading   = false,
      icon,
      iconRight,
      fullWidth = false,
      pill      = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          BASE,
          VARIANTS[variant],
          SIZES[size],
          pill       ? 'rounded-full' : 'rounded-lg',
          fullWidth  ? 'w-full'       : '',
          className
        )}
        {...props}
      >
        {/* Left icon or loading spinner */}
        {loading ? (
          <Loader2
            size={size === 'xs' || size === 'sm' ? 14 : 16}
            className="animate-spin"
            aria-hidden
          />
        ) : icon ? (
          <span className="flex-shrink-0" aria-hidden>
            {icon}
          </span>
        ) : null}

        {/* Label */}
        {children && <span>{children}</span>}

        {/* Right icon */}
        {!loading && iconRight && (
          <span className="flex-shrink-0" aria-hidden>
            {iconRight}
          </span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

// ── ICON BUTTON ───────────────────────────────────────────────
// Square/circular button with only an icon. No text.

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:  ButtonVariant
  size?:     ButtonSize
  label:     string          // aria-label (required for accessibility)
  pill?:     boolean
  loading?:  boolean
}

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      variant  = 'ghost',
      size     = 'md',
      label,
      pill     = false,
      loading  = false,
      className,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const SIZE_SQUARE: Record<ButtonSize, string> = {
      xs: 'h-7  w-7',
      sm: 'h-9  w-9',
      md: 'h-10 w-10',
      lg: 'h-12 w-12',
    }

    return (
      <button
        ref={ref}
        aria-label={label}
        disabled={disabled || loading}
        className={cn(
          BASE,
          VARIANTS[variant],
          SIZE_SQUARE[size],
          pill ? 'rounded-full' : 'rounded-lg',
          'p-0',
          className
        )}
        {...props}
      >
        {loading
          ? <Loader2 size={16} className="animate-spin" aria-hidden />
          : children
        }
      </button>
    )
  }
)

IconButton.displayName = 'IconButton'
