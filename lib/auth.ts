// ════════════════════════════════════════════════════════════
// ADMIN AUTHORISATION
//
// Two levels:
//   • admin — any row in the `admins` table. Runs the shop.
//   • owner — the address in ADMIN_EMAIL. Manages the admin list.
//
// Every check goes through supabase.auth.getUser(), which verifies
// the JWT against the Supabase auth server. getSession() only
// decodes the cookie and trusts it, so it must never be used to
// gate access.
// ════════════════════════════════════════════════════════════

import type { User } from '@supabase/supabase-js'
import { createSupabaseServer } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { jsonError } from '@/lib/security'

export interface AdminContext {
  user: User
  isOwner: boolean
}

/** Owner addresses, from ADMIN_EMAIL (comma-separated list allowed). */
function ownerEmails(): string[] {
  const raw = process.env.ADMIN_EMAIL ?? process.env.ADMIN_EMAILS ?? ''
  return raw
    .split(',')
    .map(e => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isOwnerEmail(email: string | undefined | null): boolean {
  if (!email) return false
  const owners = ownerEmails()
  // With no owner configured nobody is the owner — fail closed rather
  // than silently promoting whoever happens to be signed in.
  if (owners.length === 0) return false
  return owners.includes(email.toLowerCase())
}

/**
 * Verify the caller is a signed-in admin.
 * Returns the admin context, or null when the caller is not an admin.
 */
export async function getAdminContext(): Promise<AdminContext | null> {
  const supabase = createSupabaseServer()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) return null

  const { data: admin, error: adminError } = await supabaseAdmin
    .from('admins')
    .select('id')
    .eq('user_id', user.id)
    .maybeSingle()

  if (adminError || !admin) return null

  return { user, isOwner: isOwnerEmail(user.email) }
}

export type AdminGuard =
  | { ok: true; ctx: AdminContext }
  | { ok: false; response: ReturnType<typeof jsonError> }

/** Guard for API routes: `const guard = await requireAdmin(); if (!guard.ok) return guard.response` */
export async function requireAdmin(): Promise<AdminGuard> {
  const ctx = await getAdminContext()
  if (!ctx) {
    // One generic message: do not tell an attacker whether they got
    // as far as authenticating.
    return { ok: false, response: jsonError('Unauthorized', 401) }
  }
  return { ok: true, ctx }
}

/** Guard for routes only the owner may call (managing other admins). */
export async function requireOwner(): Promise<AdminGuard> {
  const ctx = await getAdminContext()
  if (!ctx) return { ok: false, response: jsonError('Unauthorized', 401) }
  if (!ctx.isOwner) return { ok: false, response: jsonError('Forbidden', 403) }
  return { ok: true, ctx }
}
