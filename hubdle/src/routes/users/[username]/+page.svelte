<script lang="ts">
	import { enhance } from '$app/forms';
	import { GAME_RULES } from '$lib/game-rules';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<string | null>(null);
	let editScore = $state(0);
	let deletingId = $state<string | null>(null);
	let savingId = $state<string | null>(null);
	let confirmingDeleteId = $state<string | null>(null);

	function startEdit(activity: { id: string; score: number }) {
		editingId = activity.id;
		editScore = activity.score;
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

	const memberSince = $derived(
		new Date(data.profile.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<PageContainer>
	<div class="flex items-center justify-between gap-4">
		<div class="flex items-center gap-4">
			<Avatar src={data.profile.avatarUrl} username={data.profile.username} size="lg" />
			<div>
				<h1 class="text-2xl font-bold">{data.profile.username}</h1>
				<p class="text-sm opacity-50">Member since {memberSince}</p>
				{#if data.isOwnProfile}
					<a href="/profile" class="link text-sm opacity-70">Edit Profile</a>
				{/if}
			</div>
		</div>
		{#if !data.isOwnProfile}
			<div>
				{#if data.friendship?.status === 'accepted'}
					<span class="badge badge-success">Friends</span>
				{:else if data.friendship?.status === 'pending' && data.friendship.direction === 'outgoing'}
					<span class="badge">Request Pending</span>
				{:else if data.friendship?.status === 'pending' && data.friendship.direction === 'incoming'}
					<form method="POST" action="?/acceptRequest" use:enhance>
						<input type="hidden" name="friendship_id" value={data.friendship.id} />
						<button class="btn btn-primary btn-sm">Accept Friend Request</button>
					</form>
				{:else}
					<form method="POST" action="?/sendRequest" use:enhance>
						<input type="hidden" name="addressee_id" value={data.profile.id} />
						<button class="btn btn-primary btn-outline btn-sm">Add Friend</button>
					</form>
				{/if}
			</div>
		{/if}
	</div>

	{#if form?.error}
		<div class="mt-4">
			<Alert type="error" message={form.error} />
		</div>
	{/if}

	<div class="mt-6 grid gap-6">
		<div class="grid grid-cols-3 gap-4">
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<p class="text-3xl font-bold">{data.stats.totalSubmissions}</p>
				<p class="text-sm opacity-60">Scores</p>
			</div>
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<p class="text-3xl font-bold">{data.stats.totalGroups}</p>
				<p class="text-sm opacity-60">Groups</p>
			</div>
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<p class="text-3xl font-bold">{data.stats.streak}</p>
				<p class="text-sm opacity-60">Day streak</p>
			</div>
		</div>

		{#if data.perGameStats.length > 0}
			<div class="card border border-base-300">
				<div class="card-body">
					<h2 class="card-title text-base">Per-Game Breakdown</h2>
					<div class="mt-2 flex flex-col gap-4">
						{#each data.perGameStats as game}
							<div>
								<div class="flex items-center justify-between text-sm">
									<span class="font-medium">{game.name}</span>
									<span class="opacity-60">{game.count} played</span>
								</div>
								<div class="mt-1 flex items-center gap-3">
									<div class="h-2.5 flex-1 rounded-full bg-base-300">
										<div
											class="h-full rounded-full bg-primary transition-all"
											style="width: {game.barPct}%"
										></div>
									</div>
									<span class="w-20 text-right text-xs opacity-70">
										avg {game.avg} · best {game.best}
									</span>
								</div>
							</div>
						{/each}
					</div>
				</div>
			</div>
		{/if}

		{#if data.recentActivity.length > 0}
			<div class="card border border-base-300">
				<div class="card-body">
					<h2 class="card-title text-base">Recent Activity</h2>
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Game</th>
									<th>Score</th>
									<th>Date</th>
									{#if data.isOwnProfile}<th></th>{/if}
								</tr>
							</thead>
							<tbody>
								{#each data.recentActivity as activity}
									{@const rules = GAME_RULES[activity.gameId]}
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
										{#if data.isOwnProfile}
											<td>
												{#if editingId === activity.id}
													<form method="POST" action="?/editSubmission" use:enhance={() => {
														savingId = activity.id;
														return async ({ update }) => {
															editingId = null;
															savingId = null;
															await update();
														};
													}}>
														<input type="hidden" name="submission_id" value={activity.id} />
														<input type="hidden" name="game_id" value={activity.gameId} />
														<input type="hidden" name="score" value={editScore} />
														<div class="flex gap-1">
															<button type="submit" class="btn btn-success btn-xs" disabled={savingId === activity.id}>
																{#if savingId === activity.id}<span class="loading loading-spinner loading-xs"></span>{/if}
																Save
															</button>
															<button type="button" class="btn btn-ghost btn-xs" onclick={cancelEdit}>Cancel</button>
														</div>
													</form>
												{:else if deletingId === activity.id}
													<form method="POST" action="?/deleteSubmission" use:enhance={() => {
														confirmingDeleteId = activity.id;
														return async ({ update }) => {
															deletingId = null;
															confirmingDeleteId = null;
															await update();
														};
													}}>
														<input type="hidden" name="submission_id" value={activity.id} />
														<div class="flex gap-1">
															<button type="submit" class="btn btn-error btn-xs" disabled={confirmingDeleteId === activity.id}>
																{#if confirmingDeleteId === activity.id}<span class="loading loading-spinner loading-xs"></span>{/if}
																Confirm
															</button>
															<button type="button" class="btn btn-ghost btn-xs" onclick={cancelDelete}>Cancel</button>
														</div>
													</form>
												{:else}
													<div class="flex gap-1">
														<button type="button" class="btn btn-ghost btn-xs" onclick={() => startEdit(activity)}>Edit</button>
														<button type="button" class="btn btn-ghost btn-xs text-error" onclick={() => confirmDelete(activity.id)}>Delete</button>
													</div>
												{/if}
											</td>
										{/if}
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		{:else}
			<p class="text-center opacity-50">No submissions yet.</p>
		{/if}
	</div>
</PageContainer>
