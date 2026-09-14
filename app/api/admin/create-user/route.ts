import { NextRequest } from 'next/server'
import { z } from 'zod'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { requireOwner } from '@/lib/auth'
import { enforceRateLimit } from '@/lib/rate-limit'
import { jsonError, jsonOk, readJson, serverError, verifySameOrigin } from '@/lib/security'

// Admin accounts hold the keys to the whole shop, so the password
// bar is higher than the 8 characters the form used to accept.
const bodySchema = z.object({
  email: z.string().trim().email('Enter a valid email address').max(254),
  password: z
    .string()
    .min(12, 'Password must be at least 12 characters')
    .max(128, 'Password is too long')
    .refine(v => /[a-z]/.test(v), 'Password must contain a lowercase letter')
    .refine(v => /[A-Z]/.test(v), 'Password must contain an uppercase letter')
    .refine(v => /[0-9]/.test(v), 'Password must contain a number'),
})

export async function POST(req: NextRequest) {
  const origin = verifySameOrigin(req)
  if (origin) return origin

  // Creating an admin is an escalation of privilege — owner only,
  // not merely "any signed-in user" as this route previously allowed.
  const guard = await requireOwner()
  if (!guard.ok) return guard.response

  const limited = enforceRateLimit(req, 'admin-create-user', 5, 60 * 60_000)
  if (limited) return limited

  const parsed = bodySchema.safeParse(await readJson(req))
  if (!parsed.success) {
    return jsonError(parsed.error.errors[0]?.message ?? 'Invalid input', 400)
  }

  const { email, password } = parsed.data

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  })

  if (error || !data.user) {
    console.error('[Create Admin] auth error:', error)
    return jsonError('Could not create that account. The email may already be in use.', 400)
  }

  // An auth user alone cannot reach /admin — the middleware requires a
  // row here. Without this insert the "Add New Admin" flow silently
  // produced accounts that were locked out of the panel.
  const { error: adminError } = await supabaseAdmin
    .from('admins')
    .insert({ user_id: data.user.id, email })

  if (adminError) {
    // Roll the auth user back so a half-created admin cannot linger.
    await supabaseAdmin.auth.admin.deleteUser(data.user.id).catch(() => {})
    return serverError('Create Admin', adminError, 'Could not grant admin access.')
  }

  return jsonOk({ user: { id: data.user.id, email: data.user.email } })
}
