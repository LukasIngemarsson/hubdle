<script lang="ts">
	import { enhance } from '$app/forms';
	import Avatar from '$lib/components/Avatar.svelte';
	import CheckIcon from '$lib/components/icons/CheckIcon.svelte';
	import ClockIcon from '$lib/components/icons/ClockIcon.svelte';
	import PlusIcon from '$lib/components/icons/PlusIcon.svelte';
	import { toastEnhance } from '$lib/enhance-toast';

	let {
		members,
		invitableFriends,
		friendshipStatusMap,
		userId,
		ownerId
	}: {
		members: {
			user_id: string;
			profiles: { username: string; avatar_url: string | null } | null;
		}[];
		invitableFriends: { id: string; username: string }[];
		friendshipStatusMap: Record<string, string>;
		userId: string;
		ownerId: string;
	} = $props();
</script>

<section class="card mt-6 bg-base-200">
	<div class="card-body">
		<div class="flex items-center justify-between">
			<h2 class="card-title text-base">
				Members
				<span class="badge badge-sm">{members.length}</span>
			</h2>
			{#if invitableFriends.length > 0}
				<form
					method="POST"
					action="?/inviteFriend"
					use:enhance={toastEnhance('Invite sent!')}
					class="flex items-center gap-1.5"
				>
					<select name="friend_id" class="select select-bordered select-xs w-36 truncate" required>
						<option value="" disabled selected>Invite friend</option>
						{#each invitableFriends as friend}
							<option value={friend.id}>{friend.username}</option>
						{/each}
					</select>
					<button class="btn btn-primary btn-xs">Invite</button>
				</form>
			{/if}
		</div>
		<div class="flex flex-wrap gap-2">
			{#each members as member}
				{@const friendStatus = friendshipStatusMap[member.user_id]}
				{@const isself = member.user_id === userId}
				<div class="relative">
					<a
						href="/users/{member.profiles?.username ?? ''}"
						class="flex items-center gap-1.5 rounded-full border border-base-content/20 px-3 py-1.5 transition-colors hover:bg-base-300"
					>
						<Avatar
							src={member.profiles?.avatar_url}
							username={member.profiles?.username ?? 'Unknown'}
							size="xs"
						/>
						{member.profiles?.username ?? 'Unknown'}
						{#if member.user_id === ownerId}
							<span class="text-xs opacity-50">Owner</span>
						{/if}
					</a>
					{#if !isself}
						{#if friendStatus === 'accepted'}
							<span
								class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-success text-[10px] text-success-content"
								title="Friends"
							>
								<CheckIcon class="h-2.5 w-2.5" />
							</span>
						{:else if friendStatus === 'pending'}
							<span
								class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-warning text-[10px] text-warning-content"
								title="Request pending"
							>
								<ClockIcon />
							</span>
						{:else}
							<form
								method="POST"
								action="?/sendRequest"
								use:enhance={toastEnhance('Friend request sent!')}
								class="absolute -top-1 -right-1"
							>
								<input type="hidden" name="addressee_id" value={member.user_id} />
								<button
									class="flex h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-primary text-[10px] text-primary-content transition-transform hover:scale-110"
									title="Add Friend"
								>
									<PlusIcon />
								</button>
							</form>
						{/if}
					{/if}
				</div>
			{/each}
		</div>
	</div>
</section>
