<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state(false);
	let username = $state('');
	$effect(() => { username = data.username; });
	$effect(() => { if (form?.success) editing = false; });

	function startEditing() {
		username = data.username;
		editing = true;
	}

	function cancelEditing() {
		username = data.username;
		editing = false;
	}

	const memberSince = $derived(
		new Date(data.memberSince).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		})
	);
</script>

<PageContainer>
	<h1 class="text-2xl font-bold">Profile</h1>

	<div class="mt-6 grid gap-6">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title text-base">Account</h2>

				<div class="flex flex-col gap-3">
					<div>
						<p class="text-xs opacity-50">Username</p>
						{#if editing}
							<form method="POST" action="?/updateUsername" use:enhance class="mt-1 flex items-center gap-2">
								<input
									type="text"
									name="username"
									class="input input-bordered input-sm"
									bind:value={username}
									maxlength="30"
									required
								/>
								<button class="btn btn-primary btn-sm">Save</button>
								<button type="button" class="btn btn-ghost btn-sm" onclick={cancelEditing}>Cancel</button>
							</form>
						{:else}
							<div class="flex items-center gap-2">
								<p class="text-lg font-medium">{data.username}</p>
								<button class="btn btn-ghost btn-xs" onclick={startEditing} aria-label="Edit username">
									<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="h-3.5 w-3.5 opacity-50">
										<path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
										<path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
									</svg>
								</button>
							</div>
						{/if}
					</div>

					<p class="text-sm opacity-50">{data.email}</p>

					{#if form?.error}
						<Alert type="error" message={form.error} />
					{/if}
					{#if form?.success}
						<Alert type="success" message="Username updated!" />
					{/if}
				</div>
			</div>
		</div>

		<div class="card border border-base-300">
			<div class="card-body">
				<h2 class="card-title text-base">Stats</h2>
				<div class="mt-2 grid grid-cols-2 gap-4">
					<div class="rounded-lg bg-base-200 p-4 text-center">
						<p class="text-3xl font-bold">{data.totalSubmissions}</p>
						<p class="text-sm opacity-60">Scores submitted</p>
					</div>
					<div class="rounded-lg bg-base-200 p-4 text-center">
						<p class="text-3xl font-bold">{data.totalGroups}</p>
						<p class="text-sm opacity-60">Groups joined</p>
					</div>
				</div>
				<p class="mt-2 text-xs opacity-40">Member since {memberSince}</p>
			</div>
		</div>
	</div>
</PageContainer>
