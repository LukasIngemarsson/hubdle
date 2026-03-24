<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto } from '$app/navigation';
	import '../app.css';
	import NavLink from '$lib/components/NavLink.svelte';

	import type { LayoutData } from './$types';

	let { data, children }: { data: LayoutData; children: any } = $props();

	let menuOpen = $state(false);

	async function handleLogout() {
		menuOpen = false;
		await data.supabase.auth.signOut();
		goto('/login', { invalidateAll: true });
	}
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<div class="grid h-screen grid-rows-[auto_1fr]">
	<nav class="navbar bg-base-200 px-4">
		<div class="flex-1 items-center gap-6">
			<a href="/" class="text-xl font-bold">Hubdle</a>
			{#if data.user}
				<div class="hidden items-center gap-4 sm:flex">
					<NavLink href="/groups" label="Groups" />
					<NavLink href="/profile" label="Profile" />
				</div>
			{/if}
		</div>

		<div class="flex-none">
			{#if data.user}
				<div class="hidden sm:block">
					<button class="nav-link text-sm opacity-70 transition-colors hover:opacity-100" onclick={handleLogout}>
						Log Out
					</button>
				</div>

				<div class="sm:hidden">
					<button
						class="btn btn-ghost btn-sm btn-square"
						onclick={() => (menuOpen = !menuOpen)}
						aria-label="Toggle menu"
					>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-5 w-5">
							{#if menuOpen}
								<path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
							{:else}
								<path fill-rule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75Zm0 5A.75.75 0 0 1 2.75 9h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 9.75Zm0 5a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
							{/if}
						</svg>
					</button>
				</div>
			{:else}
				<a href="/login" class="btn btn-primary btn-sm">Log In</a>
			{/if}
		</div>
	</nav>

	{#if menuOpen && data.user}
		<div class="border-b border-base-300 bg-base-200 px-4 py-3 sm:hidden">
			<div class="flex flex-col gap-3">
				<a href="/groups" class="text-sm" onclick={() => (menuOpen = false)}>Groups</a>
				<a href="/profile" class="text-sm" onclick={() => (menuOpen = false)}>Profile</a>
				<button class="text-left text-sm opacity-70" onclick={handleLogout}>Log Out</button>
			</div>
		</div>
	{/if}

	<main class="h-full overflow-y-auto">
		{@render children()}
	</main>
</div>
