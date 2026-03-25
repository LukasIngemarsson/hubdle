<script lang="ts">
	import { enhance } from '$app/forms';
	import ConfirmModal from '$lib/components/ConfirmModal.svelte';

	let {
		isOwner,
		isOnlyMember,
		otherMembers,
		onUnsubscribeRealtime
	}: {
		isOwner: boolean;
		isOnlyMember: boolean;
		otherMembers: {
			user_id: string;
			profiles: { username: string; avatar_url: string | null } | null;
		}[];
		onUnsubscribeRealtime: () => void;
	} = $props();

	let leaveForm = $state<HTMLFormElement>();
	let deleteForm = $state<HTMLFormElement>();
	let transferForm = $state<HTMLFormElement>();
	let newOwnerId = $state('');
	let transferring = $state(false);

	function openTransferModal() {
		(document.getElementById('transfer-modal') as HTMLDialogElement)?.showModal();
	}

	function closeTransferModal() {
		(document.getElementById('transfer-modal') as HTMLDialogElement)?.close();
	}

	function handleLeave() {
		onUnsubscribeRealtime();
		leaveForm?.requestSubmit();
	}

	function handleTransferAndLeave() {
		transferring = true;
		closeTransferModal();
		onUnsubscribeRealtime();
		transferForm?.requestSubmit();
	}
</script>

<section class="mt-12 border-t border-base-300 pt-6">
	<div class="flex items-center justify-between">
		<div>
			{#if !isOwner}
				<form
					method="POST"
					action="?/leave"
					use:enhance
					bind:this={leaveForm}
					class="hidden"
				></form>
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
				<form
					method="POST"
					action="?/leaveAndDelete"
					use:enhance
					bind:this={leaveForm}
					class="hidden"
				></form>
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
				<form
					method="POST"
					action="?/transferAndLeave"
					use:enhance
					bind:this={transferForm}
					class="hidden"
				>
					<input type="hidden" name="new_owner_id" value={newOwnerId} />
				</form>
				<button
					type="button"
					class="btn btn-ghost"
					onclick={openTransferModal}
					disabled={transferring}
				>
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
							<button
								class="btn btn-primary"
								disabled={!newOwnerId}
								onclick={handleTransferAndLeave}
							>
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
			<form
				method="POST"
				action="?/delete"
				use:enhance
				bind:this={deleteForm}
				class="hidden"
			></form>
			<ConfirmModal
				id="delete-modal"
				title="Delete Group"
				message="Are you sure you want to delete this group? This cannot be undone."
				triggerLabel="Delete Group"
				triggerClass="btn-error btn-outline btn-sm"
				confirmLabel="Delete"
				confirmClass="btn-error"
				onConfirm={() => {
					onUnsubscribeRealtime();
					deleteForm?.requestSubmit();
				}}
			/>
		{/if}
	</div>
</section>
