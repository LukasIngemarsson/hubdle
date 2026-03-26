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
			<div class="flex items-center justify-center gap-3 rounded-lg bg-base-200 p-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-8 w-8 shrink-0 text-orange-500"
					><path
						fill-rule="evenodd"
						d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.176 7.547 7.547 0 0 1-1.705-1.715.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.546 3.75 3.75 0 0 1 3.255 3.718Z"
						clip-rule="evenodd"
					/></svg
				>
				<div class="text-center">
					<p class="text-3xl font-bold">{data.stats.streak}</p>
					<p class="text-sm opacity-60">Day streak</p>
				</div>
			</div>
			<div class="flex items-center justify-center gap-3 rounded-lg bg-base-200 p-4">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="h-8 w-8 shrink-0 opacity-70"
					><path
						d="M8.25 6.75a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0ZM15.75 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM2.25 9.75a3 3 0 1 1 6 0 3 3 0 0 1-6 0ZM6.31 15.117A6.745 6.745 0 0 1 12 12a6.745 6.745 0 0 1 6.709 7.498.75.75 0 0 1-.372.568A12.696 12.696 0 0 1 12 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 0 1-.372-.568 6.787 6.787 0 0 1 1.019-4.38Z"
					/><path
						d="M5.082 14.254a8.287 8.287 0 0 0-1.308 5.135 9.687 9.687 0 0 1-1.764-.44l-.115-.04a.563.563 0 0 1-.373-.487l-.01-.121ZM19.573 19.389a8.287 8.287 0 0 0-1.308-5.135 3.75 3.75 0 0 1 3.57 4.047l-.01.121a.563.563 0 0 1-.373.486l-.115.04c-.567.2-1.156.349-1.764.441Z"
					/></svg
				>
				<div class="text-center">
					<p class="text-3xl font-bold">{data.stats.friendCount}</p>
					<a href="/users/{data.profile.username}/friends" class="link text-sm opacity-60">{data.stats.friendCount === 1 ? 'Friend' : 'Friends'}</a>
				</div>
			</div>
			<div class="flex flex-col items-center justify-center rounded-lg bg-base-200 p-4">
				<p class="text-xl font-bold">{data.stats.favoriteGame ?? '—'}</p>
				<p class="text-sm opacity-60">Favorite game</p>
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
