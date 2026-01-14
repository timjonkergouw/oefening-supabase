import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create client with fallback values to prevent build-time errors
// Runtime errors will be handled by the components that use this client
export const supabase = createClient(
    supabaseUrl || 'https://placeholder.supabase.co',
    supabaseKey || 'placeholder-key'
)

// Helper function to check if Supabase is properly configured
export function isSupabaseConfigured() {
    return !!(supabaseUrl && supabaseKey)
}

export default supabase