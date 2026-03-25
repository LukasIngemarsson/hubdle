<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { toastEnhance } from '$lib/enhance-toast';
	import FriendSearch from './FriendSearch.svelte';

	let { data }: { data: PageData } = $props();
</script>

<svelte:head>
	<title>Friends - Hubdle</title>
</svelte:head>

<PageContainer>
	<h1 class="text-2xl font-bold">Friends</h1>

	<FriendSearch supabase={data.supabase} userId={data.userId} />

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
									use:enhance={toastEnhance('Friend request accepted!')}
								>
									<input type="hidden" name="friendship_id" value={request.friendshipId} />
									<button class="btn btn-primary btn-sm">Accept</button>
								</form>
								<form
									method="POST"
									action="?/declineRequest"
									use:enhance={toastEnhance('Request declined.')}
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
								use:enhance={toastEnhance('Request cancelled.')}
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
								use:enhance={toastEnhance('Friend removed.')}
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
