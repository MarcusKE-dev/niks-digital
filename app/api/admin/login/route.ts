import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createSupabaseServer } from '@/lib/supabase-server'
import { supabaseAdmin } from '@/lib/supabase-admin'
import { rateLimit, clientIp } from '@/lib/rate-limit'
import { jsonError, jsonOk, readJson, serverError, verifySameOrigin } from '@/lib/security'

// Signing in happens on the server so the attempt can be counted.
// Done in the browser — as it was — there is nothing between an
// attacker and an unlimited password-guessing loop against the one
// account that controls the whole shop.
const bodySchema = z.object({
  email: z.string().trim().email().max(254),
  password: z.string().min(1).max(128),
})

// Deliberately uniform: never reveal whether the email exists, whether
// the password was wrong, or whether the account simply lacks admin.
const GENERIC_FAILURE = 'Invalid email or password'

const WINDOW_MS = 15 * 60_000

export async function POST(req: NextRequest) {
  const origin = verifySameOrigin(req)
  if (origin) return origin

  const parsed = bodySchema.safeParse(await readJson(req))

  // Count malformed bodies against the IP too, so they cannot be used
  // to probe for free.
  const ipBudget = rateLimit(`login-ip:${clientIp(req)}`, 15, WINDOW_MS)
  if (!ipBudget.ok) {
    return jsonError('Too many sign-in attempts. Please try again in a few minutes.', 429)
  }

  if (!parsed.success) return jsonError(GENERIC_FAILURE, 401)

  const { email, password } = parsed.data

  // A second budget per account, so spreading attempts across IPs does
  // not buy an attacker more guesses at one address.
  const accountBudget = rateLimit(`login-account:${email.toLowerCase()}`, 8, WINDOW_MS)
  if (!accountBudget.ok) {
    return jsonError('Too many sign-in attempts for this account. Please try again later.', 429)
  }

  try {
    const supabase = createSupabaseServer()

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error || !data.user) {
      console.warn(`[Admin Login] Failed attempt for ${email} from ${clientIp(req)}`)
      return jsonError(GENERIC_FAILURE, 401)
    }

    // Valid credentials are not enough — the account must be an admin.
    const { data: admin } = await supabaseAdmin
      .from('admins')
      .select('id')
      .eq('user_id', data.user.id)
      .maybeSingle()

    if (!admin) {
      // Do not leave a usable session behind for a non-admin account.
      await supabase.auth.signOut()
      console.warn(`[Admin Login] Non-admin sign-in blocked: ${email}`)
      return jsonError(GENERIC_FAILURE, 401)
    }

    return jsonOk({ success: true })
  } catch (err) {
    return serverError('Admin Login', err, 'Could not sign you in. Please try again.')
  }
}
