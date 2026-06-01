const REQUIRED_ENV = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY',
] as const

const PRODUCTION_REQUIRED = [
  'DARAJA_CONSUMER_KEY',
  'DARAJA_CONSUMER_SECRET',
  'DARAJA_SHORTCODE',
  'DARAJA_PASSKEY',
  'DARAJA_CALLBACK_URL',
  'NEXT_PUBLIC_WHATSAPP_NUMBER',
] as const

export function validateEnv() {
  const missing: string[] = []

  for (const key of REQUIRED_ENV) {
    if (!process.env[key]) missing.push(key)
  }

  if (process.env.NODE_ENV === 'production') {
    for (const key of PRODUCTION_REQUIRED) {
      if (!process.env[key]) missing.push(key)
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map(k => `  - ${k}`).join('\n')}\n\nCheck your .env.local file.`
    )
  }
}