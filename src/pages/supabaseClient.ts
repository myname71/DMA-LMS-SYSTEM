import { createClient } from '@supabase/supabase-js'

// OAuth callback URL for your Supabase project:
// https://phlniovaulufujeafnwh.supabase.co/auth/v1/callback

// Read Supabase config from environment variables. Do NOT commit your anon key to the repository.
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || 'https://phlniovaulufujeafnwh.supabase.co'
const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || ''

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Warn at runtime — keep this non-throwing so local dev/test can proceed until envs are set.
  // Replace the empty anon key with your real anon key in environment variables before deploying.
  // Example (create a .env file):
  // REACT_APP_SUPABASE_URL=https://phlniovaulufujeafnwh.supabase.co
  // REACT_APP_SUPABASE_ANON_KEY=your-anon-key
  console.warn('Supabase URL or anon key not set. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_ANON_KEY (or VITE_ variants).')
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
