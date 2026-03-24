<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto } from '$app/navigation';
	import '../app.css';
	import NavLink from '$lib/components/NavLink.svelte';

	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	async function handleLogout() {
		await data.supabase.auth.signOut();
		goto('/login', { invalidateAll: true });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr]">
	<nav class="navbar bg-base-200 px-4">
		<div class="flex-1 gap-4">
			<a href="/" class="text-xl font-bold">Hubdle</a>
			{#if data.user}
				<NavLink href="/groups" label="Groups" />
			{/if}
		</div>
		<div class="flex-none">
			{#if data.user}
				<NavLink href="/profile" label="Profile" />
				<button class="btn btn-ghost btn-sm" onclick={handleLogout}>Log Out</button>
			{:else}
				<a href="/login" class="btn btn-primary btn-sm">Log In</a>
			{/if}
		</div>
	</nav>

	<main class="h-full overflow-y-auto">
		{@render children()}
	</main>
</div>
