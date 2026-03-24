<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from './Alert.svelte';
	import { GAME_RULES } from '$lib/game-rules';

	type Game = { id: string; name: string };

	let {
		form,
		games
	}: { form: { error?: string; success?: boolean } | null; games: Game[] } = $props();

	const SubmitMode = { Paste: 'paste', Manual: 'manual' } as const;
	type SubmitMode = (typeof SubmitMode)[keyof typeof SubmitMode];

	let mode = $state<SubmitMode>(SubmitMode.Manual);
	let rawText = $state('');
	let gameId = $state('');
	let score = $state('');
	const today = new Date().toISOString().slice(0, 10);
	let gameDate = $state(today);

	let selectedRules = $derived(gameId ? GAME_RULES[gameId] : null);

	$effect(() => {
		if (form?.success) {
			rawText = '';
			score = '';
		}
	});
</script>

<section class="card mt-6 bg-base-200">
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
			<form method="POST" action="?/submit" use:enhance class="flex flex-col gap-3">
				<textarea
					name="raw_text"
					placeholder="Paste your share text here (e.g. Wordle 1,234 3/6)"
					class="textarea textarea-bordered w-full"
					rows="3"
					required
					bind:value={rawText}
				></textarea>
				<button class="btn btn-primary w-fit">Submit</button>
			</form>
		{:else}
			<form method="POST" action="?/submitManual" use:enhance class="flex flex-col gap-3">
				<select name="game_id" class="select select-bordered w-full" required bind:value={gameId}>
					<option value="" disabled>Select a game</option>
					{#each games as game}
						<option value={game.id}>{game.name}</option>
					{/each}
				</select>
				{#if selectedRules}
					<div class="text-xs opacity-60">{selectedRules.hint}</div>
				{/if}
				<input
					name="score"
					type="number"
					placeholder={selectedRules?.scoreLabel ?? 'Score'}
					class="input input-bordered w-full"
					required
					min={selectedRules?.minScore}
					max={selectedRules?.maxScore}
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
				<button class="btn btn-primary w-fit">Submit</button>
			</form>
		{/if}

		{#if form?.error}
			<Alert type="error" message={form.error} />
		{/if}
		{#if form?.success}
			<Alert type="success" message="Score submitted!" />
		{/if}
	</div>
</section>
