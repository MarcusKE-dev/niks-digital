import { createBrowserClient } from '@supabase/ssr'
import { createClient }        from '@supabase/supabase-js'

export const supabaseBrowser = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
)

export const STORAGE_BUCKETS = {
  PRODUCTS:   'product-images',
  CATEGORIES: 'category-images',
} as const

export function getStorageUrl(bucket: string, filePath: string): string {
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${filePath}`
}

export async function uploadToStorage(bucket: string, path: string, file: File | Blob) {
  const { data, error } = await supabaseAdmin.storage.from(bucket).upload(path, file, {
    upsert: true, contentType: file instanceof File ? file.type : 'image/webp',
  })
  if (error) return { url: null, error: error.message }
  return { url: getStorageUrl(bucket, data.path), error: null }
}

export async function deleteFromStorage(bucket: string, path: string) {
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path])
  if (error) return { success: false, error: error.message }
  return { success: true, error: null }
}
