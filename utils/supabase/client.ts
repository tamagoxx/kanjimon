'use client'

import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!)

/**
 * Lazy singleton — only create the client when first called.
 * Reuse the same instance for the lifetime of the browser tab.
 */
let _client: ReturnType<typeof createClient> | null = null
export const getBrowserSupabase = () => (_client ??= createClient())
