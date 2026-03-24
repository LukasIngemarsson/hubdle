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

	const { data: games } = await locals.supabase.from('games').select('id, name, url');

	return { group, members: members ?? [], submissions: submissions ?? [], games: games ?? [], userId: user.id };
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
	},

	leave: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const { error: deleteError } = await locals.supabase
			.from('group_members')
			.delete()
			.eq('group_id', params.id)
			.eq('user_id', user.id);

		if (deleteError) return fail(500, { error: `Failed to leave group: ${deleteError.message}` });

		redirect(303, '/groups');
	},

	delete: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		// Verify the user is the creator
		const { data: group } = await locals.supabase
			.from('groups')
			.select('created_by')
			.eq('id', params.id)
			.single();

		if (!group || group.created_by !== user.id) {
			return fail(403, { error: 'Only the group creator can delete this group.' });
		}

		const { error: deleteError } = await locals.supabase
			.from('groups')
			.delete()
			.eq('id', params.id);

		if (deleteError) return fail(500, { error: `Failed to delete group: ${deleteError.message}` });

		redirect(303, '/groups');
	}
};
