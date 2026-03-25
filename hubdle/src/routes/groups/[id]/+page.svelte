<script lang="ts">
	import { enhance } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import ScoreSubmitForm from '$lib/components/ScoreSubmitForm.svelte';
	import Leaderboard from '$lib/components/Leaderboard.svelte';
	import RecentSubmissions from '$lib/components/RecentSubmissions.svelte';
	import CopyBadge from '$lib/components/CopyBadge.svelte';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import { toastEnhance } from '$lib/enhance-toast';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let leaveForm = $state<HTMLFormElement>();
	let deleteForm = $state<HTMLFormElement>();
	let transferForm = $state<HTMLFormElement>();
	let newOwnerId = $state('');
	let transferring = $state(false);

	// Subscribe to realtime changes on group_members for this group
	let channel: ReturnType<typeof data.supabase.channel>;

	onMount(() => {
		channel = data.supabase
			.channel(`group-members-${data.group.id}`)
			.on(
				'postgres_changes',
				{
					event: '*',
					schema: 'public',
					table: 'group_members',
					filter: `group_id=eq.${data.group.id}`
				},
				() => invalidateAll()
			)
			.subscribe();
	});

	onDestroy(() => {
		if (channel) data.supabase.removeChannel(channel);
	});

	let isOwner = $derived(data.userId === data.group.created_by);
	let otherMembers = $derived(data.members.filter((m) => m.user_id !== data.userId));
	let isOnlyMember = $derived(otherMembers.length === 0);

	function openTransferModal() {
		(document.getElementById('transfer-modal') as HTMLDialogElement)?.showModal();
	}

	function closeTransferModal() {
		(document.getElementById('transfer-modal') as HTMLDialogElement)?.close();
	}

	function unsubscribeRealtime() {
		if (channel) {
			data.supabase.removeChannel(channel);
		}
	}

	function handleLeave() {
		unsubscribeRealtime();
		leaveForm?.requestSubmit();
	}

	function handleTransferAndLeave() {
		transferring = true;
		closeTransferModal();
		unsubscribeRealtime();
		transferForm?.requestSubmit();
	}
</script>

