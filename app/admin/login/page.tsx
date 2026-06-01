'use client'

import { useState } from 'react'
import { supabaseBrowser } from '@/lib/supabase'

export default function AdminLoginPage() {
  const [email,   setEmail]   = useState('')
  const [password,setPass]    = useState('')
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)

  // Show error from middleware redirect
  const urlError = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('error')
    : null

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { error: authErr } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    })

    if (authErr) {
      setError('Invalid email or password')
      setLoading(false)
      return
    }

    // Sign in succeeded — navigate hard to /admin
    // Middleware will verify admin role and redirect back to login if not admin
    window.location.href = '/admin'
  }

  return (
    <div className="min-h-screen bg-[#1A1A1A] flex items-center justify-center p-4">
      <div className="bg-white rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-extrabold text-xl text-dark">
            Niks <span className="text-primary">Digital</span>
          </span>
          <p className="text-xs text-muted mt-1 uppercase tracking-widest">Admin Login</p>
        </div>

        {urlError === 'unauthorized' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
            <p className="text-xs text-danger font-medium text-center">
              This account does not have admin access.
            </p>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              placeholder="your@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPass(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
            />
          </div>

          {error && (
            <p className="text-xs text-danger bg-red-50 rounded-lg p-3 text-center">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2"
          >
            {loading
              ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Signing in…</>
              : 'Sign In'
            }
          </button>
        </form>
      </div>
    </div>
  )
}