import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Cache for Supabase client instances
let supabaseInstance: SupabaseClient | null = null
let currentToken: string | null = null

export const supabaseClient = async(supabaseToken: string | null) => {
    if (!supabaseToken) {
        throw new Error('Authentication token is required');
    }
    
    if (!supabaseUrl || !supabaseKey) {
        throw new Error('Missing Supabase configuration. Please check your environment variables.');
    }
    
    // Return the existing instance if the token hasn't changed
    if (supabaseInstance && currentToken === supabaseToken) {
        return supabaseInstance
    }
    
    // Debug: Log token info (remove in production)
    if (process.env.NODE_ENV === 'development') {
        try {
            const payload = JSON.parse(atob(supabaseToken.split('.')[1]));
            console.log('JWT payload:', {
                sub: payload.sub,
                aud: payload.aud,
                role: payload.role,
                exp: new Date(payload.exp * 1000),
            });
        } catch (_) { // eslint-disable-line @typescript-eslint/no-unused-vars
            console.warn('Could not decode JWT for debugging');
        }
    }
    
    // Create a new instance if token changed or no instance exists
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
        global: {
            headers: {
                Authorization: `Bearer ${supabaseToken}`
            }
        },
        auth: {
            persistSession: false // Avoid persisting the session to prevent auth conflicts
        }
    })
    
    // Update the token cache
    currentToken = supabaseToken
    
    return supabaseInstance
} 