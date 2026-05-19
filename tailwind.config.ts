import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // ── COLORS ──────────────────────────────────────────────
      colors: {
        primary: {
          DEFAULT: '#FF6200',
          50:  '#FFF3EC',
          100: '#FFE4CC',
          200: '#FFC999',
          300: '#FFAD66',
          400: '#FF9233',
          500: '#FF6200',   // ← brand orange
          600: '#CC4E00',
          700: '#993B00',
          800: '#662700',
          900: '#331400',
        },
        dark: {
          DEFAULT: '#1A1A2E',
          50:  '#F0F0F4',
          100: '#D1D1DF',
          200: '#A3A3BE',
          300: '#75759E',
          400: '#47477D',
          500: '#1A1A2E',   // ← main text
          600: '#15152A',
          700: '#101025',
          800: '#0B0B1F',
          900: '#05051A',
        },
        muted: '#6B7280',
        border: '#E5E7EB',
        surface: '#F9FAFB',
        success: '#16A34A',
        warning: '#D97706',
        danger:  '#DC2626',
        info:    '#2563EB',
        // M-Pesa green
        mpesa:  '#00A651',
        whatsapp: '#25D366',
      },

      // ── TYPOGRAPHY ──────────────────────────────────────────
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        '2xs': ['10px', { lineHeight: '14px' }],
        'xs':  ['12px', { lineHeight: '16px' }],
        'sm':  ['13px', { lineHeight: '18px' }],
        'base': ['15px', { lineHeight: '22px' }],
        'md':  ['16px', { lineHeight: '24px' }],
        'lg':  ['18px', { lineHeight: '28px' }],
        'xl':  ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['28px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '44px' }],
        '5xl': ['48px', { lineHeight: '56px' }],
        '6xl': ['56px', { lineHeight: '64px' }],
      },
      fontWeight: {
        normal:    '400',
        medium:    '500',
        semibold:  '600',
        bold:      '700',
        extrabold: '800',
      },

      // ── SPACING ─────────────────────────────────────────────
      // Using Tailwind defaults (4px base). Key custom values:
      spacing: {
        '4.5':  '18px',
        '13':   '52px',
        '15':   '60px',
        '17':   '68px',
        '18':   '72px',
        '22':   '88px',
        '26':   '104px',
        '30':   '120px',
      },

      // ── BORDER RADIUS ───────────────────────────────────────
      borderRadius: {
        'none':  '0',
        'sm':    '4px',
        'DEFAULT': '8px',
        'md':    '10px',
        'lg':    '12px',
        'xl':    '16px',
        '2xl':   '20px',
        'full':  '9999px',
      },

      // ── SHADOWS ─────────────────────────────────────────────
      boxShadow: {
        'card':       '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 2px 4px rgba(0,0,0,0.04)',
        'dropdown':   '0 8px 24px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06)',
        'modal':      '0 20px 60px rgba(0,0,0,0.15)',
        'drawer':     '-4px 0 24px rgba(0,0,0,0.10)',
        'toast':      '0 8px 24px rgba(0,0,0,0.12)',
        'btn-primary': '0 4px 12px rgba(255,98,0,0.30)',
        'none':       'none',
      },

      // ── MAX WIDTHS ──────────────────────────────────────────
      maxWidth: {
        'site':    '1280px',
        'content': '720px',
        'xs':      '320px',
        'sm':      '480px',
        'md':      '640px',
        'lg':      '768px',
        'xl':      '1024px',
        '2xl':     '1280px',
      },

      // ── Z-INDEX ─────────────────────────────────────────────
      zIndex: {
        'base':    '0',
        'above':   '10',
        'sticky':  '40',
        'dropdown': '50',
        'overlay': '60',
        'drawer':  '70',
        'modal':   '80',
        'toast':   '90',
      },

      // ── TRANSITIONS ─────────────────────────────────────────
      transitionDuration: {
        'fast':   '150ms',
        'normal': '200ms',
        'slow':   '300ms',
        'slower': '400ms',
      },
      transitionTimingFunction: {
        'smooth': 'cubic-bezier(0.4, 0, 0.2, 1)',
        'bounce-in': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      },

      // ── ANIMATION ───────────────────────────────────────────
      keyframes: {
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in-fast': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-left': {
          '0%':   { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-up': {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        'shimmer': {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'pulse-dot': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%':      { transform: 'scale(1.4)', opacity: '0.6' },
        },
        'spin-slow': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
      },
      animation: {
        'fade-in':        'fade-in 0.4s ease forwards',
        'fade-in-fast':   'fade-in-fast 0.2s ease forwards',
        'slide-in-right': 'slide-in-right 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-in-left':  'slide-in-left 0.3s cubic-bezier(0.4,0,0.2,1) forwards',
        'slide-up':       'slide-up 0.4s ease forwards',
        'shimmer':        'shimmer 1.4s ease-in-out infinite',
        'pulse-dot':      'pulse-dot 1.8s ease-in-out infinite',
        'spin-slow':      'spin-slow 1.2s linear infinite',
      },

      // ── SCREENS (mobile-first) ──────────────────────────────
      screens: {
        'xs':  '380px',
        'sm':  '640px',
        'md':  '768px',
        'lg':  '1024px',
        'xl':  '1280px',
        '2xl': '1536px',
      },
    },
  },
  plugins: [
    // Custom utilities plugin
    function ({ addUtilities, addComponents, theme }: any) {
      // Line clamp utilities
      addUtilities({
        '.line-clamp-1': { overflow: 'hidden', display: '-webkit-box', '-webkit-line-clamp': '1', '-webkit-box-orient': 'vertical' },
        '.line-clamp-2': { overflow: 'hidden', display: '-webkit-box', '-webkit-line-clamp': '2', '-webkit-box-orient': 'vertical' },
        '.line-clamp-3': { overflow: 'hidden', display: '-webkit-box', '-webkit-line-clamp': '3', '-webkit-box-orient': 'vertical' },
        // Shimmer skeleton base
        '.skeleton': {
          background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
          backgroundSize: '400px 100%',
          animation: 'shimmer 1.4s ease-in-out infinite',
          borderRadius: '4px',
        },
        // Scrollbar hide
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
        // Focus ring consistent with brand
        '.focus-ring': {
          '&:focus-visible': {
            outline: `2px solid ${theme('colors.primary.DEFAULT')}`,
            outlineOffset: '2px',
          },
        },
      })

      // Reusable component classes
      addComponents({
        // Container
        '.container-site': {
          width: '100%',
          maxWidth: '1280px',
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingLeft: '16px',
          paddingRight: '16px',
          '@screen sm': { paddingLeft: '24px', paddingRight: '24px' },
          '@screen lg': { paddingLeft: '32px', paddingRight: '32px' },
        },
        // Section spacing
        '.section-padding': {
          paddingTop: '64px',
          paddingBottom: '64px',
          '@screen lg': { paddingTop: '96px', paddingBottom: '96px' },
        },
        // Product card base
        '.product-card-base': {
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '8px',
          overflow: 'hidden',
          transition: 'box-shadow 200ms ease, border-color 200ms ease, transform 200ms ease',
          cursor: 'pointer',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            borderColor: '#D1D5DB',
            transform: 'translateY(-2px)',
          },
        },
        // Input bottom-border style
        '.input-underline': {
          backgroundColor: 'transparent',
          borderBottom: '1.5px solid #E5E7EB',
          borderRadius: '0',
          padding: '8px 0',
          width: '100%',
          outline: 'none',
          transition: 'border-color 200ms ease',
          '&:focus': { borderColor: '#FF6200' },
        },
      })
    },
  ],
}

export default config
