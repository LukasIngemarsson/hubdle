<script lang="ts">
	import { GAME_RULES } from '$lib/game-rules';
	import { GAME_ICONS } from '$lib/game-icons';

	type GameStat = {
		gameId: string;
		name: string;
		scoreDirection: string;
	};
	type Submission = {
		gameId: string;
		score: number;
		gameDate: string;
	};

	let {
		games,
		submissions
	}: {
		games: GameStat[];
		submissions: Submission[];
	} = $props();

	// Last 7 days, oldest first (left to right)
	let days = $derived.by(() => {
		const result: string[] = [];
		const now = new Date();
		for (let i = 6; i >= 0; i--) {
			const d = new Date(now);
			d.setDate(d.getDate() - i);
			result.push(d.toISOString().slice(0, 10));
		}
		return result;
	});

	let dayLabels = $derived(
		days.map((d) => {
			const date = new Date(d + 'T00:00:00');
			return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
		})
	);

	// Map of "gameId:date" -> score
	let scoreMap = $derived.by(() => {
		const map = new Map<string, number>();
		for (const sub of submissions) {
			map.set(`${sub.gameId}:${sub.gameDate}`, sub.score);
		}
		return map;
	});

	// Per-game best/worst scores across all submissions (for color range)
	let gameRanges = $derived.by(() => {
		const ranges = new Map<string, { min: number; max: number }>();
		for (const sub of submissions) {
			const range = ranges.get(sub.gameId);
			if (!range) {
				ranges.set(sub.gameId, { min: sub.score, max: sub.score });
			} else {
				range.min = Math.min(range.min, sub.score);
				range.max = Math.max(range.max, sub.score);
			}
		}
		return ranges;
	});

	function getCellColor(gameId: string, score: number): string {
		const game = games.find((g) => g.gameId === gameId);
		const ascending = game?.scoreDirection === 'asc';
		const rules = GAME_RULES[gameId];
		const range = gameRanges.get(gameId);

		// Use game rules if available, otherwise fall back to observed range
		const min = rules?.minScore ?? range?.min ?? score;
		const max = rules?.maxScore ?? range?.max ?? score;

		if (min === max) return 'oklch(0.75 0.18 142)';

		let t: number;
		if (ascending) {
			t = (score - min) / (max - min);
		} else {
			t = (max - score) / (max - min);
		}
		t = Math.max(0, Math.min(1, t));

		const hue = 142 - t * 117;
		return `oklch(0.75 0.18 ${hue})`;
	}
</script>

{#if games.length > 0}
	<div class="card border border-base-300">
		<div class="card-body">
			<h2 class="card-title text-base">Last 7 Days</h2>
			<div class="overflow-x-auto">
				<table class="table table-sm">
					<thead>
						<tr>
							<th>Game</th>
							{#each dayLabels as label}
								<th class="text-center text-xs">{label}</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each games as game}
							{@const hasAnyScore = days.some((d) => scoreMap.has(`${game.gameId}:${d}`))}
							{#if hasAnyScore}
								<tr>
									<td>
										<span class="inline-flex items-center gap-1.5 font-medium">
											{#if GAME_ICONS[game.gameId]}<img
													src={GAME_ICONS[game.gameId]}
													alt=""
													class="h-4 w-4 rounded-sm"
												/>{/if}
											{game.name}
										</span>
									</td>
									{#each days as day}
										{@const score = scoreMap.get(`${game.gameId}:${day}`)}
										<td class="text-center">
											{#if score !== undefined}
												<span
													class="inline-flex h-7 w-12 items-center justify-center rounded text-xs font-semibold"
													style="background-color: {getCellColor(
														game.gameId,
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
					</tbody>
				</table>
			</div>
		</div>
	</div>
{/if}
