<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ScoreSubmitForm from '$lib/components/ScoreSubmitForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import RecentSubmissions from '$lib/components/RecentSubmissions.svelte';
	import CopyBadge from '$lib/components/CopyBadge.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageContainer>
	<div class="flex items-center justify-between">
		<div>
			<a href="/groups" class="link text-sm opacity-70">&larr; All Groups</a>
			<h1 class="text-2xl font-bold">{data.group.name}</h1>
		</div>
		<div class="text-right">
			<p class="text-xs opacity-50">Invite code</p>
			<CopyBadge text={data.group.invite_code} size="lg" />
		</div>
	</div>

	<ScoreSubmitForm {form} />
	<Leaderboard games={data.games} submissions={data.submissions} members={data.members} />
	<RecentSubmissions submissions={data.submissions} members={data.members} />

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
</PageContainer>
