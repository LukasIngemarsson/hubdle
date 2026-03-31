<script lang="ts">
	import favicon from '$lib/assets/favicon.svg';
	import { beforeNavigate, afterNavigate, goto } from '$app/navigation';
	import '../app.css';
	import { page } from '$app/stores';
	import NavLink from './NavLink.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import Toast from '$lib/components/Toast.svelte';
	import SunIcon from '$lib/components/icons/SunIcon.svelte';
	import MoonIcon from '$lib/components/icons/MoonIcon.svelte';
	import ChevronDownIcon from '$lib/components/icons/ChevronDownIcon.svelte';
	import MenuIcon from '$lib/components/icons/MenuIcon.svelte';
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
	let loadingTimeout: ReturnType<typeof setTimeout>;

	beforeNavigate(() => {
		clearTimeout(loadingTimeout);
		showLoadingBar = true;
		loadingDone = false;
		groupsOpen = false;
	});

	afterNavigate(() => {
		if (!showLoadingBar) return;
		loadingDone = true;
		loadingTimeout = setTimeout(() => {
			showLoadingBar = false;
			loadingDone = false;
		}, 300);
	});

	let profileOpen = $state(false);
	let groupsOpen = $state(false);

	async function handleLogout() {
		menuOpen = false;
		profileOpen = false;
		await data.supabase.auth.signOut();
		goto('/login', { invalidateAll: true });
	}
</script>

<svelte:window
	onclick={() => {
		if (profileOpen) profileOpen = false;
		if (groupsOpen) groupsOpen = false;
	}}
/>

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
		<div
			class="navbar mx-auto max-w-4xl px-6 {$page.url.pathname.startsWith('/login')
				? 'justify-center'
				: ''}"
		>
			{#if !$page.url.pathname.startsWith('/login')}
				<div class="flex flex-1 items-center gap-6">
					<a href="/" class="flex items-center gap-2 text-xl font-bold">
						<img src={favicon} alt="Hubdle" class="h-7 w-7" />
						Hubdle
					</a>
					{#if data.user}
						<div class="hidden items-center gap-4 sm:flex">
							<NavLink href="/games" label="Games" />
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<div
								class="relative"
								onmouseenter={() => { if (data.userGroups.length > 0) groupsOpen = true; }}
								onmouseleave={() => (groupsOpen = false)}
							>
								<NavLink href="/groups" label="Groups" badge={data.groupInviteCount} />
								{#if groupsOpen}
									<div
										class="absolute left-0 top-full z-40 pt-2"
									>
										<div class="w-48 rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg">
											<p class="px-4 py-1.5 text-xs font-medium opacity-50">Frequently visited</p>
											{#each data.userGroups.slice(0, 3) as group}
												<a
													href="/groups/{group.id}"
													class="block truncate px-4 py-2 text-sm hover:bg-base-200"
													onclick={() => (groupsOpen = false)}>{group.name}</a
												>
											{/each}
										</div>
									</div>
								{/if}
							</div>
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
									onclick={(e) => {
										e.stopPropagation();
										profileOpen = !profileOpen;
									}}
									aria-label="Profile menu"
									aria-expanded={profileOpen}
								>
									<Avatar src={data.avatarUrl} size="xs" />
									<span class="text-sm {profileOpen ? 'opacity-100' : 'opacity-70'}"
										>{data.username ?? 'Profile'}</span
									>
									<ChevronDownIcon class="h-3 w-3 opacity-50" />
								</button>
								{#if profileOpen}
									<div
										class="absolute right-0 top-full z-40 mt-1 w-40 rounded-lg border border-base-300 bg-base-100 py-1 shadow-lg"
									>
										<a
											href="/users/{data.username ?? ''}"
											class="block px-4 py-2 text-sm hover:bg-base-200"
											onclick={() => (profileOpen = false)}>View Profile</a
										>
										<a
											href="/profile"
											class="block px-4 py-2 text-sm hover:bg-base-200"
											onclick={() => (profileOpen = false)}>Edit Profile</a
										>
										<div class="my-1 border-t border-base-300"></div>
										<button
											class="block w-full cursor-pointer px-4 py-2 text-left text-sm text-error hover:bg-base-200"
											onclick={handleLogout}>Log Out</button
										>
									</div>
								{/if}
							</div>
							<button
								class="btn btn-ghost btn-sm btn-square cursor-pointer opacity-70 hover:opacity-100"
								onclick={() => theme.toggle()}
								aria-label="Toggle theme"
							>
								{#if theme.isDark}
									<SunIcon />
								{:else}
									<MoonIcon />
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
								<MenuIcon open={menuOpen} />
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
									<SunIcon />
								{:else}
									<MoonIcon />
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
				<a href="/games" class="text-sm" onclick={() => (menuOpen = false)}>Games</a>
				<a href="/groups" class="text-sm" onclick={() => (menuOpen = false)}
					>Groups{#if data.groupInviteCount > 0}<span class="badge badge-primary badge-xs ml-1"
							>{data.groupInviteCount}</span
						>{/if}</a
				>
				{#if data.userGroups.length > 0}
					<div class="flex flex-col gap-2 pl-4">
						{#each data.userGroups as group}
							<a
								href="/groups/{group.id}"
								class="text-sm opacity-70"
								onclick={() => (menuOpen = false)}>{group.name}</a
							>
						{/each}
					</div>
				{/if}
				<a href="/friends" class="text-sm" onclick={() => (menuOpen = false)}
					>Friends{#if data.friendRequestCount > 0}<span class="badge badge-primary badge-xs ml-1"
							>{data.friendRequestCount}</span
						>{/if}</a
				>
				<a href="/users/{data.username ?? ''}" class="text-sm" onclick={() => (menuOpen = false)}
					>Profile</a
				>
				<button class="cursor-pointer text-left text-sm opacity-70" onclick={() => theme.toggle()}>
					{theme.isDark ? 'Light Mode' : 'Dark Mode'}
				</button>
				<button class="cursor-pointer text-left text-sm opacity-70" onclick={handleLogout}
					>Log Out</button
				>
			</div>
		</div>
	{/if}

	<main class="h-full overflow-y-scroll">
		{@render children()}
	</main>
</div>

<Toast />
