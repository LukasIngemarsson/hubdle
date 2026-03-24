<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	type TimeFilter = 'all' | 'weekly' | 'daily';

	let selectedGame = $state<string>('all');
	let selectedTime = $state<TimeFilter>('all');

	let filteredLeaderboard = $derived.by(() => {
		const now = new Date();
		const todayStr = now.toISOString().slice(0, 10);
		const weekAgo = new Date(now);
		weekAgo.setDate(weekAgo.getDate() - 7);
		const weekAgoStr = weekAgo.toISOString().slice(0, 10);

		// Filter submissions by game and time
		const filtered = (data.submissions ?? []).filter((sub) => {
			if (selectedGame !== 'all' && sub.game_id !== selectedGame) return false;
			if (selectedTime === 'daily' && sub.game_date !== todayStr) return false;
			if (selectedTime === 'weekly' && sub.game_date < weekAgoStr) return false;
			return true;
		});

		// Build scores map from members
		const scores = new Map<string, { username: string; total: number; games: number }>();
		for (const member of data.members ?? []) {
			const profile = member.profiles;
			if (profile) {
				scores.set(member.user_id, { username: profile.username, total: 0, games: 0 });
			}
		}

		for (const sub of filtered) {
			const entry = scores.get(sub.user_id);
			if (entry) {
				entry.total += sub.score;
				entry.games += 1;
			}
		}

		return [...scores.entries()]
			.map(([userId, d]) => ({ userId, ...d }))
			.filter((e) => e.games > 0)
			.sort((a, b) => a.total - b.total);
	});
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

		<!-- Game filter tabs -->
		<div role="tablist" class="tabs tabs-bordered mt-4">
			<button
				role="tab"
				class="tab {selectedGame === 'all' ? 'tab-active' : ''}"
				onclick={() => (selectedGame = 'all')}
			>
				All Games
			</button>
			{#each data.games as game}
				<button
					role="tab"
					class="tab {selectedGame === game.id ? 'tab-active' : ''}"
					onclick={() => (selectedGame = game.id)}
				>
					{game.name}
				</button>
			{/each}
		</div>

		<!-- Time filter -->
		<div class="mt-3 flex gap-1">
			<button
				class="btn btn-sm {selectedTime === 'all' ? 'btn-active' : 'btn-ghost'}"
				onclick={() => (selectedTime = 'all')}
			>
				All Time
			</button>
			<button
				class="btn btn-sm {selectedTime === 'weekly' ? 'btn-active' : 'btn-ghost'}"
				onclick={() => (selectedTime = 'weekly')}
			>
				Weekly
			</button>
			<button
				class="btn btn-sm {selectedTime === 'daily' ? 'btn-active' : 'btn-ghost'}"
				onclick={() => (selectedTime = 'daily')}
			>
				Today
			</button>
		</div>

		{#if filteredLeaderboard.length === 0}
			<p class="mt-4 opacity-70">No scores yet for this selection.</p>
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
						{#each filteredLeaderboard as entry, i}
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

	<section class="mt-12 flex gap-3 border-t border-base-300 pt-6">
		<form method="POST" action="?/leave" use:enhance>
			<button
				type="submit"
				class="btn btn-ghost"
				onclick={(e) => {
					if (!confirm('Are you sure you want to leave this group?')) e.preventDefault();
				}}
			>
				Leave Group
			</button>
		</form>

		{#if data.userId === data.group.created_by}
			<form method="POST" action="?/delete" use:enhance>
				<button
					type="submit"
					class="btn btn-error"
					onclick={(e) => {
						if (!confirm('Are you sure you want to delete this group? This cannot be undone.'))
							e.preventDefault();
					}}
				>
					Delete Group
				</button>
			</form>
		{/if}
	</section>
</div>
