'use client'
import { useState, useEffect, useCallback } from 'react'
import { ShieldCheck, Trash2 } from 'lucide-react'
import { supabaseBrowser } from '@/lib/supabase'
import { useToast } from '@/components/ui/Toaster'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

interface AdminRow {
  id: string
  user_id: string
  email: string | null
  created_at: string
}

// Must stay in step with the rules enforced by /api/admin/create-user.
const PASSWORD_HINT = 'At least 12 characters, with an uppercase letter, a lowercase letter and a number.'

function passwordProblem(value: string): string | null {
  if (value.length < 12) return 'Password must be at least 12 characters'
  if (!/[a-z]/.test(value)) return 'Password must contain a lowercase letter'
  if (!/[A-Z]/.test(value)) return 'Password must contain an uppercase letter'
  if (!/[0-9]/.test(value)) return 'Password must contain a number'
  return null
}

export default function TeamPage() {
  const toast = useToast()
  const [admins, setAdmins] = useState<AdminRow[]>([])
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)
  const [isOwner, setIsOwner] = useState(false)

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [ownPassword, setOwnPassword] = useState('')
  const [adding, setAdding] = useState(false)
  const [removing, setRemoving] = useState<AdminRow | null>(null)

  const loadAdmins = useCallback(async () => {
    const {
      data: { user },
    } = await supabaseBrowser.auth.getUser()
    setCurrentUserId(user?.id ?? null)

    // Only the owner may list the team; everyone else sees just
    // themselves, which is what this page showed before.
    const res = await fetch('/api/admin/list-admins')
    if (res.ok) {
      const data = await res.json()
      setAdmins(data.admins ?? [])
      setIsOwner(true)
      return
    }

    setIsOwner(false)
    if (user) {
      setAdmins([
        { id: user.id, user_id: user.id, email: user.email ?? null, created_at: '' },
      ])
    }
  }, [])

  useEffect(() => {
    loadAdmins()
  }, [loadAdmins])

  async function handleAddAdmin(e: React.FormEvent) {
    e.preventDefault()

    const problem = passwordProblem(newPassword)
    if (problem) {
      toast.error(problem)
      return
    }

    setAdding(true)
    const res = await fetch('/api/admin/create-user', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: newPassword }),
    })

    const data = await res.json().catch(() => ({}))
    setAdding(false)

    if (!res.ok) {
      toast.error(data.error ?? 'Failed to create user')
      return
    }

    toast.success(`Admin account created for ${email}`)
    setEmail('')
    setNewPassword('')
    loadAdmins()
  }

  async function handleRemoveAdmin(admin: AdminRow) {
    const res = await fetch('/api/admin/remove-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: admin.user_id }),
    })
    const data = await res.json().catch(() => ({}))

    if (!res.ok) {
      toast.error(data.error ?? 'Failed to remove admin')
      return
    }

    toast.success(`${admin.email ?? 'Admin'} no longer has access`)
    loadAdmins()
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    const problem = passwordProblem(ownPassword)
    if (problem) {
      toast.error(problem)
      return
    }

    const { error } = await supabaseBrowser.auth.updateUser({ password: ownPassword })
    if (error) {
      toast.error(error.message)
      return
    }
    toast.success('Password updated successfully!')
    setOwnPassword('')
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl">
      <h1 className="text-2xl font-extrabold text-dark mb-8">Team &amp; Access</h1>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-dark mb-4 border-b border-border pb-3">Current Admins</h2>
        {admins.map(a => (
          <div key={a.id} className="flex items-center gap-3 py-3 border-b border-border last:border-0">
            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {a.email?.[0]?.toUpperCase() ?? '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-dark truncate">{a.email ?? 'Unknown'}</p>
              <p className="text-xs text-muted flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" aria-hidden />
                {a.user_id === currentUserId ? 'Admin (you)' : 'Admin'}
              </p>
            </div>
            {isOwner && a.user_id !== currentUserId && (
              <button
                onClick={() => setRemoving(a)}
                aria-label={`Remove admin access for ${a.email ?? 'this account'}`}
                className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-muted hover:text-danger hover:bg-red-50 transition-colors"
              >
                <Trash2 className="h-4 w-4" aria-hidden />
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-6 mb-6">
        <h2 className="font-bold text-dark mb-4 border-b border-border pb-3">Change My Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">
              New Password
            </label>
            <input
              type="password"
              value={ownPassword}
              onChange={e => setOwnPassword(e.target.value)}
              required
              minLength={12}
              autoComplete="new-password"
              className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
              placeholder="Minimum 12 characters"
            />
            <p className="text-xs text-muted mt-1.5">{PASSWORD_HINT}</p>
          </div>
          <button
            type="submit"
            className="h-10 px-6 bg-dark text-white font-semibold text-sm rounded-full hover:bg-dark-400 transition-colors"
          >
            Update Password
          </button>
        </form>
      </div>

      {isOwner && (
        <div className="bg-white border border-border rounded-xl p-6">
          <h2 className="font-bold text-dark mb-1">Add New Admin</h2>
          <p className="text-xs text-muted mb-4">This person will have full access to the admin panel.</p>
          <form onSubmit={handleAddAdmin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="off"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="newadmin@example.com"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted mb-2">Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                minLength={12}
                autoComplete="new-password"
                className="w-full border border-border rounded-lg px-3 py-2.5 text-sm outline-none focus:border-primary"
                placeholder="Minimum 12 characters"
              />
              <p className="text-xs text-muted mt-1.5">{PASSWORD_HINT}</p>
            </div>
            <button
              type="submit"
              disabled={adding}
              className="h-10 px-6 bg-primary text-white font-semibold text-sm rounded-full hover:bg-primary-600 disabled:opacity-60 transition-colors flex items-center gap-2"
            >
              {adding ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Admin Account'
              )}
            </button>
          </form>
        </div>
      )}

      <ConfirmDialog
        isOpen={removing !== null}
        title="Remove Admin Access"
        message={`Remove admin access for ${removing?.email ?? 'this account'}? They will no longer be able to open the admin panel.`}
        confirmLabel="Remove Access"
        variant="danger"
        onConfirm={() => {
          const target = removing
          setRemoving(null)
          if (target) handleRemoveAdmin(target)
        }}
        onCancel={() => setRemoving(null)}
      />
    </div>
  )
}
