import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('username, created_at')
		.eq('id', user.id)
		.single();

	const { count: totalSubmissions } = await locals.supabase
		.from('submissions')
		.select('id', { count: 'exact', head: true })
		.eq('user_id', user.id);

	const { count: totalGroups } = await locals.supabase
		.from('group_members')
		.select('group_id', { count: 'exact', head: true })
		.eq('user_id', user.id)
		.is('left_at', null);

	return {
		email: user.email ?? '',
		username: profile?.username ?? '',
		memberSince: profile?.created_at ?? '',
		totalSubmissions: totalSubmissions ?? 0,
		totalGroups: totalGroups ?? 0
	};
};

export const actions: Actions = {
	updateUsername: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const username = (formData.get('username') as string)?.trim();

		if (!username) return fail(400, { error: 'Username cannot be empty.' });
		if (username.length > 30) return fail(400, { error: 'Username must be 30 characters or less.' });

		const { error } = await locals.supabase
			.from('profiles')
			.update({ username })
			.eq('id', user.id);

		if (error) return fail(500, { error: `Failed to update username: ${error.message}` });

		return { success: true };
	}
};
