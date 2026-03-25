<script lang="ts">
	import { enhance } from '$app/forms';
	import { GAME_RULES } from '$lib/game-rules';
	import Avatar from '$lib/components/Avatar.svelte';

	type Submission = {
		id: string;
		user_id: string;
		score: number;
		game_id: string;
		game_date: string;
		raw_text: string;
		games: { name: string } | null;
	};
	type Member = { user_id: string; left_at: string | null; profiles: { username: string; avatar_url: string | null } | null };

	let {
		submissions,
		members,
		userId
	}: { submissions: Submission[]; members: Member[]; userId: string } = $props();

	let editingId = $state<string | null>(null);
	let editScore = $state(0);
	let deletingId = $state<string | null>(null);
	let savingId = $state<string | null>(null);
	let confirmingDeleteId = $state<string | null>(null);

	function startEdit(sub: Submission) {
		editingId = sub.id;
		editScore = sub.score;
	}

	function cancelEdit() {
		editingId = null;
	}

	function confirmDelete(id: string) {
		deletingId = id;
	}

	function cancelDelete() {
		deletingId = null;
	}
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
							<th></th>
						</tr>
					</thead>
					<tbody>
						{#each submissions as sub}
							{@const member = members.find((m) => m.user_id === sub.user_id)}
							{@const isOwn = sub.user_id === userId}
							{@const rules = GAME_RULES[sub.game_id]}
							<tr>
								<td>
									<a href="/users/{member?.profiles?.username ?? ''}" class="flex items-center gap-2 hover:underline">
										<Avatar src={member?.profiles?.avatar_url} username={member?.profiles?.username ?? 'Unknown'} size="xs" />
										{member?.profiles?.username ?? 'Unknown'}{#if member?.left_at} <span class="opacity-40 text-xs">(left)</span>{/if}
									</a>
								</td>
								<td>{sub.games?.name ?? sub.game_id}</td>
								<td>
									{#if editingId === sub.id}
										<input
											type="number"
											class="input input-bordered input-xs w-20"
											min={rules?.minScore ?? 0}
											max={rules?.maxScore ?? 999}
											bind:value={editScore}
										/>
									{:else}
										{sub.score}
									{/if}
								</td>
								<td>{sub.game_date}</td>
								<td>
									{#if isOwn}
										{#if editingId === sub.id}
											<form method="POST" action="?/editSubmission" use:enhance={() => {
												savingId = sub.id;
												return async ({ update }) => {
													editingId = null;
													savingId = null;
													await update();
												};
											}}>
												<input type="hidden" name="submission_id" value={sub.id} />
												<input type="hidden" name="game_id" value={sub.game_id} />
												<input type="hidden" name="score" value={editScore} />
												<div class="flex gap-1">
													<button type="submit" class="btn btn-success btn-xs" disabled={savingId === sub.id}>
														{#if savingId === sub.id}<span class="loading loading-spinner loading-xs"></span>{/if}
														Save
													</button>
													<button type="button" class="btn btn-ghost btn-xs" onclick={cancelEdit}>Cancel</button>
												</div>
											</form>
										{:else if deletingId === sub.id}
											<form method="POST" action="?/deleteSubmission" use:enhance={() => {
												confirmingDeleteId = sub.id;
												return async ({ update }) => {
													deletingId = null;
													confirmingDeleteId = null;
													await update();
												};
											}}>
												<input type="hidden" name="submission_id" value={sub.id} />
												<div class="flex gap-1">
													<button type="submit" class="btn btn-error btn-xs" disabled={confirmingDeleteId === sub.id}>
														{#if confirmingDeleteId === sub.id}<span class="loading loading-spinner loading-xs"></span>{/if}
														Confirm
													</button>
													<button type="button" class="btn btn-ghost btn-xs" onclick={cancelDelete}>Cancel</button>
												</div>
											</form>
										{:else}
											<div class="flex gap-1">
												<button type="button" class="btn btn-ghost btn-xs" onclick={() => startEdit(sub)}>Edit</button>
												<button type="button" class="btn btn-ghost btn-xs text-error" onclick={() => confirmDelete(sub.id)}>Delete</button>
											</div>
										{/if}
									{/if}
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</div>
</section>
