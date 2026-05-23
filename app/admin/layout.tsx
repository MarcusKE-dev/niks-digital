'use client'

import { useState, useEffect } from 'react'
import Link                    from 'next/link'
import { usePathname }         from 'next/navigation'

const NAV = [
  { href: '/admin',          icon: '📊', label: 'Dashboard'  },
  { href: '/admin/products', icon: '📦', label: 'Products'   },
  { href: '/admin/orders',   icon: '🛒', label: 'Orders'     },
  { href: '/admin/settings', icon: '⚙️', label: 'Settings'   },
  { href: '/admin/team',     icon: '👥', label: 'Team'       },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open,    setOpen]    = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setMounted(true) }, [])

  // Close drawer on route change
  useEffect(() => { setOpen(false) }, [pathname])

  return (
    <div className="min-h-screen flex bg-[#F5F5F5]">

      {/* Mobile overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-56 bg-[#1A1A1A]
        flex flex-col transition-transform duration-300 ease-smooth
        lg:static lg:translate-x-0 lg:flex-shrink-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" className="block">
            <span className="font-extrabold text-white text-lg">
              Niks <span className="text-primary">Digital</span>
            </span>
            <span className="block text-2xs text-white/40 uppercase tracking-widest mt-0.5">
              Admin
            </span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="lg:hidden text-white/50 hover:text-white text-xl w-8 h-8 flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => {
            const isActive = mounted && (
              n.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(n.href)
            )
            return (
              <Link
                key={n.href}
                href={n.href}
                prefetch={true}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-fast ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
              >
                <span className="text-base">{n.icon}</span>
                {n.label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="block text-xs text-white/40 hover:text-white mb-2 transition-colors">
            ← View Shop
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-xs text-white/40 hover:text-white transition-colors">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-border sticky top-0 z-30">
          <button
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            className="flex flex-col gap-1.5 w-9 h-9 items-center justify-center rounded-lg hover:bg-surface transition-colors"
          >
            <span className="w-5 h-0.5 bg-dark rounded-full block" />
            <span className="w-5 h-0.5 bg-dark rounded-full block" />
            <span className="w-5 h-0.5 bg-dark rounded-full block" />
          </button>
          <span className="font-bold text-dark text-sm">
            {NAV.find(n =>
              n.href === '/admin'
                ? pathname === '/admin'
                : pathname.startsWith(n.href)
            )?.label ?? 'Admin Panel'}
          </span>
        </div>

        <main className="flex-1 overflow-auto bg-[#F5F5F5]">
          {children}
        </main>
      </div>
    </div>
  )
}