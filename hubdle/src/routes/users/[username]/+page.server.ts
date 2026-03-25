import { error } from '@sveltejs/kit';
import { GAME_RULES } from '$lib/game-rules';
import type { PageServerLoad } from './$types';

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
		.select('score, game_id, game_date, games(name, score_direction)')
		.eq('user_id', profile.id)
		.order('game_date', { ascending: false });

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

	const perGameStats = [...gameMap.entries()].map(([gameId, data]) => {
		const { scores, name, scoreDirection } = data;
		const total = scores.reduce((a, b) => a + b, 0);
		const avg = total / scores.length;
		const best = scoreDirection === 'asc'
			? Math.min(...scores)
			: Math.max(...scores);
		const rules = GAME_RULES[gameId];
		let barPct = 50;
		if (rules) {
			const range = rules.maxScore - rules.minScore;
			if (range > 0) {
				barPct = scoreDirection === 'asc'
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
	}).sort((a, b) => b.count - a.count);

	// Active streak: consecutive days with submissions up to today
	let streak = 0;
	if (allSubs.length > 0) {
		const uniqueDates = [...new Set(allSubs.map((s) => s.game_date))].sort().reverse();
		const today = new Date().toISOString().slice(0, 10);

		// Start from today or the most recent submission date
		let checkDate = today;
		if (uniqueDates[0] === checkDate) {
			streak = 1;
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

	// Recent activity (last 15)
	const recentActivity = allSubs.slice(0, 15).map((sub) => ({
		gameName: sub.games?.name ?? sub.game_id,
		score: sub.score,
		gameDate: sub.game_date
	}));

	return {
		profile: {
			username: profile.username,
			avatarUrl: profile.avatar_url,
			createdAt: profile.created_at
		},
		isOwnProfile,
		stats: {
			totalSubmissions: allSubs.length,
			totalGroups: totalGroups ?? 0,
			streak
		},
		perGameStats,
		recentActivity
	};
};
