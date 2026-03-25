<script lang="ts">
	import Avatar from './Avatar.svelte';

	type Submission = { user_id: string; game_id: string; game_date: string; games: { name: string } | null };
	type Member = { user_id: string; left_at: string | null; profiles: { username: string; avatar_url: string | null } | null };

	let { submissions, members, userId }: { submissions: Submission[]; members: Member[]; userId: string } = $props();

	const today = new Date().toISOString().slice(0, 10);

	let todaysSubs = $derived(submissions.filter((s) => s.game_date === today));

	// Map of user_id -> list of game names submitted today
	let submittedByUser = $derived.by(() => {
		const map = new Map<string, string[]>();
		for (const sub of todaysSubs) {
			const games = map.get(sub.user_id) ?? [];
			games.push(sub.games?.name ?? sub.game_id);
			map.set(sub.user_id, games);
		}
		return map;
	});

	let activeMembers = $derived(members.filter((m) => m.left_at === null));

	let played = $derived(
		activeMembers
			.filter((m) => submittedByUser.has(m.user_id))
			.map((m) => ({
				...m,
				games: submittedByUser.get(m.user_id) ?? []
			}))
			.sort((a, b) => b.games.length - a.games.length)
	);

	let notPlayed = $derived(
		activeMembers.filter((m) => !submittedByUser.has(m.user_id))
	);
</script>

{#if activeMembers.length > 0}
	<section class="card mt-6 border border-base-300">
		<div class="card-body">
			<h2 class="card-title text-base">
				Today
				<span class="badge badge-sm">{played.length}/{activeMembers.length}</span>
			</h2>

			{#if played.length === 0}
				<p class="text-sm opacity-60">No one has submitted yet today.</p>
			{:else}
				<div class="flex flex-wrap gap-2">
					{#each played as member}
						<a
							href="/users/{member.profiles?.username ?? ''}"
							class="flex items-center gap-1.5 rounded-full bg-success/10 border border-success/30 px-3 py-1.5 text-sm transition-colors hover:bg-success/20"
							title={member.games.join(', ')}
						>
							<Avatar src={member.profiles?.avatar_url} username={member.profiles?.username ?? 'Unknown'} size="xs" />
							{member.profiles?.username ?? 'Unknown'}
							<span class="opacity-50">{member.games.length}</span>
						</a>
					{/each}
				</div>
			{/if}

			{#if notPlayed.length > 0}
				<div class="mt-2 flex flex-wrap gap-2">
					{#each notPlayed as member}
						<a
							href="/users/{member.profiles?.username ?? ''}"
							class="flex items-center gap-1.5 rounded-full border border-base-content/10 px-3 py-1.5 text-sm opacity-40 transition-colors hover:opacity-70"
						>
							<Avatar src={member.profiles?.avatar_url} username={member.profiles?.username ?? 'Unknown'} size="xs" />
							{member.profiles?.username ?? 'Unknown'}
						</a>
					{/each}
				</div>
			{/if}
		</div>
	</section>
{/if}
