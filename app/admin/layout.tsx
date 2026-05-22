'use client'
import { useState }  from 'react'
import Link          from 'next/link'
import { usePathname } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const NAV = [
    { href: '/admin',          icon: '📊', label: 'Dashboard'  },
    { href: '/admin/products', icon: '📦', label: 'Products'   },
    { href: '/admin/orders',   icon: '🛒', label: 'Orders'     },
    { href: '/admin/settings', icon: '⚙️', label: 'Settings'   },
    { href: '/admin/team',     icon: '👥', label: 'Team'       },
  ]

  return (
    <div className="min-h-screen flex bg-surface">

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 bottom-0 z-50 w-56 bg-[#1A1A1A] flex flex-col transition-transform duration-300
        lg:static lg:translate-x-0
        ${open ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)}>
            <span className="font-extrabold text-white text-lg">
              Niks <span className="text-primary">Digital</span>
            </span>
            <span className="block text-2xs text-white/40 uppercase tracking-widest mt-0.5">Admin</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden text-white/60 hover:text-white text-xl">✕</button>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === n.href
                  ? 'bg-primary text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}>
              <span>{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-xs text-white/40 hover:text-white transition-colors">
              Sign out →
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-border">
          <button onClick={() => setOpen(true)}
            className="flex flex-col gap-1 w-8 h-8 items-center justify-center"
            aria-label="Open menu">
            <span className="w-5 h-0.5 bg-dark block" />
            <span className="w-5 h-0.5 bg-dark block" />
            <span className="w-5 h-0.5 bg-dark block" />
          </button>
          <span className="font-bold text-dark text-sm">Admin Panel</span>
        </div>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}