import Link from 'next/link'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const NAV = [
    { href: '/admin',          icon: '📊', label: 'Dashboard' },
    { href: '/admin/products', icon: '📦', label: 'Products'  },
    { href: '/admin/orders',   icon: '🛒', label: 'Orders'    },
    { href: '/admin/team',     icon: '👥', label: 'Team'     },
    { href: '/admin/settings', icon: '⚙️', label: 'Settings' },
  ]

  return (
    <div className="min-h-screen flex bg-surface">
      <aside className="w-56 bg-[#1A1A1A] flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="block">
            <span className="font-extrabold text-white text-lg">
              Niks <span className="text-primary">Digital</span>
            </span>
            <span className="block text-2xs text-white/40 uppercase tracking-widest mt-0.5">
              Admin Panel
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors">
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
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
