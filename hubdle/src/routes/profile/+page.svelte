<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Alert from '$lib/components/Alert.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let username = $state('');
	$effect(() => { username = data.username; });

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

				<form method="POST" action="?/updateUsername" use:enhance class="flex flex-col gap-3">
					<label class="form-control">
						<div class="label"><span class="label-text">Username</span></div>
						<input
							type="text"
							name="username"
							class="input input-bordered w-full"
							bind:value={username}
							maxlength="30"
							required
						/>
					</label>

					<div class="flex items-center justify-between">
						<p class="text-sm opacity-50">{data.email}</p>
						<button class="btn btn-primary btn-sm">Save</button>
					</div>
				</form>

				{#if form?.error}
					<Alert type="error" message={form.error} />
				{/if}
				{#if form?.success}
					<Alert type="success" message="Username updated!" />
				{/if}
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
