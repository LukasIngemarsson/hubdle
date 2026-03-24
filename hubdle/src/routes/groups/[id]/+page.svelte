<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
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
		<h2 class="text-lg font-semibold">Members</h2>
		<div class="mt-4 flex flex-wrap gap-2">
			{#each data.members as member}
				<span class="badge badge-lg">{member.profiles?.username ?? 'Unknown'}</span>
			{/each}
		</div>
	</section>
</div>
