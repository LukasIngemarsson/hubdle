import { createBrowserClient, createServerClient, isBrowser } from '@supabase/ssr';
import { PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY } from '$env/static/public';
import type { Database } from '$lib/types/database';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = async ({ data, fetch }) => {
	const supabase = isBrowser()
		? createBrowserClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch }
			})
		: createServerClient<Database>(PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_PUBLISHABLE_KEY, {
				global: { fetch },
				cookies: { getAll: () => data.cookies }
			});

	return {
		supabase,
		user: data.user,
		avatarUrl: data.avatarUrl,
		username: data.username,
		friendRequestCount: data.friendRequestCount,
		groupInviteCount: data.groupInviteCount,
		userGroups: data.userGroups
	};
};
