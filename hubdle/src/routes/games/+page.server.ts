import { fail, redirect } from '@sveltejs/kit';
import { parseShareText } from '$lib/parsers';
import { validateScore } from '$lib/game-rules';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();
	if (!user) redirect(303, '/login');

	const { data: games } = await locals.supabase
		.from('games')
		.select('id, name, url, score_direction');

	const today = new Date().toISOString().slice(0, 10);

	// User's submissions for today (to show which games they've played)
	const { data: todaysSubmissions } = await locals.supabase
		.from('submissions')
		.select('game_id, score')
		.eq('user_id', user.id)
		.eq('game_date', today);

	const playedToday = new Set((todaysSubmissions ?? []).map((s) => s.game_id));

	// Recent submissions for the user
	const { data: recentSubmissions } = await locals.supabase
		.from('submissions')
		.select('id, score, game_id, game_date, games(name)')
		.eq('user_id', user.id)
		.order('game_date', { ascending: false })
		.order('created_at', { ascending: false });

	return {
		games: games ?? [],
		playedToday: [...playedToday],
		recentSubmissions: (recentSubmissions ?? []).map((s) => ({
			id: s.id,
			gameId: s.game_id,
			gameName: s.games?.name ?? s.game_id,
			score: s.score,
			gameDate: s.game_date
		}))
	};
};

export const actions: Actions = {
	submit: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const rawText = (formData.get('raw_text') as string)?.trim();

		if (!rawText) return fail(400, { error: 'Paste your share text.' });

		const parsed = parseShareText(rawText);
		if (!parsed)
			return fail(400, {
				error:
					'Could not parse that share text. Supported games: Wordle, Bandle, Connections, Contexto.'
			});

		const scoreError = validateScore(parsed.gameId, parsed.score);
		if (scoreError) return fail(400, { error: scoreError });

		const today = new Date().toISOString().slice(0, 10);
		if (parsed.gameDate > today)
			return fail(400, { error: 'Cannot submit a score for a future date.' });

		const { error: insertError } = await locals.supabase.from('submissions').insert({
			user_id: user.id,
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

	submitManual: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const gameId = (formData.get('game_id') as string)?.trim();
		const scoreStr = (formData.get('score') as string)?.trim();
		const gameDate = (formData.get('game_date') as string)?.trim();

		if (!gameId || !scoreStr || !gameDate) return fail(400, { error: 'All fields are required.' });

		const score = parseInt(scoreStr.replace(/[.,]/g, ''), 10);
		if (isNaN(score)) return fail(400, { error: 'Score must be a number.' });

		const scoreError = validateScore(gameId, score);
		if (scoreError) return fail(400, { error: scoreError });

		const today = new Date().toISOString().slice(0, 10);
		if (gameDate > today) return fail(400, { error: 'Cannot submit a score for a future date.' });

		const { error: insertError } = await locals.supabase.from('submissions').insert({
			user_id: user.id,
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

	editSubmission: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const submissionId = (formData.get('submission_id') as string)?.trim();
		const scoreStr = (formData.get('score') as string)?.trim();
		const gameId = (formData.get('game_id') as string)?.trim();

		if (!submissionId || !scoreStr || !gameId)
			return fail(400, { error: 'All fields are required.' });

		const score = parseInt(scoreStr.replace(/[.,]/g, ''), 10);
		if (isNaN(score)) return fail(400, { error: 'Score must be a number.' });

		const scoreError = validateScore(gameId, score);
		if (scoreError) return fail(400, { error: scoreError });

		const { error: updateError } = await locals.supabase
			.from('submissions')
			.update({ score, raw_text: `Manual: ${gameId} ${score}` })
			.eq('id', submissionId)
			.eq('user_id', user.id);

		if (updateError) return fail(500, { error: `Failed to update: ${updateError.message}` });

		return { success: true };
	},

	deleteSubmission: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const submissionId = (formData.get('submission_id') as string)?.trim();

		if (!submissionId) return fail(400, { error: 'Submission ID is required.' });

		const { error: deleteError } = await locals.supabase
			.from('submissions')
			.delete()
			.eq('id', submissionId)
			.eq('user_id', user.id);

		if (deleteError) return fail(500, { error: `Failed to delete: ${deleteError.message}` });

		return { success: true };
	}
};
