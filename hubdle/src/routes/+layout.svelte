<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { goto } from '$app/navigation';
	import { navigating } from '$app/state';
	import '../app.css';
	import { page } from '$app/stores';
	import NavLink from '$lib/components/NavLink.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';
	import { onMount } from 'svelte';
	import { theme } from '$lib/stores/theme.svelte';
	import type { LayoutData } from './$types';

	injectAnalytics({ mode: dev ? 'development' : 'production' });

	let { data, children }: { data: LayoutData; children: any } = $props();

	onMount(() => theme.apply());

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

	let profileOpen = $state(false);

	async function handleLogout() {
		menuOpen = false;
		profileOpen = false;
		await data.supabase.auth.signOut();
		goto('/login', { invalidateAll: true });
	}
</script>

<svelte:window onclick={() => { if (profileOpen) profileOpen = false; }} />

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
		<div class="navbar mx-auto max-w-4xl px-6 {$page.url.pathname.startsWith('/login') ? 'justify-center' : ''}">
			{#if !$page.url.pathname.startsWith('/login')}
			<div class="flex flex-1 items-center gap-6">
				<a href="/" class="flex items-center gap-2 text-xl font-bold">
					<img src={favicon} alt="Hubdle" class="h-7 w-7" />
					Hubdle
				</a>
				{#if data.user}
					<div class="hidden items-center gap-4 sm:flex">
						<NavLink href="/groups" label="Groups" badge={data.groupInviteCount} />
						<NavLink href="/friends" label="Friends" badge={data.friendRequestCount} />
					</div>
				{/if}
			</div>

			<div class="flex-none">
				{#if data.user}
					<div class="hidden items-center gap-2 sm:flex">
						<div class="relative">
							<button
								class="flex cursor-pointer items-center gap-1.5 rounded-full px-2 py-1 transition-colors hover:bg-base-300"
								onclick={(e) => { e.stopPropagation(); profileOpen = !profileOpen; }}
								aria-label="Profile menu"
								aria-expanded={profileOpen}
							>
								<Avatar src={data.avatarUrl} size="xs" />
								<span class="text-sm {profileOpen ? 'opacity-100' : 'opacity-70'}">{data.username ?? 'Profile'}</span>
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" class="h-3 w-3 opacity-50"><path fill-rule="evenodd" d="M4.22 6.22a.75.75 0 0 1 1.06 0L8 8.94l2.72-2.72a.75.75 0 1 1 1.06 1.06l-3.25 3.25a.75.75 0 0 1-1.06 0L4.22 7.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" /></svg>
							</button>
							{#if profileOpen}
								<div class="absolute right-0 top-full z-40 mt-1 w-40 rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg">
									<a href="/users/{data.username ?? ''}" class="block px-4 py-2 text-sm hover:bg-base-200" onclick={() => (profileOpen = false)}>View Profile</a>
									<a href="/profile" class="block px-4 py-2 text-sm hover:bg-base-200" onclick={() => (profileOpen = false)}>Edit Profile</a>
									<div class="my-1 border-t border-base-300"></div>
									<button class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-error hover:bg-base-200" onclick={handleLogout}>Log Out</button>
								</div>
							{/if}
						</div>
						<button
							class="btn btn-ghost btn-sm btn-square cursor-pointer opacity-70 hover:opacity-100"
							onclick={() => theme.toggle()}
							aria-label="Toggle theme"
						>
							{#if theme.isDark}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.06 1.06l1.06 1.06Z" /></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd" /></svg>
							{/if}
						</button>
					</div>

					<div class="sm:hidden">
						<button
							class="btn btn-ghost btn-sm btn-square"
							onclick={() => (menuOpen = !menuOpen)}
							aria-label="Toggle menu"
						aria-expanded={menuOpen}
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
				{:else if !$page.url.pathname.startsWith('/login')}
					<div class="flex items-center gap-2">
						<button
							class="btn btn-ghost btn-sm btn-square cursor-pointer opacity-70 hover:opacity-100"
							onclick={() => theme.toggle()}
							aria-label="Toggle theme"
						>
							{#if theme.isDark}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path d="M10 2a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 2ZM10 15a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5A.75.75 0 0 1 10 15ZM10 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6ZM15.657 5.404a.75.75 0 1 0-1.06-1.06l-1.061 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM6.464 14.596a.75.75 0 1 0-1.06-1.06l-1.06 1.06a.75.75 0 0 0 1.06 1.06l1.06-1.06ZM18 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 18 10ZM5 10a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1 0-1.5h1.5A.75.75 0 0 1 5 10ZM14.596 15.657a.75.75 0 0 0 1.06-1.06l-1.06-1.061a.75.75 0 1 0-1.06 1.06l1.06 1.06ZM5.404 6.464a.75.75 0 0 0 1.06-1.06l-1.06-1.06a.75.75 0 1 0-1.06 1.06l1.06 1.06Z" /></svg>
							{:else}
								<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-4 w-4"><path fill-rule="evenodd" d="M7.455 2.004a.75.75 0 0 1 .26.77 7 7 0 0 0 9.958 7.967.75.75 0 0 1 1.067.853A8.5 8.5 0 1 1 6.647 1.921a.75.75 0 0 1 .808.083Z" clip-rule="evenodd" /></svg>
							{/if}
						</button>
						<a href="/login" class="btn btn-primary btn-sm">Log In</a>
					</div>
				{/if}
			</div>
			{:else}
			<a href="/" class="flex items-center gap-2 text-xl font-bold">
				<img src={favicon} alt="Hubdle" class="h-7 w-7" />
				Hubdle
			</a>
			{/if}
		</div>
	</nav>

	{#if menuOpen && data.user}
		<div class="border-b border-base-300 bg-base-200 sm:hidden">
			<div class="mx-auto flex max-w-4xl flex-col gap-3 px-6 py-3">
				<a href="/groups" class="text-sm" onclick={() => (menuOpen = false)}>Groups{#if data.groupInviteCount > 0}<span class="badge badge-primary badge-xs ml-1">{data.groupInviteCount}</span>{/if}</a>
				<a href="/friends" class="text-sm" onclick={() => (menuOpen = false)}>Friends{#if data.friendRequestCount > 0}<span class="badge badge-primary badge-xs ml-1">{data.friendRequestCount}</span>{/if}</a>
				<a href="/users/{data.username ?? ''}" class="text-sm" onclick={() => (menuOpen = false)}>Profile</a>
				<button class="cursor-pointer text-left text-sm opacity-70" onclick={() => theme.toggle()}>
					{theme.isDark ? 'Light Mode' : 'Dark Mode'}
				</button>
				<button class="cursor-pointer text-left text-sm opacity-70" onclick={handleLogout}>Log Out</button>
			</div>
		</div>
	{/if}

	<main class="h-full overflow-y-auto">
		{@render children()}
	</main>
</div>

<Toast />
