'use client'
import { useState, useEffect } from 'react'
import { supabaseBrowser }     from '@/lib/supabase'
import { useToast }            from '@/components/ui/Toaster'

export default function TeamPage() {
  const toast = useToast()
  const [users,    setUsers]    = useState<any[]>([])
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [adding,   setAdding]   = useState(false)

  async function loadUsers() {
    // Can only list users via service role — show current user for now
    const { data: { user } } = await supabaseBrowser.auth.getUser()
    if (user) setUsers([user])
  }

  useEffect(() => { loadUsers() }, [])

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)

    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const data = await res.json()
    setAdding(false)

    if (!res.ok) { toast.error(data.error ?? 'Failed to create user'); return }

    toast.success(`Admin account created for ${email}`)
    setEmail('')
    setPassword('')
    loadUsers()
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    const { error } = await supabaseBrowser.auth.updateUser({ password })
    if (error) { toast.error(error.message); return }
    toast.success('Password updated successfully!')
    setPassword('')
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-dark mb-8">Team & Access</h1>

      {/* Current admins */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-dark mb-4 border-b border-border pb-3">Current Admins</h2>
        {users.map(u => (
          <div key={u.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {u.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-dark">{u.email}</p>
              <p className="text-xs text-muted">Admin</p>
            </div>
          </div>
        ))}
      </div>

      {/* Change your own password */}
      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-dark mb-4 border-b border-border pb-3">Change My Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              New Password
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={8}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Minimum 8 characters"
            />
          </div>
          <button type="submit"
            className="h-10 px-6 bg-dark text-white font-semibold text-sm rounded-full hover:bg-dark-400 transition-colors">
            Update Password
          </button>
        </form>
      </div>

      {/* Add new admin */}
      <div className="bg-white border border-border rounded-xl p-6">
        <h2 className="font-bold text-dark mb-1 ">Add New Admin</h2>
        <p className="text-xs text-muted mb-4">This person will have full access to the admin panel.</p>
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="newadmin@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={8}
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Minimum 8 characters" />
          </div>
          <button type="submit" disabled={adding}
            className="h-10 px-6 bg-primary text-white font-semibold text-sm rounded-full hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center gap-2">
            {adding
              ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating...</>
              : 'Create Admin Account'
            }
          </button>
        </form>
      </div>
    </div>
  )
}