<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { toastEnhance } from '$lib/enhance-toast';
	import ActivityRow from './ActivityRow.svelte';
	import ProfileHeatmap from './ProfileHeatmap.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editingId = $state<string | null>(null);
	let editScore = $state(0);
	let deletingId = $state<string | null>(null);

	const PAGE_SIZE = 20;
	let visibleCount = $state(PAGE_SIZE);
	let visibleActivity = $derived(data.recentActivity.slice(0, visibleCount));
	let hasMore = $derived(data.recentActivity.length > visibleCount);

	const memberSince = $derived(
		new Date(data.profile.createdAt).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<svelte:head>
	<title>{data.profile.username} - Hubdle</title>
</svelte:head>

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
					<form
						method="POST"
						action="?/cancelRequest"
						use:enhance={toastEnhance('Request cancelled.')}
					>
						<input type="hidden" name="friendship_id" value={data.friendship.id} />
						<button class="btn btn-ghost btn-sm">Cancel Request</button>
					</form>
				{:else if data.friendship?.status === 'pending' && data.friendship.direction === 'incoming'}
					<form
						method="POST"
						action="?/acceptRequest"
						use:enhance={toastEnhance('Friend request accepted!')}
					>
						<input type="hidden" name="friendship_id" value={data.friendship.id} />
						<button class="btn btn-primary btn-sm">Accept Friend Request</button>
					</form>
				{:else}
					<form
						method="POST"
						action="?/sendRequest"
						use:enhance={toastEnhance('Friend request sent!')}
					>
						<input type="hidden" name="addressee_id" value={data.profile.id} />
						<button class="btn btn-primary btn-outline btn-sm">Add Friend</button>
					</form>
				{/if}
			</div>
		{/if}
	</div>

	<div class="mt-6 grid gap-6">
		<div class="grid grid-cols-3 gap-4">
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<p class="text-3xl font-bold">{data.stats.totalSubmissions}</p>
				<p class="text-sm opacity-60">{data.stats.totalSubmissions === 1 ? 'Score' : 'Scores'}</p>
			</div>
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<p class="text-3xl font-bold">{data.stats.totalGroups}</p>
				<p class="text-sm opacity-60">{data.stats.totalGroups === 1 ? 'Group' : 'Groups'}</p>
			</div>
			<div class="rounded-lg bg-base-200 p-4 text-center">
				<p class="text-3xl font-bold">{data.stats.streak}</p>
				<p class="text-sm opacity-60">Day streak</p>
			</div>
		</div>

		<ProfileHeatmap games={data.perGameStats} submissions={data.recentScores} />

		{#if data.recentActivity.length > 0}
			<div class="card border border-base-300">
				<div class="card-body">
					<h2 class="card-title text-base">Submissions</h2>
					<div class="overflow-x-auto">
						<table class="table">
							<thead>
								<tr>
									<th>Game</th>
									<th>Score</th>
									<th>Date</th>
									{#if data.isOwnProfile}<th class="text-right"></th>{/if}
								</tr>
							</thead>
							<tbody>
								{#each visibleActivity as activity}
									<ActivityRow
										{activity}
										isOwnProfile={data.isOwnProfile}
										bind:editingId
										bind:editScore
										bind:deletingId
									/>
								{/each}
							</tbody>
						</table>
					</div>
					{#if hasMore}
						<button
							class="btn btn-ghost btn-sm mt-2 w-full"
							onclick={() => (visibleCount += PAGE_SIZE)}
						>
							Show more
						</button>
					{/if}
				</div>
			</div>
		{:else}
			<p class="text-center opacity-50">No submissions yet.</p>
		{/if}
	</div>
</PageContainer>
