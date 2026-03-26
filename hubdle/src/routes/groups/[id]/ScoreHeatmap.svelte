<script lang="ts">
	import Avatar from '$lib/components/Avatar.svelte';

	type Game = { id: string; name: string; url: string; score_direction: string };
	type Submission = { user_id: string; score: number; game_id: string; game_date: string };
	type Member = {
		user_id: string;
		left_at: string | null;
		profiles: { username: string; avatar_url: string | null } | null;
	};

	let {
		games,
		submissions,
		members
	}: { games: Game[]; submissions: Submission[]; members: Member[] } = $props();

	const today = new Date().toISOString().slice(0, 10);

	let activeMembers = $derived(members.filter((m) => m.left_at === null));

	// Map of "userId:gameId" -> score for today
	let todaysScores = $derived.by(() => {
		const map = new Map<string, number>();
		for (const sub of submissions) {
			if (sub.game_date === today) {
				map.set(`${sub.user_id}:${sub.game_id}`, sub.score);
			}
		}
		return map;
	});

	// Per-game rank info: min and max scores among today's submissions
	let gameRanges = $derived.by(() => {
		const ranges = new Map<string, { min: number; max: number }>();
		for (const sub of submissions) {
			if (sub.game_date !== today) continue;
			const range = ranges.get(sub.game_id);
			if (!range) {
				ranges.set(sub.game_id, { min: sub.score, max: sub.score });
			} else {
				range.min = Math.min(range.min, sub.score);
				range.max = Math.max(range.max, sub.score);
			}
		}
		return ranges;
	});

	// Sort members: those with more submissions today first, then alphabetically
	let sortedMembers = $derived.by(() => {
		return [...activeMembers].sort((a, b) => {
			const aCount = games.filter((g) => todaysScores.has(`${a.user_id}:${g.id}`)).length;
			const bCount = games.filter((g) => todaysScores.has(`${b.user_id}:${g.id}`)).length;
			if (bCount !== aCount) return bCount - aCount;
			return (a.profiles?.username ?? '').localeCompare(b.profiles?.username ?? '');
		});
	});

	let submittedCount = $derived(
		activeMembers.filter((m) => games.some((g) => todaysScores.has(`${m.user_id}:${g.id}`))).length
	);

	/**
	 * Returns a CSS color for a score cell.
	 * Green = best, red = worst, interpolated between.
	 * Accounts for score_direction: 'asc' means lower is better.
	 */
	function getCellColor(gameId: string, score: number): string {
		const range = gameRanges.get(gameId);
		if (!range || range.min === range.max) return 'oklch(0.75 0.18 142)'; // green if only one score

		const game = games.find((g) => g.id === gameId);
		const ascending = game?.score_direction === 'asc';

		// Normalize: 0 = best, 1 = worst
		let t: number;
		if (ascending) {
			// Lower is better: min = best (0), max = worst (1)
			t = (score - range.min) / (range.max - range.min);
		} else {
			// Higher is better: max = best (0), min = worst (1)
			t = (range.max - score) / (range.max - range.min);
		}

		// Interpolate hue from green (142) to red (25) in oklch
		const hue = 142 - t * 117;
		return `oklch(0.75 0.18 ${hue})`;
	}
</script>

{#if activeMembers.length > 0 && games.length > 0}
	<section class="card mt-6 border border-base-300">
		<div class="card-body">
			<h2 class="card-title text-base">
				Today
				<span class="badge badge-sm">{submittedCount}/{activeMembers.length}</span>
			</h2>

			{#if submittedCount === 0}
				<p class="text-sm opacity-60">No one has submitted yet today.</p>
			{:else}
				<div class="overflow-x-auto">
					<table class="table table-sm">
						<thead>
							<tr>
								<th>Player</th>
								{#each games as game}
									<th class="text-center">
										{#if game.url}
											<a
												href={game.url}
												target="_blank"
												rel="noopener noreferrer"
												class="hover:underline">{game.name}</a
											>
										{:else}
											{game.name}
										{/if}
									</th>
								{/each}
							</tr>
						</thead>
						<tbody>
							{#each sortedMembers as member}
								{@const hasAnyScore = games.some((g) =>
									todaysScores.has(`${member.user_id}:${g.id}`)
								)}
								{#if hasAnyScore}
									<tr>
										<td>
											<a
												href="/users/{member.profiles?.username ?? ''}"
												class="flex items-center gap-2 hover:underline"
											>
												<Avatar
													src={member.profiles?.avatar_url}
													username={member.profiles?.username ?? 'Unknown'}
													size="xs"
												/>
												<span class="truncate">{member.profiles?.username ?? 'Unknown'}</span>
											</a>
										</td>
										{#each games as game}
											{@const score = todaysScores.get(`${member.user_id}:${game.id}`)}
											<td class="text-center">
												{#if score !== undefined}
													<span
														class="inline-flex h-7 min-w-[2rem] items-center justify-center rounded px-1.5 text-xs font-semibold"
														style="background-color: {getCellColor(
															game.id,
															score
														)}; color: oklch(0.2 0 0)"
													>
														{score}
													</span>
												{:else}
													<span
														class="inline-flex h-7 min-w-[2rem] items-center justify-center rounded bg-base-300 px-1.5 text-xs opacity-30"
													>
														—
													</span>
												{/if}
											</td>
										{/each}
									</tr>
								{/if}
							{/each}
							{#each sortedMembers as member}
								{@const hasAnyScore = games.some((g) =>
									todaysScores.has(`${member.user_id}:${g.id}`)
								)}
								{#if !hasAnyScore}
									<tr class="opacity-40">
										<td>
											<a
												href="/users/{member.profiles?.username ?? ''}"
												class="flex items-center gap-2 hover:underline"
											>
												<Avatar
													src={member.profiles?.avatar_url}
													username={member.profiles?.username ?? 'Unknown'}
													size="xs"
												/>
												<span class="truncate">{member.profiles?.username ?? 'Unknown'}</span>
											</a>
										</td>
										{#each games as game}
											<td class="text-center">
												<span
													class="inline-flex h-7 min-w-[2rem] items-center justify-center rounded bg-base-300 px-1.5 text-xs opacity-30"
												>
													—
												</span>
											</td>
										{/each}
									</tr>
								{/if}
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
		</div>
	</section>
{/if}
