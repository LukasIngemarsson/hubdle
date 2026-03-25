<script lang="ts">
	import type { PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Avatar from '$lib/components/Avatar.svelte';

	let { data }: { data: PageData } = $props();

	const memberSince = $derived(
		new Date(data.profile.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<PageContainer>
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
								</tr>
							</thead>
							<tbody>
								{#each data.recentActivity as activity}
									<tr>
										<td>{activity.gameName}</td>
										<td>{activity.score}</td>
										<td>{activity.gameDate}</td>
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
