import { createClient } from '@supabase/supabase-js'

// WARNING: The following code is based on provided .env variables.
// The AI assistant cannot write or debug Supabase-specific data fetching logic.
// This client is created for configuration purposes only.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase URL and Anon Key must be provided in .env.local')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
