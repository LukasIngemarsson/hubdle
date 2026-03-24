<script lang="ts">
	type Submission = {
		user_id: string;
		score: number;
		game_id: string;
		game_date: string;
		games: { name: string } | null;
	};
	type Member = { user_id: string; left_at: string | null; profiles: { username: string } | null };

	let { submissions, members }: { submissions: Submission[]; members: Member[] } = $props();
</script>

<section class="card mt-6 border border-base-300">
	<div class="card-body">
		<h2 class="card-title text-base">Recent Submissions</h2>
		{#if submissions.length === 0}
			<p class="opacity-70">No submissions yet — paste a share text above to submit your first score.</p>
		{:else}
			<div class="overflow-x-auto">
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
								<td>{member?.profiles?.username ?? 'Unknown'}{#if member?.left_at} <span class="opacity-40 text-xs">(left)</span>{/if}</td>
								<td>{sub.games?.name ?? sub.game_id}</td>
								<td>{sub.score}</td>
								<td>{sub.game_date}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>
