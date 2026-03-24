import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';

export function createSupabaseClient(
	fetch: typeof globalThis.fetch,
	cookies?: {
		getAll: () => { name: string; value: string }[];
		setAll: (cookies: { name: string; value: string; options: object }[]) => void;
	}
) {
	if (isBrowser()) {
		return createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
			global: { fetch }
		});
	}

	if (!cookies) {
		throw new Error('cookies must be provided on the server');
	}

	return createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, {
		global: { fetch },
		cookies: {
			getAll: () => cookies.getAll(),
			setAll: (newCookies) =>
				cookies.setAll(
					newCookies.map(({ name, value, options }) => ({ name, value, options }))
				)
		}
	});
}
