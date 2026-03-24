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

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let leaveForm = $state<HTMLFormElement>();
	let deleteForm = $state<HTMLFormElement>();
	let transferForm = $state<HTMLFormElement>();
	let newOwnerId = $state('');

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

	<ScoreSubmitForm {form} games={data.games} />
	<Leaderboard games={data.games} submissions={data.submissions} members={data.allMembers} />
	<RecentSubmissions submissions={data.submissions} members={data.allMembers} />

	<section class="card mt-6 bg-base-200">
		<div class="card-body">
			<h2 class="card-title text-base">Members
				<span class="badge badge-sm">{data.members.length}</span>
			</h2>
			<div class="flex flex-wrap gap-2">
				{#each data.members as member}
					<div class="badge badge-outline gap-1 py-3">
						{member.profiles?.username ?? 'Unknown'}
						{#if member.user_id === data.group.created_by}
							<span class="text-xs opacity-50">Owner</span>
						{/if}
					</div>
				{/each}
			</div>
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
					<button type="button" class="btn btn-ghost" onclick={openTransferModal}>
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
