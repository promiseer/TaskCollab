import { createClient } from '@supabase/supabase-js'
import { env } from '~/env'

export function getSupabaseClient() {
	const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
	const supabaseKey =
		env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? env.NEXT_PUBLIC_SUPABASE_ANON_KEY

	if (!supabaseUrl || !supabaseKey) {
		throw new Error(
			'Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.'
		)
	}

	return createClient(supabaseUrl, supabaseKey)
}
