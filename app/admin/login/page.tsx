'use client'

import { useState }         from 'react'
import { useRouter }        from 'next/navigation'
import { supabaseBrowser } from '@/lib/supabase'
import { cn }               from '@/lib/utils'

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail]     = useState('')
  const [password, setPass]   = useState('')
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabaseBrowser.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.replace('/admin')
  }

  return (
    <div className="min-h-screen bg-dark-500 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl border border-border p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="font-extrabold text-xl text-dark">Niks <span className="text-primary">Digital</span></span>
          <p className="text-xs text-muted mt-1 uppercase tracking-widest">Admin Login</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors"
              placeholder="admin@niksdigital.co.ke" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPass(e.target.value)} required
              className="w-full border border-border rounded-lg px-4 py-3 text-sm outline-none focus:border-primary transition-colors" />
          </div>
          {error && <p className="text-xs text-danger bg-red-50 rounded-lg p-3">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full h-11 bg-primary text-white font-bold text-sm rounded-full hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : null}
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  )
}
