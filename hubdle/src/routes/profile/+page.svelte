<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import PageContainer from '$lib/components/PageContainer.svelte';
	import Avatar from '$lib/components/Avatar.svelte';
	import PencilIcon from '$lib/components/icons/PencilIcon.svelte';
	import { toasts } from '$lib/stores/toast.svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let editing = $state(false);
	let saving = $state(false);
	let uploadingAvatar = $state(false);
	let removingAvatar = $state(false);
	let username = $state('');
	$effect(() => {
		username = data.username;
	});
	$effect(() => {
		if (form?.success) editing = false;
	});

	let fileInput = $state<HTMLInputElement>();

	function startEditing() {
		username = data.username;
		editing = true;
	}

	function cancelEditing() {
		username = data.username;
		editing = false;
	}

	function triggerFileSelect() {
		fileInput?.click();
	}

	function handleFileSelected() {
		if (fileInput?.files?.length) {
			fileInput.form?.requestSubmit();
		}
	}
</script>

<svelte:head>
	<title>Profile - Hubdle</title>
</svelte:head>

<PageContainer>
	<div class="flex items-center justify-between">
		<h1 class="text-2xl font-bold">Profile</h1>
		<a href="/users/{data.username}" class="link text-sm opacity-70">View public profile</a>
	</div>

	<div class="mt-6 grid gap-6">
		<div class="card bg-base-200">
			<div class="card-body">
				<h2 class="card-title text-base">Account</h2>

				<div class="flex flex-col gap-4">
					<div class="flex items-center gap-4">
						<Avatar src={data.avatarUrl} username={data.username} size="lg" />
						<div class="flex items-center gap-1">
							<form
								method="POST"
								action="?/uploadAvatar"
								enctype="multipart/form-data"
								use:enhance={() => {
									uploadingAvatar = true;
									return async ({ result, update }) => {
										await update();
										uploadingAvatar = false;
										if (result.type === 'success')
											toasts.push('success', 'Profile picture updated!');
										else if (result.type === 'failure' && result.data?.error)
											toasts.push('error', result.data.error as string);
									};
								}}
							>
								<input
									type="file"
									name="avatar"
									accept="image/jpeg,image/png,image/webp"
									class="hidden"
									bind:this={fileInput}
									onchange={handleFileSelected}
								/>
								<button
									type="button"
									class="btn btn-ghost btn-sm"
									onclick={triggerFileSelect}
									disabled={uploadingAvatar}
								>
									{#if uploadingAvatar}<span class="loading loading-spinner loading-xs"></span>{/if}
									Change picture
								</button>
							</form>
							{#if data.avatarUrl}
								<form
									method="POST"
									action="?/removeAvatar"
									use:enhance={() => {
										removingAvatar = true;
										return async ({ result, update }) => {
											await update();
											removingAvatar = false;
											if (result.type === 'success')
												toasts.push('success', 'Profile picture removed.');
											else if (result.type === 'failure' && result.data?.error)
												toasts.push('error', result.data.error as string);
										};
									}}
								>
									<button class="btn btn-ghost btn-sm text-error" disabled={removingAvatar}>
										{#if removingAvatar}<span class="loading loading-spinner loading-xs"
											></span>{/if}
										Remove
									</button>
								</form>
							{/if}
						</div>
					</div>

					<div>
						<p class="text-xs opacity-50">Username</p>
						{#if editing}
							<form
								method="POST"
								action="?/updateUsername"
								use:enhance={() => {
									saving = true;
									return async ({ result, update }) => {
										await update();
										saving = false;
										if (result.type === 'success') toasts.push('success', 'Username updated!');
										else if (result.type === 'failure' && result.data?.error)
											toasts.push('error', result.data.error as string);
									};
								}}
								class="mt-1 inline-flex items-center gap-2"
							>
								<input
									type="text"
									name="username"
									class="input input-bordered input-sm w-48"
									bind:value={username}
									maxlength="30"
									required
								/>
								<button class="btn btn-primary btn-sm" disabled={saving}>
									{#if saving}<span class="loading loading-spinner loading-xs"></span>{/if}
									Save
								</button>
								<button type="button" class="btn btn-ghost btn-sm" onclick={cancelEditing}
									>Cancel</button
								>
							</form>
						{:else}
							<div class="inline-flex items-center gap-1.5">
								<p class="text-lg font-medium">{data.username}</p>
								<button
									class="btn btn-ghost btn-xs btn-square"
									onclick={startEditing}
									aria-label="Edit username"
								>
									<PencilIcon class="h-3.5 w-3.5 opacity-50" />
								</button>
							</div>
						{/if}
					</div>

					<p class="text-sm opacity-50">{data.email}</p>
				</div>
			</div>
		</div>
	</div>
</PageContainer>
