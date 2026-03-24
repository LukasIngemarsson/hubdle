<script lang="ts">
	type Game = { id: string; name: string; url: string; score_direction: string };
	type Submission = { user_id: string; score: number; game_id: string; game_date: string };
	type Member = { user_id: string; profiles: { username: string } | null };
	type TimeFilter = 'all' | 'monthly' | 'weekly' | 'daily';

	let {
		games,
		submissions,
		members
	}: { games: Game[]; submissions: Submission[]; members: Member[] } = $props();

	let selectedGame = $state<string>('all');
	let selectedTime = $state<TimeFilter>('all');

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
			if (selectedGame !== 'all' && sub.game_id !== selectedGame) return false;
			if (selectedTime === 'daily' && sub.game_date !== todayStr) return false;
			if (selectedTime === 'weekly' && sub.game_date < weekAgoStr) return false;
			if (selectedTime === 'monthly' && sub.game_date < monthAgoStr) return false;
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

<section class="card mt-6 border border-base-300">
	<div class="card-body">
	<h2 class="card-title text-base">Leaderboard</h2>

	<div class="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
		<div>
			<p class="mb-1 text-xs font-medium opacity-50">Game</p>
			<div class="flex flex-wrap gap-1">
				<button
					class="btn btn-sm {selectedGame === 'all' ? 'btn-active' : 'btn-ghost'}"
					onclick={() => (selectedGame = 'all')}
				>
					All
				</button>
				{#each games as game}
					<button
						class="btn btn-sm {selectedGame === game.id ? 'btn-active' : 'btn-ghost'}"
						onclick={() => (selectedGame = game.id)}
					>
						{game.name}
					</button>
				{/each}
			</div>
		</div>

		<div class="hidden sm:block sm:self-stretch">
			<div class="h-full w-px bg-base-300"></div>
		</div>
		<hr class="border-base-300 sm:hidden" />

		<div>
			<p class="mb-1 text-xs font-medium opacity-50">Period</p>
			<div class="flex flex-wrap gap-1">
				<button
					class="btn btn-sm {selectedTime === 'all' ? 'btn-active' : 'btn-ghost'}"
					onclick={() => (selectedTime = 'all')}
				>
					All Time
				</button>
				<button
					class="btn btn-sm {selectedTime === 'monthly' ? 'btn-active' : 'btn-ghost'}"
					onclick={() => (selectedTime = 'monthly')}
				>
					Month
				</button>
				<button
					class="btn btn-sm {selectedTime === 'weekly' ? 'btn-active' : 'btn-ghost'}"
					onclick={() => (selectedTime = 'weekly')}
				>
					Week
				</button>
				<button
					class="btn btn-sm {selectedTime === 'daily' ? 'btn-active' : 'btn-ghost'}"
					onclick={() => (selectedTime = 'daily')}
				>
					Today
				</button>
			</div>
		</div>
	</div>

	{#if filteredLeaderboard.length === 0}
		<p class="mt-4 opacity-70">
			{selectedGame === 'all' && selectedTime === 'all'
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
