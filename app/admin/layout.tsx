import { redirect }           from 'next/navigation'
import Link                   from 'next/link'
import { createSupabaseServer } from '@/lib/supabase-server'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const NAV = [
    { href: '/admin',          icon: '📊', label: 'Dashboard'  },
    { href: '/admin/products', icon: '📦', label: 'Products'   },
    { href: '/admin/orders',   icon: '🛒', label: 'Orders'     },
  ]

  return (
    <div className="min-h-screen flex bg-surface">
      {/* Sidebar */}
      <aside className="w-56 bg-dark-500 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="block">
            <span className="font-extrabold text-white text-lg">Niks <span className="text-primary">Digital</span></span>
            <span className="block text-2xs text-white/40 uppercase tracking-widest mt-0.5">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-1" aria-label="Admin navigation">
          {NAV.map(n => (
            <Link key={n.href} href={n.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:text-white hover:bg-white/8 transition-colors">
              <span aria-hidden>{n.icon}</span>{n.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="text-xs text-white/30 mb-2 truncate">{user.email}</p>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className="text-xs text-white/40 hover:text-white transition-colors">Sign out →</button>
          </form>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
