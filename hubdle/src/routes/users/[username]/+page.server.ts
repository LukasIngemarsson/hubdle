import { error, fail, redirect } from '@sveltejs/kit';
import { GAME_RULES, validateScore } from '$lib/game-rules';
import { ensureProfile } from '$lib/auth';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { user } = await locals.safeGetSession();

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('id, username, avatar_url, created_at')
		.eq('username', params.username)
		.single();

	if (!profile) error(404, 'User not found');

	const isOwnProfile = user?.id === profile.id;

	const { count: totalGroups } = await locals.supabase
		.from('group_members')
		.select('group_id', { count: 'exact', head: true })
		.eq('user_id', profile.id)
		.is('left_at', null);

	const { data: submissions } = await locals.supabase
		.from('submissions')
		.select('id, score, game_id, game_date, games(name, score_direction)')
		.eq('user_id', profile.id)
		.order('game_date', { ascending: false })
		.order('created_at', { ascending: false });

	const allSubs = submissions ?? [];

	// Per-game stats
	const gameMap = new Map<string, { name: string; scoreDirection: string; scores: number[] }>();
	for (const sub of allSubs) {
		const existing = gameMap.get(sub.game_id);
		if (existing) {
			existing.scores.push(sub.score);
		} else {
			gameMap.set(sub.game_id, {
				name: sub.games?.name ?? sub.game_id,
				scoreDirection: sub.games?.score_direction ?? 'asc',
				scores: [sub.score]
			});
		}
	}

	const perGameStats = [...gameMap.entries()]
		.map(([gameId, data]) => {
			const { scores, name, scoreDirection } = data;
			const total = scores.reduce((a, b) => a + b, 0);
			const avg = total / scores.length;
			const best = scoreDirection === 'asc' ? Math.min(...scores) : Math.max(...scores);
			const rules = GAME_RULES[gameId];
			let barPct = 50;
			if (rules) {
				const range = rules.maxScore - rules.minScore;
				if (range > 0) {
					barPct =
						scoreDirection === 'asc'
							? (1 - (avg - rules.minScore) / range) * 100
							: ((avg - rules.minScore) / range) * 100;
				}
			}
			return {
				gameId,
				name,
				count: scores.length,
				best,
				avg: Math.round(avg * 10) / 10,
				scoreDirection,
				barPct: Math.max(5, Math.min(100, Math.round(barPct)))
			};
		})
		.sort((a, b) => b.count - a.count);

	// Active streak: consecutive days with at least one submission.
	// The streak stays alive until a full day is missed — if the user
	// hasn't played today yet the streak still counts from yesterday.
	let streak = 0;
	if (allSubs.length > 0) {
		const uniqueDates = [...new Set(allSubs.map((s) => s.game_date))].sort().reverse();
		const today = new Date().toISOString().slice(0, 10);
		const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

		if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
			streak = 1;
			let checkDate = uniqueDates[0];
			for (let i = 1; i < uniqueDates.length; i++) {
				const prev = new Date(checkDate);
				prev.setDate(prev.getDate() - 1);
				const prevStr = prev.toISOString().slice(0, 10);
				if (uniqueDates[i] === prevStr) {
					streak++;
					checkDate = prevStr;
				} else {
					break;
				}
			}
		}
	}

	// Last 7 days of scores for heatmap
	const sevenDaysAgo = new Date();
	sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
	const sevenDaysAgoStr = sevenDaysAgo.toISOString().slice(0, 10);
	const recentScores = allSubs
		.filter((sub) => sub.game_date >= sevenDaysAgoStr)
		.map((sub) => ({
			gameId: sub.game_id,
			score: sub.score,
			gameDate: sub.game_date
		}));

	// Recent activity
	const recentActivity = allSubs.map((sub) => ({
		id: sub.id,
		gameId: sub.game_id,
		gameName: sub.games?.name ?? sub.game_id,
		score: sub.score,
		gameDate: sub.game_date
	}));

	// Favorite game (most played)
	const favoriteGame =
		perGameStats.length > 0 ? { id: perGameStats[0].gameId, name: perGameStats[0].name } : null;

	// Friendship status with viewing user (only for other users when logged in)
	let friendship: { id: string; status: string; direction: 'outgoing' | 'incoming' } | null = null;
	if (user && !isOwnProfile) {
		const { data: existing } = await locals.supabase
			.from('friendships')
			.select('id, requester_id, status')
			.or(
				`and(requester_id.eq.${user.id},addressee_id.eq.${profile.id}),and(requester_id.eq.${profile.id},addressee_id.eq.${user.id})`
			)
			.maybeSingle();

		if (existing) {
			friendship = {
				id: existing.id,
				status: existing.status,
				direction: existing.requester_id === user.id ? 'outgoing' : 'incoming'
			};
		}
	}

	// Friend count
	const { count: friendCountAsReq } = await locals.supabase
		.from('friendships')
		.select('id', { count: 'exact', head: true })
		.eq('requester_id', profile.id)
		.eq('status', 'accepted');
	const { count: friendCountAsAddr } = await locals.supabase
		.from('friendships')
		.select('id', { count: 'exact', head: true })
		.eq('addressee_id', profile.id)
		.eq('status', 'accepted');
	const friendCount = (friendCountAsReq ?? 0) + (friendCountAsAddr ?? 0);

	return {
		profile: {
			id: profile.id,
			username: profile.username,
			avatarUrl: profile.avatar_url,
			createdAt: profile.created_at
		},
		isOwnProfile,
		friendship,
		stats: {
			streak,
			favoriteGame,
			friendCount
		},
		perGameStats,
		recentScores,
		recentActivity
	};
};

export const actions: Actions = {
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

	sendRequest: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const addresseeId = (formData.get('addressee_id') as string)?.trim();

		if (!addresseeId) return fail(400, { error: 'User ID is required.' });
		if (addresseeId === user.id) return fail(400, { error: 'You cannot add yourself.' });

		await ensureProfile(locals.supabase, user);

		const { error: insertError } = await locals.supabase
			.from('friendships')
			.insert({ requester_id: user.id, addressee_id: addresseeId });

		if (insertError) {
			if (insertError.code === '23505')
				return fail(409, { error: 'Friend request already exists.' });
			return fail(500, { error: `Failed to send request: ${insertError.message}` });
		}

		return { success: true };
	},

	acceptRequest: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const friendshipId = (formData.get('friendship_id') as string)?.trim();

		if (!friendshipId) return fail(400, { error: 'Friendship ID is required.' });

		const { error: updateError } = await locals.supabase
			.from('friendships')
			.update({ status: 'accepted', updated_at: new Date().toISOString() })
			.eq('id', friendshipId)
			.eq('addressee_id', user.id)
			.eq('status', 'pending');

		if (updateError)
			return fail(500, { error: `Failed to accept request: ${updateError.message}` });

		return { success: true };
	},

	cancelRequest: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) redirect(303, '/login');

		const formData = await request.formData();
		const friendshipId = (formData.get('friendship_id') as string)?.trim();

		if (!friendshipId) return fail(400, { error: 'Friendship ID is required.' });

		const { error: deleteError } = await locals.supabase
			.from('friendships')
			.delete()
			.eq('id', friendshipId);

		if (deleteError)
			return fail(500, { error: `Failed to cancel request: ${deleteError.message}` });

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
