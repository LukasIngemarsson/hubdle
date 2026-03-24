<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Alert from '$lib/components/Alert.svelte';
	import CopyBadge from '$lib/components/CopyBadge.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();
</script>

<PageContainer>
	<h1 class="text-2xl font-bold">Your Groups</h1>

	{#if form?.error}
		<Alert type="error" message={form.error} />
	{/if}

	<div class="mt-6 grid gap-4 sm:grid-cols-2">
		<form method="POST" action="?/create" use:enhance class="card bg-base-200">
			<div class="card-body gap-3">
				<h2 class="card-title text-sm">Create a group</h2>
				<input
					type="text"
					name="name"
					placeholder="Group name"
					class="input input-bordered w-full"
					required
				/>
				<button class="btn btn-primary w-full">Create</button>
			</div>
		</form>

		<form method="POST" action="?/join" use:enhance class="card bg-base-200">
			<div class="card-body gap-3">
				<h2 class="card-title text-sm">Join a group</h2>
				<input
					type="text"
					name="code"
					placeholder="Invite code"
					class="input input-bordered w-full"
					required
				/>
				<button class="btn btn-primary btn-outline w-full">Join</button>
			</div>
		</form>
	</div>

	{#if data.groups.length === 0}
		<div class="mt-12 flex flex-col items-center gap-3 text-center opacity-60">
			<p class="text-4xl">🏆</p>
			<p class="font-medium">No groups yet</p>
			<p class="text-sm">Create a group or join one with an invite code above.</p>
		</div>
	{:else}
		<div class="mt-8 grid gap-3">
			{#each data.groups as group}
				<a href="/groups/{group.id}" class="card bg-base-200 shadow-sm transition hover:shadow-md">
					<div class="card-body flex-row items-center justify-between py-4">
						<div>
							<h2 class="text-lg font-semibold">{group.name}</h2>
							<p class="text-sm opacity-50">{group.member_count} {group.member_count === 1 ? 'member' : 'members'}</p>
						</div>
						<CopyBadge
							text={group.invite_code}
							onclick={(e) => { e.preventDefault(); e.stopPropagation(); }}
						/>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</PageContainer>
