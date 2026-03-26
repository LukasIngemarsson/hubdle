<script lang="ts">
	import { enhance } from '$app/forms';
	import { GAME_RULES } from '$lib/game-rules';
	import { GAME_ICONS } from '$lib/game-icons';
	import { toasts } from '$lib/stores/toast.svelte';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ExternalLinkIcon from '$lib/components/icons/ExternalLinkIcon.svelte';
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
	import ActivityRow from '$lib/components/ActivityRow.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let playedSet = $derived(new Set(data.playedToday));

	let editingId = $state<string | null>(null);
	let editScore = $state(0);
	let deletingId = $state<string | null>(null);

	const PAGE_SIZE = 20;
	let visibleCount = $state(PAGE_SIZE);
	let visibleSubmissions = $derived(data.recentSubmissions.slice(0, visibleCount));
	let hasMore = $derived(data.recentSubmissions.length > visibleCount);

	const SubmitMode = { Paste: 'paste', Manual: 'manual' } as const;
	type SubmitMode = (typeof SubmitMode)[keyof typeof SubmitMode];

	let mode = $state<SubmitMode>(SubmitMode.Manual);
	let rawText = $state('');
	let gameId = $state('');
	let score = $state('');
	const today = new Date().toISOString().slice(0, 10);
	let gameDate = $state(today);
	let submitting = $state(false);

	let selectedRules = $derived(gameId ? GAME_RULES[gameId] : null);

	function handleSubmit() {
		submitting = true;
		return async ({
			result,
			update
		}: {
			result: { type: string; data?: Record<string, unknown> };
			update: () => Promise<void>;
		}) => {
			await update();
			submitting = false;
			if (result.type === 'success') {
				rawText = '';
				score = '';
				gameDate = today;
				toasts.push('success', 'Score submitted!');
			} else if (result.type === 'failure' && result.data?.error) {
				toasts.push('error', result.data.error as string);
			}
		};
	}
</script>

<svelte:head>
	<title>Games - Hubdle</title>
</svelte:head>

<PageContainer>
	<h1 class="text-2xl font-bold">Games</h1>

	<section class="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
		{#each data.games as game}
			<a
				href={game.url}
				target="_blank"
				rel="noopener noreferrer"
				class="flex flex-col items-center gap-2 rounded-lg border p-4 transition-colors {playedSet.has(
					game.id
				)
					? 'border-success/40 bg-success/5'
					: 'border-base-300 hover:bg-base-200'}"
			>
				{#if GAME_ICONS[game.id]}
					<img src={GAME_ICONS[game.id]} alt={game.name} class="h-10 w-10 rounded" />
				{/if}
				<span class="text-sm font-medium">{game.name}</span>
				{#if playedSet.has(game.id)}
					<span class="badge badge-success badge-sm gap-1">
						<CheckIcon class="h-3 w-3" /> Played
					</span>
				{:else}
					<span class="badge badge-ghost badge-sm gap-1">
						<ExternalLinkIcon class="h-3 w-3" /> Play
					</span>
				{/if}
			</a>
		{/each}
	</section>

	<section class="card mt-8 bg-base-200">
		<div class="card-body">
			<div class="flex items-center justify-between">
				<h2 class="card-title text-base">Submit Score</h2>
				<button
					class="btn btn-ghost btn-xs"
					onclick={() => (mode = mode === SubmitMode.Paste ? SubmitMode.Manual : SubmitMode.Paste)}
				>
					{mode === SubmitMode.Paste ? 'Enter manually' : 'Paste share text'}
				</button>
			</div>

			{#if mode === SubmitMode.Paste}
				<form
					method="POST"
					action="?/submit"
					use:enhance={handleSubmit}
					class="flex flex-col gap-3"
				>
					<textarea
						name="raw_text"
						placeholder="Paste your share text here (e.g. Wordle 1,234 3/6)"
						class="textarea textarea-bordered w-full"
						rows="3"
						required
						bind:value={rawText}
					></textarea>
					<button class="btn btn-primary w-fit" disabled={submitting}>
						{#if submitting}<span class="loading loading-spinner loading-sm"></span>{/if}
						Submit
					</button>
				</form>
			{:else}
				<form
					method="POST"
					action="?/submitManual"
					use:enhance={handleSubmit}
					class="flex flex-col gap-3"
				>
					<select name="game_id" class="select select-bordered w-full" required bind:value={gameId}>
						<option value="" disabled>Select a game</option>
						{#each data.games as game}
							<option value={game.id}>{game.name}</option>
						{/each}
					</select>
					{#if selectedRules}
						<div class="text-xs opacity-60">{selectedRules.hint}</div>
					{/if}
					<input
						name="score"
						type="text"
						inputmode="numeric"
						placeholder={selectedRules?.scoreLabel ?? 'Score'}
						class="input input-bordered w-full"
						required
						bind:value={score}
					/>
					<input
						name="game_date"
						type="date"
						class="input input-bordered w-full"
						required
						max={today}
						bind:value={gameDate}
					/>
					<button class="btn btn-primary w-fit" disabled={submitting}>
						{#if submitting}<span class="loading loading-spinner loading-sm"></span>{/if}
						Submit
					</button>
				</form>
			{/if}
		</div>
	</section>

	{#if data.recentSubmissions.length > 0}
		<div class="card mt-6 border border-base-300">
			<div class="card-body">
				<h2 class="card-title text-base">Submissions</h2>
				<div class="overflow-x-auto">
					<table class="table">
						<thead>
							<tr>
								<th>Game</th>
								<th>Score</th>
								<th>Date</th>
								<th class="text-right"></th>
							</tr>
						</thead>
						<tbody>
							{#each visibleSubmissions as activity}
								<ActivityRow
									{activity}
									isOwnProfile={true}
									bind:editingId
									bind:editScore
									bind:deletingId
								/>
							{/each}
						</tbody>
					</table>
				</div>
				{#if hasMore}
					<button
						class="btn btn-ghost btn-sm mt-2 w-full"
						onclick={() => (visibleCount += PAGE_SIZE)}
					>
						Show more
					</button>
				{/if}
			</div>
		</div>
	{/if}
</PageContainer>
