import { createSupabaseClient } from '$lib/supabase';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.supabase = createSupabaseClient(event.fetch, {
		getAll: () => event.cookies.getAll(),
		setAll: (cookies) => {
			for (const { name, value, options } of cookies) {
				event.cookies.set(name, value, { path: '/', ...options });
			}
		}
	});

	event.locals.safeGetSession = async () => {
		const {
			data: { user },
			error
		} = await event.locals.supabase.auth.getUser();

		if (error || !user) return { user: null };

		return { user };
	};

	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return name === 'content-range' || name === 'x-supabase-api-version';
		}
	});
};
