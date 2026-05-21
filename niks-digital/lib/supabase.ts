// ════════════════════════════════════════════════════════════
// SUPABASE CLIENT — Three variants for different contexts
//
// 1. createBrowserClient  → React components (client-side)
// 2. createServerClient   → Server components, Route Handlers
// 3. createAdminClient    → Admin API routes only (service role)
//
// Never use the admin client in browser code or components.
// ════════════════════════════════════════════════════════════

import { createBrowserClient as _createBrowserClient } from '@supabase/ssr'
import { createServerClient as _createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

// ── ENV VALIDATION ───────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SUPABASE_SRK = process.env.SUPABASE_SERVICE_ROLE_KEY!



// ── 1. BROWSER CLIENT ────────────────────────────────────────
// Use in: Client components ('use client'), Zustand stores,
//         any code that runs in the browser.
//
// Example:
//   import { supabaseBrowser } from '@/lib/supabase'
//   const { data } = await supabaseBrowser.from('products').select()

export const supabaseBrowser = _createBrowserClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
)

// ── 2. SERVER CLIENT ─────────────────────────────────────────
// Use in: Server Components, Server Actions, Route Handlers.
// Reads cookies to maintain auth session on the server.
//
// Example (in a Server Component):
//   import { createSupabaseServer } from '@/lib/supabase'
//   const supabase = createSupabaseServer()
//   const { data } = await supabase.from('products').select()

export function createSupabaseServer() {
  const cookieStore = cookies()

  return _createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options as any)
          })
        } catch {
          // setAll is called from a Server Component — cookies can't
          // be set there, but that's fine; the middleware handles it.
        }
      },
    },
  })
}

// ── 3. ADMIN CLIENT ──────────────────────────────────────────
// Use in: API route handlers that need to bypass RLS policies.
// NEVER import this in components or client-side code.
//
// Example (in an API route):
//   import { supabaseAdmin } from '@/lib/supabase'
//   const { data } = await supabaseAdmin
//     .from('orders').select().eq('payment_status', 'pending')

export const supabaseAdmin = createClient(
  SUPABASE_URL,
  SUPABASE_SRK,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// ── STORAGE HELPERS ──────────────────────────────────────────

export const STORAGE_BUCKETS = {
  PRODUCTS: 'product-images',
  CATEGORIES: 'category-images',
} as const

/**
 * Returns the public URL for a file in Supabase Storage.
 * Works on both client and server.
 */
export function getStorageUrl(
  bucket: string,
  filePath: string
): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`
}

/**
 * Uploads a file to Supabase Storage and returns its public URL.
 * Call this from an API route (uses admin client).
 *
 * @param bucket  - Storage bucket name
 * @param path    - File path inside the bucket, e.g. 'products/uuid.webp'
 * @param file    - File or Blob to upload
 */
export async function uploadToStorage(
  bucket: string,
  path: string,
  file: File | Blob
): Promise<{ url: string | null; error: string | null }> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, {
      upsert: true,
      contentType: file instanceof File ? file.type : 'image/webp',
    })

  if (error) {
    console.error('[Supabase Storage] Upload error:', error.message)
    return { url: null, error: error.message }
  }

  const url = getStorageUrl(bucket, data.path)
  return { url, error: null }
}

/**
 * Deletes a file from Supabase Storage.
 * Call this from an API route (uses admin client).
 */
export async function deleteFromStorage(
  bucket: string,
  path: string
): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabaseAdmin.storage
    .from(bucket)
    .remove([path])

  if (error) {
    console.error('[Supabase Storage] Delete error:', error.message)
    return { success: false, error: error.message }
  }

  return { success: true, error: null }
}
