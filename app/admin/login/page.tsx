'use client'

import { Suspense, useState } from 'react'
import { useSearchParams } from 'next/navigation'

/**
 * Only ever follow a redirect back into this site's admin area.
 * `redirectTo` arrives in the query string, so without this check a
 * crafted link could bounce a freshly signed-in admin to another site.
 */
function safeRedirect(value: string | null): string {
  if (!value) return '/admin'
  if (!value.startsWith('/admin')) return '/admin'
  // `//evil.com` and `/\evil.com` are read as protocol-relative URLs.
  if (value.startsWith('//') || value.startsWith('/\\')) return '/admin'
  return value
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPass] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const forbidden = searchParams.get('error') === 'forbidden'

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      // Goes through the server so the attempt is rate limited and the
      // admin check happens before any session is handed back.
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.error ?? 'Invalid email or password')
        setLoading(false)
        return
      }

      // Full navigation so the middleware sees the new session cookie.
      window.location.href = safeRedirect(searchParams.get('redirectTo'))
    } catch {
      setError('Could not reach the server. Check your connection and try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-border p-8 w-full max-w-sm">
      <div className="text-center mb-8">
        <span className="font-extrabold text-xl text-dark">
          Niks <span className="text-primary">Digital</span>
        </span>
        <p className="text-xs text-muted mt-1 uppercase tracking-widest">Admin Login</p>
      </div>

      {forbidden && !error && (
        <p className="text-xs text-danger bg-red-50 rounded-lg p-3 mb-5">
          That account does not have admin access.
        </p>
      )}

      <form onSubmit={handleLogin} className="space-y-5">
        <div>
          <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Email
          </label>
          <input
            id="admin-email"
            name="email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoComplete="username"
            className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            placeholder="your@email.com"
          />
        </div>
        <div>
          <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
            Password
          </label>
          <input
            id="admin-password"
            name="password"
            type="password"
            value={password}
            onChange={e => setPass(e.target.value)}
            required
            autoComplete="current-password"
            className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
          />
        </div>

        {error && <p className="text-xs text-danger bg-red-50 rounded-lg p-3">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Signing in…
            </>
          ) : (
            'Sign In'
          )}
        </button>
      </form>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <Suspense fallback={<div className="text-white/60 text-sm">Loading…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
