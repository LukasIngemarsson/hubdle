import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { user } = await locals.safeGetSession();

	let avatarUrl: string | null = null;
	let username: string | null = null;
	let friendRequestCount = 0;
	let groupInviteCount = 0;
	if (user) {
		const { data: profile } = await locals.supabase
			.from('profiles')
			.select('username, avatar_url')
			.eq('id', user.id)
			.single();
		avatarUrl = profile?.avatar_url ?? null;
		username = profile?.username ?? null;

		const { count } = await locals.supabase
			.from('friendships')
			.select('id', { count: 'exact', head: true })
			.eq('addressee_id', user.id)
			.eq('status', 'pending');
		friendRequestCount = count ?? 0;

		const { count: inviteCount } = await locals.supabase
			.from('group_invites')
			.select('id', { count: 'exact', head: true })
			.eq('invited_user_id', user.id);
		groupInviteCount = inviteCount ?? 0;
	}

	return { user, avatarUrl, username, friendRequestCount, groupInviteCount, cookies: cookies.getAll() };
};
