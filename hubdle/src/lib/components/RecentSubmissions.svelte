<script lang="ts">
	type Submission = {
		user_id: string;
		score: number;
		game_id: string;
		game_date: string;
		games: { name: string } | null;
	};
	type Member = { user_id: string; profiles: { username: string } | null };

	let { submissions, members }: { submissions: Submission[]; members: Member[] } = $props();
</script>

<section class="mt-8">
	<h2 class="text-lg font-semibold">Recent Submissions</h2>
	{#if submissions.length === 0}
		<p class="mt-2 opacity-70">No submissions yet.</p>
	{:else}
		<div class="mt-4 overflow-x-auto">
			<table class="table">
				<thead>
					<tr>
						<th>Player</th>
						<th>Game</th>
						<th>Score</th>
						<th>Date</th>
					</tr>
				</thead>
				<tbody>
					{#each submissions as sub}
						{@const member = members.find((m) => m.user_id === sub.user_id)}
						<tr>
							<td>{member?.profiles?.username ?? 'Unknown'}</td>
							<td>{sub.games?.name ?? sub.game_id}</td>
							<td>{sub.score}</td>
							<td>{sub.game_date}</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>
