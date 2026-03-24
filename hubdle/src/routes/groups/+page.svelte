<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let copiedId = $state<string | null>(null);

	async function copyCode(e: MouseEvent, code: string, id: string) {
		e.preventDefault();
		e.stopPropagation();
		await navigator.clipboard.writeText(code);
		copiedId = id;
		setTimeout(() => (copiedId = null), 1500);
	}
</script>

<PageContainer>
	<h1 class="text-2xl font-bold">Your Groups</h1>

	{#if form?.error}
		<Alert type="error" message={form.error} />
	{/if}

	<div class="mt-6 flex gap-4">
		<form method="POST" action="?/create" use:enhance class="flex gap-2">
			<input
				type="text"
				name="name"
				placeholder="Group name"
				class="input input-bordered"
				required
			/>
			<button class="btn btn-primary">Create</button>
		</form>

		<form method="POST" action="?/join" use:enhance class="flex gap-2">
			<input
				type="text"
				name="code"
				placeholder="Invite code"
				class="input input-bordered"
				required
			/>
			<button class="btn btn-secondary">Join</button>
		</form>
	</div>

	{#if data.groups.length === 0}
		<p class="mt-8 opacity-70">You're not in any groups yet. Create one or join with an invite code.</p>
	{:else}
		<div class="mt-8 grid gap-4">
			{#each data.groups as group}
				<a href="/groups/{group.id}" class="card bg-base-200 shadow transition hover:shadow-lg">
					<div class="card-body flex-row items-center justify-between">
						<h2 class="card-title">{group.name}</h2>
						<button
							class="flex items-center gap-1 font-mono text-sm opacity-70 hover:opacity-100"
							onclick={(e) => copyCode(e, group.invite_code, group.id)}
						>
							<span class="badge badge-ghost font-mono">{group.invite_code}</span>
							<span class="text-xs">{copiedId === group.id ? 'Copied!' : 'Copy'}</span>
						</button>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</PageContainer>