<PageContainer>
	<div>
		<a href="/groups" class="link text-sm opacity-70">&larr; All Groups</a>
		<div class="mt-1 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
			<h1 class="text-2xl font-bold">{data.group.name}</h1>
			<div class="flex items-center gap-2">
				<span class="text-xs opacity-50">Invite code</span>
				<CopyBadge text={data.group.invite_code} size="lg" />
			</div>
		</div>
	</div>

	<section class="mt-6 flex flex-wrap gap-2">
		{#each data.games as game}
			{#if game.url}
				<a href={game.url} target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm gap-1">
					{game.name}
					<svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
						<path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
						<path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
					</svg>
				</a>
			{/if}
		{/each}
	</section>

	<ScoreSubmitForm {form} games={data.games} />
	<Leaderboard games={data.games} submissions={data.submissions} members={data.allMembers} />
	<RecentSubmissions submissions={data.submissions} members={data.allMembers} userId={data.userId} />

	<section class="card mt-6 bg-base-200">
		<div class="card-body">
			<h2 class="card-title text-base">Members
				<span class="badge badge-sm">{data.members.length}</span>
			</h2>
			<div class="flex flex-wrap gap-2">
				{#each data.members as member}
					{@const friendStatus = data.friendshipStatusMap[member.user_id]}
					{@const isself = member.user_id === data.userId}
					<div class="relative">
						<a href="/users/{member.profiles?.username ?? ''}" class="flex items-center gap-1.5 rounded-full border border-base-content/20 px-3 py-1.5 transition-colors hover:bg-base-300">
							<Avatar src={member.profiles?.avatar_url} username={member.profiles?.username ?? 'Unknown'} size="xs" />
							{member.profiles?.username ?? 'Unknown'}
							{#if member.user_id === data.group.created_by}
								<span class="text-xs opacity-50">Owner</span>
							{/if}
						</a>
						{#if !isself}
							{#if friendStatus === 'accepted'}
								<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-success-content" title="Friends">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-2.5 w-2.5"><path fill-rule="evenodd" d="M12.416 3.376a.75.75 0 0 1 .208 1.04l-5 7.5a.75.75 0 0 1-1.154.114l-3-3a.75.75 0 0 1 1.06-1.06l2.353 2.353 4.493-6.74a.75.75 0 0 1 1.04-.207Z" clip-rule="evenodd" /></svg>
								</span>
							{:else if friendStatus === 'pending'}
								<span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[10px] text-warning-content" title="Request pending">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-2.5 w-2.5"><path fill-rule="evenodd" d="M1 8a7 7 0 1 1 14 0A7 7 0 0 1 1 8Zm7.75-4.25a.75.75 0 0 0-1.5 0V8c0 .414.336.75.75.75h3.25a.75.75 0 0 0 0-1.5h-2.5v-3.5Z" clip-rule="evenodd" /></svg>
								</span>
							{:else}
								<form method="POST" action="?/sendRequest" use:enhance={toastEnhance('Friend request sent!')} class="absolute -top-1 -right-1">
									<input type="hidden" name="addressee_id" value={member.user_id} />
									<button class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-primary text-[10px] text-primary-content transition-transform hover:scale-110" title="Add Friend">
										<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-2.5 w-2.5"><path d="M8 2a.75.75 0 0 1 .75.75v4.5h4.5a.75.75 0 0 1 0 1.5h-4.5v4.5a.75.75 0 0 1-1.5 0v-4.5h-4.5a.75.75 0 0 1 0-1.5h4.5v-4.5A.75.75 0 0 1 8 2Z" /></svg>
									</button>
								</form>
							{/if}
						{/if}
					</div>
				{/each}
			</div>

			{#if data.invitableFriends.length > 0}
				<form method="POST" action="?/inviteFriend" use:enhance={toastEnhance('Friend invited!')} class="mt-3 flex items-center gap-2">
					<select name="friend_id" class="select select-bordered select-sm flex-1" required>
						<option value="" disabled selected>Invite a friend...</option>
						{#each data.invitableFriends as friend}
							<option value={friend.id}>{friend.username}</option>
						{/each}
					</select>
					<button class="btn btn-primary btn-sm">Invite</button>
				</form>
			{/if}
		</div>
	</section>

	<section class="mt-12 border-t border-base-300 pt-6">
		<div class="flex items-center justify-between">
			<div>
				{#if !isOwner}
					<form method="POST" action="?/leave" use:enhance bind:this={leaveForm} class="hidden"></form>
					<ConfirmModal
						id="leave-modal"
						title="Leave Group"
						message="Are you sure you want to leave this group?"
						triggerLabel="Leave Group"
						confirmLabel="Leave"
						confirmClass="btn-ghost"
						onConfirm={handleLeave}
					/>
				{:else if isOnlyMember}
					<form method="POST" action="?/leaveAndDelete" use:enhance bind:this={leaveForm} class="hidden"></form>
					<ConfirmModal
						id="leave-modal"
						title="Leave Group"
						message="You are the only member. Leaving will permanently delete this group and all its data."
						triggerLabel="Leave Group"
						confirmLabel="Leave & Delete"
						confirmClass="btn-error"
						onConfirm={handleLeave}
					/>
				{:else}
					<form method="POST" action="?/transferAndLeave" use:enhance bind:this={transferForm} class="hidden">
						<input type="hidden" name="new_owner_id" value={newOwnerId} />
					</form>
					<button type="button" class="btn btn-ghost" onclick={openTransferModal} disabled={transferring}>
						{#if transferring}<span class="loading loading-spinner loading-sm"></span>{/if}
						Leave Group
					</button>

					<dialog id="transfer-modal" class="modal">
						<div class="modal-box">
							<h3 class="text-lg font-bold">Transfer Ownership & Leave</h3>
							<p class="py-4">You are the group owner. Choose a new owner before leaving.</p>
							<select class="select select-bordered w-full" bind:value={newOwnerId}>
								<option value="" disabled>Select new owner</option>
								{#each otherMembers as member}
									<option value={member.user_id}>{member.profiles?.username ?? 'Unknown'}</option>
								{/each}
							</select>
							<div class="modal-action">
								<button class="btn btn-ghost" onclick={closeTransferModal}>Cancel</button>
								<button class="btn btn-primary" disabled={!newOwnerId} onclick={handleTransferAndLeave}>
									Transfer & Leave
								</button>
							</div>
						</div>
						<form method="dialog" class="modal-backdrop">
							<button>close</button>
						</form>
					</dialog>
				{/if}
			</div>

			{#if isOwner}
				<form method="POST" action="?/delete" use:enhance bind:this={deleteForm} class="hidden"></form>
				<ConfirmModal
					id="delete-modal"
					title="Delete Group"
					message="Are you sure you want to delete this group? This cannot be undone."
					triggerLabel="Delete Group"
					triggerClass="btn-error btn-outline btn-sm"
					confirmLabel="Delete"
					confirmClass="btn-error"
					onConfirm={() => { unsubscribeRealtime(); deleteForm?.requestSubmit(); }}
				/>
			{/if}
		</div>
	</section>
</PageContainer>
