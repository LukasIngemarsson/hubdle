import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { user } = await locals.safeGetSession();

	let avatarUrl: string | null = null;
	if (user) {
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('avatar_url')
			.eq('id', user.id)
			.single();
		avatarUrl = profile?.avatar_url ?? null;
	}

	return { user, avatarUrl, cookies: cookies.getAll() };
};
