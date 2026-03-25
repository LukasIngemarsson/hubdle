<script lang="ts">
	import { enhance } from '$app/forms';
	import { onDestroy } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { toasts } from '$lib/stores/toast.svelte';

	let { data }: { data: PageData } = $props();

	// Live search state
	let searchQuery = $state('');
	let searchResults = $state<
		{
			id: string;
			username: string;
			avatarUrl: string | null;
			friendship: {
				friendshipId: string;
				status: string;
				direction: 'outgoing' | 'incoming';
			} | null;
		}[]
	>([]);
	let searched = $state(false);
	let debounceTimer: ReturnType<typeof setTimeout>;

	function handleSearchInput() {
		clearTimeout(debounceTimer);
		const query = searchQuery.trim();
		if (query.length < 2) {
			searchResults = [];
			searched = false;
			return;
		}
		debounceTimer = setTimeout(() => runSearch(query), 300);
	}

	async function runSearch(query: string) {
		const userId = data.userId;

		const { data: profiles } = await data.supabase
			.from('profiles')
			.select('id, username, avatar_url')
			.neq('id', userId)
			.ilike('username', `%${query}%`)
			.limit(10);

		if (!profiles || profiles.length === 0) {
			searchResults = [];
			searched = true;
			return;
		}

		const profileIds = profiles.map((p) => p.id);
		const { data: existingFriendships } = await data.supabase
			.from('friendships')
			.select('id, requester_id, addressee_id, status')
			.or(
				profileIds
					.map(
						(id) =>
							`and(requester_id.eq.${userId},addressee_id.eq.${id}),and(requester_id.eq.${id},addressee_id.eq.${userId})`
					)
					.join(',')
			);

		const friendshipMap = new Map<
			string,
			{ friendshipId: string; status: string; direction: 'outgoing' | 'incoming' }
		>();
		for (const f of existingFriendships ?? []) {
			const otherId = f.requester_id === userId ? f.addressee_id : f.requester_id;
			friendshipMap.set(otherId, {
				friendshipId: f.id,
				status: f.status,
				direction: f.requester_id === userId ? 'outgoing' : 'incoming'
			});
		}

		searchResults = profiles.map((p) => ({
			id: p.id,
			username: p.username,
			avatarUrl: p.avatar_url,
			friendship: friendshipMap.get(p.id) ?? null
		}));
		searched = true;
	}

	onDestroy(() => clearTimeout(debounceTimer));

	function searchEnhance(successMessage: string): SubmitFunction {
		return () => {
			return async ({ result, update }) => {
				await update();
				if (result.type === 'success') {
					toasts.push('success', successMessage);
					if (searchQuery.trim().length >= 2) runSearch(searchQuery.trim());
				} else if (result.type === 'failure' && result.data?.error) {
					toasts.push('error', result.data.error as string);
				}
			};
		};
	}
</script>

<svelte:head>
	<title>Friends - Hubdle</title>
</svelte:head>

