import { redirect } from '@sveltejs/kit';
import { ensureProfile } from '$lib/auth';
import { MAX_GROUP_MEMBERS } from '$lib/constants';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) {
		// Remember where to go after login
		redirect(303, `/login?redirect=/invite/${params.code}`);
	}

	await ensureProfile(locals.supabase, user);

	const { data: group } = await locals.supabase
		.from('groups')
		.select('id')
		.eq('invite_code', params.code)
		.single();

	if (!group) redirect(303, '/groups?error=invalid-invite');

	// Check member limit
	const { count: memberCount } = await locals.supabase
		.from('group_members')
		.select('user_id', { count: 'exact', head: true })
		.eq('group_id', group.id)
		.is('left_at', null);

	if ((memberCount ?? 0) >= MAX_GROUP_MEMBERS) redirect(303, '/groups?error=group-full');

	// Try to join
	const { error } = await locals.supabase
		.from('group_members')
		.insert({ group_id: group.id, user_id: user.id });

	if (error) {
		if (error.code === '23505') {
			// Already a member or soft-deleted — try rejoin
			const { data: updated } = await locals.supabase
				.from('group_members')
				.update({ left_at: null, joined_at: new Date().toISOString() })
				.eq('group_id', group.id)
				.eq('user_id', user.id)
				.not('left_at', 'is', null)
				.select();

			if (!updated || updated.length === 0) {
				// Already an active member — just go to the group
				redirect(303, `/groups/${group.id}`);
			}
		} else {
			redirect(303, '/groups?error=join-failed');
		}
	}

	redirect(303, `/groups/${group.id}?joined=1`);
};
