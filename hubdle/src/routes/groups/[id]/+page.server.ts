import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { session } = await locals.safeGetSession();
	if (!session) redirect(303, '/login');

	const { data: group } = await locals.supabase
		.from('groups')
		.select('id, name, invite_code, created_by, created_at')
		.eq('id', params.id)
		.single();

	if (!group) error(404, 'Group not found');

	const { data: members } = await locals.supabase
		.from('group_members')
		.select('user_id, joined_at, profiles(id, username, avatar_url)')
		.eq('group_id', params.id);

	const { data: submissions } = await locals.supabase
		.from('submissions')
		.select('user_id, score, game_id, game_date, games(name, score_direction)')
		.eq('group_id', params.id)
		.order('game_date', { ascending: false });

	// Build leaderboard: total score per user across all games
	const scores = new Map<string, { username: string; total: number; games: number }>();

	for (const member of members ?? []) {
		const profile = member.profiles;
		if (profile) {
			scores.set(member.user_id, { username: profile.username, total: 0, games: 0 });
		}
	}

	for (const sub of submissions ?? []) {
		const entry = scores.get(sub.user_id);
		if (entry) {
			entry.total += sub.score;
			entry.games += 1;
		}
	}

	const leaderboard = [...scores.entries()]
		.map(([userId, data]) => ({ userId, ...data }))
		.sort((a, b) => a.total - b.total);

	return { group, members: members ?? [], leaderboard, submissions: submissions ?? [] };
};
