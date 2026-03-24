<script lang="ts">
	type Game = { id: string; name: string; url: string; score_direction: string };
	type Submission = { user_id: string; score: number; game_id: string; game_date: string };
	type Member = { user_id: string; profiles: { username: string } | null };

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

		const scores = new Map<string, { username: string; total: number; games: number }>();
		for (const member of members) {
			if (member.profiles) {
				scores.set(member.user_id, { username: member.profiles.username, total: 0, games: 0 });
			}
		}

		for (const sub of filtered) {
			const entry = scores.get(sub.user_id);
			if (entry) {
				entry.total += sub.score;
				entry.games += 1;
			}
		}

		const selectedGameData = games.find((g) => g.id === selectedGame);
		const ascending = selectedGameData ? selectedGameData.score_direction === 'asc' : true;

		return [...scores.entries()]
			.map(([userId, d]) => ({ userId, ...d }))
			.filter((e) => e.games > 0)
			.sort((a, b) => ascending ? a.total - b.total : b.total - a.total);
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
						<th>Total</th>
						<th>Avg</th>
					</tr>
				</thead>
				<tbody>
					{#each filteredLeaderboard as entry, i}
						<tr class={i === 0 ? 'bg-base-300 font-semibold' : ''}>
							<td>{i + 1}</td>
							<td>{entry.username}</td>
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
