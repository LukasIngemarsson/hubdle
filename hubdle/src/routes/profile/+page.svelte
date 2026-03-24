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
		<!-- Account info -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title text-base">Account</h2>

				<form method="POST" action="?/updateUsername" use:enhance class="flex flex-col gap-3">
					<label class="form-control">
						<div class="label"><span class="label-text">Username</span></div>
						<div class="flex gap-2">
							<input
								type="text"
								name="username"
								class="input input-bordered flex-1"
								bind:value={username}
								maxlength="30"
								required
							/>
							<button class="btn btn-primary">Save</button>
						</div>
					</label>

					<label class="form-control">
						<div class="label"><span class="label-text">Email</span></div>
						<input
							type="email"
							value={data.email}
							class="input input-bordered"
							disabled
						/>
					</label>

					<p class="text-sm opacity-50">Member since {memberSince}</p>
				</form>

				{#if form?.error}
					<Alert type="error" message={form.error} />
				{/if}
				{#if form?.success}
					<Alert type="success" message="Username updated!" />
				{/if}
			</div>
		</div>

		<!-- Stats -->
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title text-base">Stats</h2>
				<div class="mt-2 flex gap-8">
					<div>
						<p class="text-3xl font-bold">{data.totalSubmissions}</p>
						<p class="text-sm opacity-60">Scores submitted</p>
					</div>
					<div>
						<p class="text-3xl font-bold">{data.totalGroups}</p>
						<p class="text-sm opacity-60">Groups joined</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</PageContainer>
