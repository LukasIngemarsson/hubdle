<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<div class="mx-auto max-w-2xl p-6">
	<div class="flex items-center justify-between">
		<div>
			<a href="/groups" class="link text-sm opacity-70">&larr; All Groups</a>
			<h1 class="text-2xl font-bold">{data.group.name}</h1>
		</div>
		<div class="text-right">
			<p class="text-xs opacity-50">Invite code</p>
			<span class="badge badge-ghost font-mono text-lg">{data.group.invite_code}</span>
		</div>
	</div>

	<section class="mt-8">
		<h2 class="text-lg font-semibold">Submit Score</h2>
		<form method="POST" action="?/submit" use:enhance class="mt-3 flex flex-col gap-3">
			<textarea
				name="raw_text"
				placeholder="Paste your share text here (e.g. Wordle 1,234 3/6)"
				class="textarea textarea-bordered w-full"
				rows="3"
				required
			></textarea>
			<button class="btn btn-primary w-fit">Submit</button>
		</form>

		{#if form?.error}
			<div class="alert alert-error mt-3">
				<span>{form.error}</span>
			</div>
		{/if}

		{#if form?.success}
			<div class="alert alert-success mt-3">
				<span>Score submitted!</span>
			</div>
		{/if}
	</section>

	<section class="mt-8">
		<h2 class="text-lg font-semibold">Leaderboard</h2>

		{#if data.leaderboard.length === 0}
			<p class="mt-2 opacity-70">No scores yet.</p>
		{:else}
			<div class="mt-4 overflow-x-auto">
				<table class="table">
					<thead>
						<tr>
							<th>#</th>
							<th>Player</th>
							<th>Games</th>
							<th>Total Score</th>
						</tr>
					</thead>
					<tbody>
						{#each data.leaderboard as entry, i}
							<tr class={i === 0 ? 'bg-base-200 font-semibold' : ''}>
								<td>{i + 1}</td>
								<td>{entry.username}</td>
								<td>{entry.games}</td>
								<td>{entry.total}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>

	<section class="mt-8">
		<h2 class="text-lg font-semibold">Recent Submissions</h2>
		{#if data.submissions.length === 0}
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
						{#each data.submissions as sub}
							{@const member = data.members.find((m) => m.user_id === sub.user_id)}
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

	<section class="mt-8">
		<h2 class="text-lg font-semibold">Members</h2>
		<div class="mt-4 flex flex-wrap gap-2">
			{#each data.members as member}
				<span class="badge badge-lg">{member.profiles?.username ?? 'Unknown'}</span>
			{/each}
		</div>
	</section>
</div>