<PageContainer>
	<h1 class="text-2xl font-bold">Friends</h1>

	<!-- Search -->
	<section class="card mt-6 bg-base-200">
		<div class="card-body gap-3">
			<label for="friend-search" class="card-title text-sm">Find friends</label>
			<input
				id="friend-search"
				type="text"
				placeholder="Search by username"
				bind:value={searchQuery}
				oninput={handleSearchInput}
				class="input input-bordered w-full"
			/>

			{#if searched && searchResults.length === 0}
				<p class="text-sm opacity-60">No users found for "{searchQuery}".</p>
			{:else if searchResults.length > 0}
				<div class="mt-2 grid gap-2">
					{#each searchResults as result}
						<div class="flex items-center justify-between rounded-lg bg-base-300 px-4 py-2">
							<a
								href="/users/{result.username}"
								class="flex items-center gap-2 font-medium hover:underline"
								><Avatar
									src={result.avatarUrl}
									username={result.username}
									size="xs"
								/>{result.username}</a
							>
							{#if result.friendship?.status === 'accepted'}
								<span class="badge badge-success badge-sm">Friends</span>
							{:else if result.friendship?.status === 'pending' && result.friendship.direction === 'outgoing'}
								<span class="badge badge-sm">Pending</span>
							{:else if result.friendship?.status === 'pending' && result.friendship.direction === 'incoming'}
								<form
									method="POST"
									action="?/acceptRequest"
									use:enhance={searchEnhance('Friend request accepted!')}
								>
									<input
										type="hidden"
										name="friendship_id"
										value={result.friendship.friendshipId}
									/>
									<button class="btn btn-primary btn-sm">Accept</button>
								</form>
							{:else}
								<form
									method="POST"
									action="?/sendRequest"
									use:enhance={searchEnhance('Friend request sent!')}
								>
									<input type="hidden" name="addressee_id" value={result.id} />
									<button class="btn btn-primary btn-outline btn-sm">Add Friend</button>
								</form>
							{/if}
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>

	<!-- Incoming Requests -->
	{#if data.incomingRequests.length > 0}
		<section class="card mt-6 border border-base-300">
			<div class="card-body">
				<h2 class="card-title text-base">
					Friend Requests
					<span class="badge badge-primary badge-sm">{data.incomingRequests.length}</span>
				</h2>
				<div class="grid gap-2">
					{#each data.incomingRequests as request}
						<div class="flex items-center justify-between rounded-lg bg-base-200 px-4 py-2">
							<a
								href="/users/{request.username}"
								class="flex items-center gap-2 font-medium hover:underline"
								><Avatar
									src={request.avatarUrl}
									username={request.username}
									size="xs"
								/>{request.username}</a
							>
							<div class="flex gap-2">
								<form
									method="POST"
									action="?/acceptRequest"
									use:enhance={searchEnhance('Friend request accepted!')}
								>
									<input type="hidden" name="friendship_id" value={request.friendshipId} />
									<button class="btn btn-primary btn-sm">Accept</button>
								</form>
								<form
									method="POST"
									action="?/declineRequest"
									use:enhance={searchEnhance('Request declined.')}
								>
									<input type="hidden" name="friendship_id" value={request.friendshipId} />
									<button class="btn btn-ghost btn-sm">Decline</button>
								</form>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Outgoing Requests -->
	{#if data.outgoingRequests.length > 0}
		<section class="card mt-6 border border-base-300">
			<div class="card-body">
				<h2 class="card-title text-base">Sent Requests</h2>
				<div class="grid gap-2">
					{#each data.outgoingRequests as request}
						<div class="flex items-center justify-between rounded-lg bg-base-200 px-4 py-2">
							<a
								href="/users/{request.username}"
								class="flex items-center gap-2 font-medium hover:underline"
								><Avatar
									src={request.avatarUrl}
									username={request.username}
									size="xs"
								/>{request.username}</a
							>
							<form
								method="POST"
								action="?/declineRequest"
								use:enhance={searchEnhance('Request cancelled.')}
							>
								<input type="hidden" name="friendship_id" value={request.friendshipId} />
								<button class="btn btn-ghost btn-sm">Cancel</button>
							</form>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}

	<!-- Friend List -->
	<section class="card mt-6 border border-base-300">
		<div class="card-body">
			<h2 class="card-title text-base">
				Your Friends
				<span class="badge badge-sm">{data.friends.length}</span>
			</h2>

			{#if data.friends.length === 0}
				<div class="flex flex-col items-center gap-3 py-6 text-center opacity-60">
					<p class="text-4xl">👋</p>
					<p class="font-medium">No friends yet</p>
					<p class="text-sm">Search for users above to get started.</p>
				</div>
			{:else}
				<div class="grid gap-2">
					{#each data.friends as friend}
						{@const formId = `remove-form-${friend.friendshipId}`}
						<div class="flex items-center justify-between rounded-lg bg-base-200 px-4 py-2">
							<a
								href="/users/{friend.username}"
								class="flex items-center gap-2 font-medium hover:underline"
								><Avatar
									src={friend.avatarUrl}
									username={friend.username}
									size="xs"
								/>{friend.username}</a
							>
							<form
								id={formId}
								method="POST"
								action="?/removeFriend"
								use:enhance={searchEnhance('Friend removed.')}
								class="hidden"
							>
								<input type="hidden" name="friendship_id" value={friend.friendshipId} />
							</form>
							<ConfirmModal
								id="remove-{friend.friendshipId}"
								title="Remove Friend"
								message="Are you sure you want to remove {friend.username} as a friend?"
								triggerLabel="Remove"
								triggerClass="btn-error btn-outline btn-sm"
								confirmLabel="Remove"
								confirmClass="btn-error"
								onConfirm={() => {
									(document.getElementById(formId) as HTMLFormElement)?.requestSubmit();
								}}
							/>
						</div>
					{/each}
				</div>
			{/if}
		</div>
	</section>
</PageContainer>
