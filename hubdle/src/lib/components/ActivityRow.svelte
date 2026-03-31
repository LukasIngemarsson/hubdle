<script lang="ts">
	import { enhance } from '$app/forms';
	import { GAME_RULES } from '$lib/game-rules';
	import { toasts } from '$lib/stores/toast.svelte';
	import PencilIcon from '$lib/components/icons/PencilIcon.svelte';
	import TrashIcon from '$lib/components/icons/TrashIcon.svelte';

	let {
		activity,
		isOwnProfile,
		editingId = $bindable(null),
		editScore = $bindable(0),
		deletingId = $bindable(null)
	}: {
		activity: { id: string; gameId: string; gameName: string; score: number; gameDate: string };
		isOwnProfile: boolean;
		editingId: string | null;
		editScore: number;
		deletingId: string | null;
	} = $props();

	let savingId = $state<string | null>(null);
	let confirmingDeleteId = $state<string | null>(null);

	let rules = $derived(GAME_RULES[activity.gameId]);
</script>

<tr>
	<td>{activity.gameName}</td>
	<td>
		{#if editingId === activity.id}
			<input
				type="number"
				class="input input-bordered input-xs w-20"
				min={rules?.minScore ?? 0}
				max={rules?.maxScore ?? 999}
				bind:value={editScore}
			/>
		{:else}
			{activity.score}
		{/if}
	</td>
	<td>{activity.gameDate}</td>
	{#if isOwnProfile}
		<td class="text-right">
			{#if editingId === activity.id}
				<form
					method="POST"
					action="?/editSubmission"
					use:enhance={() => {
						savingId = activity.id;
						return async ({ result, update }) => {
							editingId = null;
							savingId = null;
							await update();
							if (result.type === 'success') toasts.push('success', 'Score updated!');
							else if (result.type === 'failure' && result.data?.error)
								toasts.push('error', (result.data as Record<string, unknown>).error as string);
						};
					}}
				>
					<input type="hidden" name="submission_id" value={activity.id} />
					<input type="hidden" name="game_id" value={activity.gameId} />
					<input type="hidden" name="score" value={editScore} />
					<div class="flex justify-end gap-1">
						<button
							type="submit"
							class="btn btn-success btn-xs"
							disabled={savingId === activity.id}
						>
							{#if savingId === activity.id}<span class="loading loading-spinner loading-xs"
								></span>{/if}
							Save
						</button>
						<button type="button" class="btn btn-ghost btn-xs" onclick={() => (editingId = null)}
							>Cancel</button
						>
					</div>
				</form>
			{:else if deletingId === activity.id}
				<form
					method="POST"
					action="?/deleteSubmission"
					use:enhance={() => {
						confirmingDeleteId = activity.id;
						return async ({ result, update }) => {
							deletingId = null;
							confirmingDeleteId = null;
							await update();
							if (result.type === 'success') toasts.push('success', 'Score deleted.');
							else if (result.type === 'failure' && result.data?.error)
								toasts.push('error', (result.data as Record<string, unknown>).error as string);
						};
					}}
				>
					<input type="hidden" name="submission_id" value={activity.id} />
					<div class="flex justify-end gap-1">
						<button
							type="submit"
							class="btn btn-error btn-xs"
							disabled={confirmingDeleteId === activity.id}
						>
							{#if confirmingDeleteId === activity.id}<span
									class="loading loading-spinner loading-xs"
								></span>{/if}
							Confirm
						</button>
						<button type="button" class="btn btn-ghost btn-xs" onclick={() => (deletingId = null)}
							>Cancel</button
						>
					</div>
				</form>
			{:else}
				<div class="flex justify-end gap-1">
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-square"
						aria-label="Edit"
						onclick={() => {
							editingId = activity.id;
							editScore = activity.score;
						}}
					>
						<PencilIcon class="h-3.5 w-3.5 opacity-50" />
					</button>
					<button
						type="button"
						class="btn btn-ghost btn-xs btn-square text-error"
						aria-label="Delete"
						onclick={() => (deletingId = activity.id)}
					>
						<TrashIcon class="h-3.5 w-3.5" />
					</button>
				</div>
			{/if}
		</td>
	{/if}
</tr>
