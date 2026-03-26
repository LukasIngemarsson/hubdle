<script lang="ts">
	import { enhance } from '$app/forms';
	import { onDestroy } from 'svelte';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { SupabaseClient } from '@supabase/supabase-js';
	import Avatar from '$lib/components/Avatar.svelte';
	import { toasts } from '$lib/stores/toast.svelte';

	let {
		supabase,
		userId
	}: {
		supabase: SupabaseClient;
		userId: string;
	} = $props();

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
		if (query.length < 1) {
			searchResults = [];
			searched = false;
			return;
		}
		debounceTimer = setTimeout(() => runSearch(query), 300);
	}

	async function runSearch(query: string) {
		const { data: profiles } = await supabase
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
		const { data: existingFriendships } = await supabase
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

	function enhance_(successMessage: string): SubmitFunction {
		return ({ submitter }) => {
			const btn = submitter instanceof HTMLButtonElement ? submitter : null;
			if (btn) {
				btn.disabled = true;
				const spinner = document.createElement('span');
				spinner.className = 'loading loading-spinner loading-xs';
				btn.prepend(spinner);
			}
			return async ({ result, update }) => {
				if (btn) {
					btn.disabled = false;
					btn.querySelector('.loading')?.remove();
				}
				await update();
				if (result.type === 'success') {
					toasts.push('success', successMessage);
					if (searchQuery.trim().length >= 1) runSearch(searchQuery.trim());
				} else if (result.type === 'failure' && result.data?.error) {
					toasts.push('error', result.data.error as string);
				}
			};
		};
	}
</script>

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
								use:enhance={enhance_('Friend request accepted!')}
							>
								<input type="hidden" name="friendship_id" value={result.friendship.friendshipId} />
								<button class="btn btn-primary btn-sm">Accept</button>
							</form>
						{:else}
							<form
								method="POST"
								action="?/sendRequest"
								use:enhance={enhance_('Friend request sent!')}
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
