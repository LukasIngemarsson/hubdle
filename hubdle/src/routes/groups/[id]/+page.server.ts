import { error, fail, redirect } from '@sveltejs/kit';
import { parseShareText } from '$lib/parsers';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

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

	const { data: games } = await locals.supabase.from('games').select('id, name, url');

	return { group, members: members ?? [], leaderboard, submissions: submissions ?? [], games: games ?? [] };
};

export const actions: Actions = {
	submit: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const rawText = (formData.get('raw_text') as string)?.trim();

		if (!rawText) return fail(400, { error: 'Paste your share text.' });

		const parsed = parseShareText(rawText);
		if (!parsed) return fail(400, { error: 'Could not parse that share text. Supported games: Wordle, Bandle.' });

		const { error: insertError } = await locals.supabase.from('submissions').insert({
			user_id: user.id,
			group_id: params.id,
			game_id: parsed.gameId,
			score: parsed.score,
			raw_text: rawText,
			game_date: parsed.gameDate
		});

		if (insertError) {
			if (insertError.code === '23505')
				return fail(409, { error: 'You already submitted a score for this game today.' });
			return fail(500, { error: `Failed to submit: ${insertError.message}` });
		}

		return { success: true };
	}
};
