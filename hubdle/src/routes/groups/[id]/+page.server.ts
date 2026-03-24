import { error, fail, redirect } from '@sveltejs/kit';
import { parseShareText } from '$lib/parsers';
import { validateScore } from '$lib/game-rules';
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

	const { data: allMembers } = await locals.supabase
		.from('group_members')
		.select('user_id, joined_at, left_at, profiles(id, username, avatar_url)')
		.eq('group_id', params.id);

	const members = (allMembers ?? []).filter((m) => m.left_at === null);

	const { data: submissions } = await locals.supabase
		.from('submissions')
		.select('user_id, score, game_id, game_date, games(name, score_direction)')
		.eq('group_id', params.id)
		.order('game_date', { ascending: false });

	const { data: games } = await locals.supabase.from('games').select('id, name, url, score_direction');

	return { group, members, allMembers: allMembers ?? [], submissions: submissions ?? [], games: games ?? [], userId: user.id };
};

export const actions: Actions = {
	submit: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const rawText = (formData.get('raw_text') as string)?.trim();

		if (!rawText) return fail(400, { error: 'Paste your share text.' });

		const parsed = parseShareText(rawText);
		if (!parsed) return fail(400, { error: 'Could not parse that share text. Supported games: Wordle, Bandle, Connections, Contexto.' });

		const scoreError = validateScore(parsed.gameId, parsed.score);
		if (scoreError) return fail(400, { error: scoreError });

		const today = new Date().toISOString().slice(0, 10);
		if (parsed.gameDate > today) return fail(400, { error: 'Cannot submit a score for a future date.' });

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

	submitManual: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const gameId = (formData.get('game_id') as string)?.trim();
		const scoreStr = (formData.get('score') as string)?.trim();
		const gameDate = (formData.get('game_date') as string)?.trim();

		if (!gameId || !scoreStr || !gameDate) return fail(400, { error: 'All fields are required.' });

		const score = parseInt(scoreStr, 10);
		if (isNaN(score)) return fail(400, { error: 'Score must be a number.' });

		const scoreError = validateScore(gameId, score);
		if (scoreError) return fail(400, { error: scoreError });

		const today = new Date().toISOString().slice(0, 10);
		if (gameDate > today) return fail(400, { error: 'Cannot submit a score for a future date.' });

		const { error: insertError } = await locals.supabase.from('submissions').insert({
			user_id: user.id,
			group_id: params.id,
			game_id: gameId,
			score,
			raw_text: `Manual: ${gameId} ${score}`,
			game_date: gameDate
		});

		if (insertError) {
			if (insertError.code === '23505')
				return fail(409, { error: 'You already submitted a score for this game on that date.' });
			return fail(500, { error: `Failed to submit: ${insertError.message}` });
		}

		return { success: true };
	},

	leave: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		// Prevent owner from using the plain leave action
		const { data: group } = await locals.supabase
			.from('groups')
			.select('created_by')
			.eq('id', params.id)
			.single();

		if (group?.created_by === user.id) {
			return fail(400, { error: 'As the group owner, you must transfer ownership or delete the group.' });
		}

		const { error: leaveError } = await locals.supabase
			.from('group_members')
			.update({ left_at: new Date().toISOString() })
			.eq('group_id', params.id)
			.eq('user_id', user.id)
			.is('left_at', null);

		if (leaveError) return fail(500, { error: `Failed to leave group: ${leaveError.message}` });

		redirect(303, '/groups');
	},

	transferAndLeave: async ({ request, params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const newOwnerId = (formData.get('new_owner_id') as string)?.trim();
		if (!newOwnerId) return fail(400, { error: 'Please select a new owner.' });

		// Verify current user is the owner
		const { data: group } = await locals.supabase
			.from('groups')
			.select('created_by')
			.eq('id', params.id)
			.single();

		if (!group || group.created_by !== user.id) {
			return fail(403, { error: 'Only the group owner can transfer ownership.' });
		}

		// Verify new owner is an active member
		const { data: membership } = await locals.supabase
			.from('group_members')
			.select('user_id')
			.eq('group_id', params.id)
			.eq('user_id', newOwnerId)
			.is('left_at', null)
			.single();

		if (!membership) return fail(400, { error: 'Selected user is not a member of this group.' });

		// Transfer ownership
		const { error: updateError } = await locals.supabase
			.from('groups')
			.update({ created_by: newOwnerId })
			.eq('id', params.id);

		if (updateError) return fail(500, { error: `Failed to transfer ownership: ${updateError.message}` });

		// Soft-delete the old owner from the group
		const { error: leaveError } = await locals.supabase
			.from('group_members')
			.update({ left_at: new Date().toISOString() })
			.eq('group_id', params.id)
			.eq('user_id', user.id)
			.is('left_at', null);

		if (leaveError) return fail(500, { error: `Ownership transferred but failed to leave: ${leaveError.message}` });

		redirect(303, '/groups');
	},

	leaveAndDelete: async ({ params, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		// Verify current user is the owner
		const { data: group } = await locals.supabase
			.from('groups')
			.select('created_by')
			.eq('id', params.id)
			.single();

		if (!group || group.created_by !== user.id) {
			return fail(403, { error: 'Only the group owner can delete the group.' });
		}

		// Verify no other active members exist
		const { data: activeMembers } = await locals.supabase
			.from('group_members')
			.select('user_id')
			.eq('group_id', params.id)
			.neq('user_id', user.id)
			.is('left_at', null);

		if (activeMembers && activeMembers.length > 0) {
			return fail(400, { error: 'Cannot delete a group with other members. Transfer ownership first.' });
		}

		const { error: deleteError } = await locals.supabase
			.from('groups')
			.delete()
			.eq('id', params.id);

		if (deleteError) return fail(500, { error: `Failed to delete group: ${deleteError.message}` });

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
