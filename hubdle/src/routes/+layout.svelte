<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import '../app.css';
	import NavLink from '$lib/components/NavLink.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import type { LayoutData } from './$types';

	injectAnalytics({ mode: dev ? 'development' : 'production' });
	
	let { data, children }: { data: LayoutData; children: any } = $props();

	let menuOpen = $state(false);
	let showLoadingBar = $state(false);
	let loadingDone = $state(false);

	$effect(() => {
		if (navigating.to) {
			showLoadingBar = true;
			loadingDone = false;
		} else if (showLoadingBar) {
			loadingDone = true;
			const timeout = setTimeout(() => {
				showLoadingBar = false;
				loadingDone = false;
			}, 300);
			return () => clearTimeout(timeout);
		}
	});

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
	{#if showLoadingBar}
		<div class="fixed top-0 left-0 z-50 h-0.5 w-full">
			<div class="h-full bg-primary {loadingDone ? 'loading-bar-done' : 'loading-bar'}"></div>
		</div>
	{/if}
	<nav class="bg-base-200">
		<div class="navbar mx-auto max-w-4xl px-6">
			<div class="flex flex-1 items-center gap-6">
				<a href="/" class="text-xl font-bold">Hubdle</a>
				{#if data.user}
					<div class="hidden items-center gap-4 sm:flex">
						<NavLink href="/groups" label="Groups" />
						<NavLink href="/friends" label="Friends" badge={data.friendRequestCount} />
					</div>
				{/if}
			</div>

			<div class="flex-none">
				{#if data.user}
					<div class="hidden items-center gap-4 sm:flex">
						<div class="flex items-center gap-1.5">
							<Avatar src={data.avatarUrl} size="xs" />
							<NavLink href="/users/{data.username ?? ''}" label="Profile" />
						</div>
						<button class="text-sm opacity-70 transition-colors hover:opacity-100" onclick={handleLogout}>
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
		</div>
	</nav>

	{#if menuOpen && data.user}
		<div class="border-b border-base-300 bg-base-200 sm:hidden">
			<div class="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-3">
				<a href="/groups" class="text-sm" onclick={() => (menuOpen = false)}>Groups</a>
				<a href="/friends" class="text-sm" onclick={() => (menuOpen = false)}>Friends{#if data.friendRequestCount > 0}<span class="badge badge-primary badge-xs ml-1">{data.friendRequestCount}</span>{/if}</a>
				<a href="/users/{data.username ?? ''}" class="text-sm" onclick={() => (menuOpen = false)}>Profile</a>
				<button class="text-left text-sm opacity-70" onclick={handleLogout}>Log Out</button>
			</div>
		</div>
	{/if}

	<main class="h-full overflow-y-auto">
		{@render children()}
	</main>
</div>

<Toast />
