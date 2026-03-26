<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { toastEnhance } from '$lib/enhance-toast';

	let { data }: { data: PageData } = $props();

	let viewerFriendIdSet = $derived(new Set(data.viewerFriendIds));
</script>

<svelte:head>
	<title>{data.profile.username}'s Friends - Hubdle</title>
</svelte:head>

<PageContainer>
	<a href="/users/{data.profile.username}" class="link text-sm opacity-70"
		>&larr; {data.isOwnProfile ? 'Your' : `${data.profile.username}'s`} profile</a
	>
	<h1 class="mt-1 text-2xl font-bold">
		{data.isOwnProfile ? 'Your' : `${data.profile.username}'s`} Friends
		<span class="badge badge-sm">{data.friends.length}</span>
	</h1>

	{#if data.friends.length === 0}
		<div class="mt-12 flex flex-col items-center gap-3 text-center opacity-60">
			<p class="text-4xl">👋</p>
			<p class="font-medium">No friends yet</p>
		</div>
	{:else}
		<div class="mt-6 grid gap-2">
			{#each data.friends as friend}
				<div class="flex items-center justify-between rounded-lg bg-base-200 px-4 py-2">
					<a
						href="/users/{friend.username}"
						class="flex items-center gap-2 font-medium hover:underline"
					>
						<Avatar src={friend.avatarUrl} username={friend.username} size="xs" />
						{friend.username}
					</a>
					{#if !data.isOwnProfile && friend.userId !== data.viewerUserId}
						{#if viewerFriendIdSet.has(friend.userId)}
							<span class="badge badge-success badge-sm">Friends</span>
						{:else}
							<form
								method="POST"
								action="?/sendRequest"
								use:enhance={toastEnhance('Friend request sent!')}
							>
								<input type="hidden" name="addressee_id" value={friend.userId} />
								<button class="btn btn-primary btn-outline btn-sm">Add Friend</button>
							</form>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</PageContainer>
