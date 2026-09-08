import { createClient, SupabaseClient } from '@supabase/supabase-js'

function getSupabaseUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
}
function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
}

let _client: SupabaseClient | null = null

export function getSupabaseClient(): SupabaseClient {
  if (!_client) {
    _client = createClient(getSupabaseUrl(), getAnonKey())
  }
  return _client
}

export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return (getSupabaseClient() as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export function getServiceClient(): SupabaseClient {
  return createClient(getSupabaseUrl(), process.env.SUPABASE_SERVICE_KEY ?? '', {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
