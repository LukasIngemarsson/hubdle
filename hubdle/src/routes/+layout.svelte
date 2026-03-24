<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto, invalidate } from '$app/navigation';
	import { onMount } from 'svelte';
	import '../app.css';

	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	onMount(() => {
		const {
			data: { subscription }
		} = data.supabase.auth.onAuthStateChange((_, session) => {
			invalidate('supabase:auth');
		});

		return () => subscription.unsubscribe();
	});

	async function handleLogout() {
		await data.supabase.auth.signOut();
		goto('/login');
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="flex min-h-screen flex-col">
	<nav class="navbar bg-base-200 px-4">
		<div class="flex-1">
			<a href="/" class="text-xl font-bold">Hubdle</a>
		</div>
		<div class="flex-none">
			{#if data.user}
				<span class="mr-3 text-sm opacity-70">{data.user.email}</span>
				<button class="btn btn-ghost btn-sm" onclick={handleLogout}>Log Out</button>
			{:else}
				<a href="/login" class="btn btn-primary btn-sm">Log In</a>
			{/if}
		</div>
	</nav>

	<main class="flex-1">
		{@render children()}
	</main>
</div>
