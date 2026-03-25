<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';

	type Game = { id: string; name: string; url: string; score_direction: string };
	type Submission = { user_id: string; score: number; game_id: string; game_date: string };
	type Member = { user_id: string; left_at: string | null; profiles: { username: string; avatar_url: string | null } | null };

	const TimeFilter = {
		All: 'all',
		Monthly: 'monthly',
		Weekly: 'weekly',
		Daily: 'daily'
	} as const;
	type TimeFilter = (typeof TimeFilter)[keyof typeof TimeFilter];

	const GameFilter = {
		All: 'all'
	} as const;

	let {
		games,
		submissions,
		members
	}: { games: Game[]; submissions: Submission[]; members: Member[] } = $props();

	let selectedGame = $state<string>(GameFilter.All);
	let selectedTime = $state<TimeFilter>(TimeFilter.All);

	const timeOptions: { value: TimeFilter; label: string }[] = [
		{ value: TimeFilter.All, label: 'All Time' },
		{ value: TimeFilter.Monthly, label: 'Month' },
		{ value: TimeFilter.Weekly, label: 'Week' },
		{ value: TimeFilter.Daily, label: 'Today' }
	];

	let gameOptions = $derived(
		[{ value: GameFilter.All, label: 'All' }, ...games.map((g) => ({ value: g.id, label: g.name }))]
	);

	let filteredLeaderboard = $derived.by(() => {
		const now = new Date();
		const todayStr = now.toISOString().slice(0, 10);
		const weekAgo = new Date(now);
		weekAgo.setDate(weekAgo.getDate() - 7);
		const weekAgoStr = weekAgo.toISOString().slice(0, 10);
		const monthAgo = new Date(now);
		monthAgo.setDate(monthAgo.getDate() - 30);
		const monthAgoStr = monthAgo.toISOString().slice(0, 10);

		const filtered = submissions.filter((sub) => {
			if (selectedGame !== GameFilter.All && sub.game_id !== selectedGame) return false;
			if (selectedTime === TimeFilter.Daily && sub.game_date !== todayStr) return false;
			if (selectedTime === TimeFilter.Weekly && sub.game_date < weekAgoStr) return false;
			if (selectedTime === TimeFilter.Monthly && sub.game_date < monthAgoStr) return false;
			return true;
		});

		const userInfo = new Map<string, { username: string; avatarUrl: string | null; left: boolean }>();
		for (const member of members) {
			if (member.profiles) {
				userInfo.set(member.user_id, { username: member.profiles.username, avatarUrl: member.profiles.avatar_url, left: member.left_at !== null });
			}
		}

		if (selectedGame !== GameFilter.All) {
			// Single game: sum raw scores
			const scores = new Map<string, { total: number; games: number }>();
			for (const sub of filtered) {
				const entry = scores.get(sub.user_id) ?? { total: 0, games: 0 };
				entry.total += sub.score;
				entry.games += 1;
				scores.set(sub.user_id, entry);
			}

			const gameData = games.find((g) => g.id === selectedGame);
			const ascending = gameData ? gameData.score_direction === 'asc' : true;

			return [...scores.entries()]
				.map(([userId, d]) => ({ userId, ...userInfo.get(userId)!, ...d }))
				.filter((e) => e.games > 0)
				.sort((a, b) => ascending ? a.total - b.total : b.total - a.total);
		}

		// All games: rank players per game, then sum ranks
		const byGame = new Map<string, Map<string, number>>();
		for (const sub of filtered) {
			if (!byGame.has(sub.game_id)) byGame.set(sub.game_id, new Map());
			const gameScores = byGame.get(sub.game_id)!;
			gameScores.set(sub.user_id, (gameScores.get(sub.user_id) ?? 0) + sub.score);
		}

		const rankSums = new Map<string, { total: number; games: number }>();
		for (const [gameId, gameScores] of byGame) {
			const gameData = games.find((g) => g.id === gameId);
			const ascending = gameData ? gameData.score_direction === 'asc' : true;

			const sorted = [...gameScores.entries()]
				.sort(([, a], [, b]) => ascending ? a - b : b - a);

			for (let i = 0; i < sorted.length; i++) {
				const [userId] = sorted[i];
				const entry = rankSums.get(userId) ?? { total: 0, games: 0 };
				entry.total += i + 1;
				entry.games += 1;
				rankSums.set(userId, entry);
			}
		}

		return [...rankSums.entries()]
			.map(([userId, d]) => ({ userId, ...userInfo.get(userId)!, ...d }))
			.filter((e) => e.games > 0)
			.sort((a, b) => a.total - b.total);
	});
</script>

{#snippet filterGroup(label: string, options: { value: string; label: string }[], selected: string, onSelect: (value: string) => void)}
	<div>
		<p class="mb-1 text-xs font-medium opacity-50">{label}</p>
		<div class="flex flex-wrap gap-1">
			{#each options as opt}
				<button
					class="btn btn-sm {selected === opt.value ? 'btn-active' : 'btn-ghost'}"
					onclick={() => onSelect(opt.value)}
				>
					{opt.label}
				</button>
			{/each}
		</div>
	</div>
{/snippet}

<section class="card mt-6 border border-base-300">
	<div class="card-body">
	<h2 class="card-title text-base">Leaderboard</h2>

	<div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
		{@render filterGroup('Game', gameOptions, selectedGame, (v) => (selectedGame = v))}

		<div class="hidden sm:block sm:self-stretch">
			<div class="h-full w-px bg-base-300"></div>
		</div>
		<hr class="border-base-300 sm:hidden" />

		{@render filterGroup('Period', timeOptions, selectedTime, (v) => (selectedTime = v as TimeFilter))}
	</div>

	{#if filteredLeaderboard.length === 0}
		<p class="mt-4 opacity-70">
			{selectedGame === GameFilter.All && selectedTime === TimeFilter.All
				? 'No scores yet — submit one above to get started!'
				: 'No scores for this selection.'}
		</p>
	{:else}
		<div class="mt-4 overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>#</th>
						<th>Player</th>
						<th>Games</th>
						<th>{selectedGame === GameFilter.All ? 'Rank Sum' : 'Total'}</th>
						<th>{selectedGame === GameFilter.All ? 'Avg Rank' : 'Avg'}</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredLeaderboard as entry, i}
						<tr class={i === 0 ? 'bg-base-300 font-semibold' : ''}>
							<td>{i + 1}</td>
							<td>
								<a href="/users/{entry.username}" class="flex items-center gap-2 hover:underline">
									<Avatar src={entry.avatarUrl} username={entry.username} size="xs" />
									{entry.username}{#if entry.left} <span class="opacity-40 text-xs">(left)</span>{/if}
								</a>
							</td>
							<td>{entry.games}</td>
							<td>{entry.total}</td>
							<td>{(entry.total / entry.games).toFixed(1)}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
	</div>
</section>
