<script lang="ts">
	import type { PageData } from './$types';
	import Alert from '$lib/components/Alert.svelte';
	import GoogleLogo from '$lib/components/icons/GoogleLogo.svelte';
	import MicrosoftLogo from '$lib/components/icons/MicrosoftLogo.svelte';

	let { data }: { data: PageData } = $props();

	let loading = $state(false);
	let error = $state('');

	async function handleOAuth(provider: 'azure' | 'google') {
		loading = true;
		error = '';

		const { error: err } = await data.supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${window.location.origin}/auth/callback`,
				...(provider === 'azure' && { scopes: 'openid email profile' })
			}
		});

		if (err) {
			error = err.message;
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Log In - Hubdle</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center">
	<div class="card w-full max-w-sm bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-2xl">Log In</h2>

			<div class="mt-4 flex flex-col gap-3">
				{#if error}
					<Alert type="error" message={error} />
				{/if}

				<button
					class="btn btn-outline w-full"
					disabled={loading}
					onclick={() => handleOAuth('google')}
				>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<GoogleLogo />
						Continue with Google
					{/if}
				</button>

				<button
					class="btn btn-outline w-full"
					disabled={loading}
					onclick={() => handleOAuth('azure')}
				>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						<MicrosoftLogo />
						Continue with Microsoft
					{/if}
				</button>
			</div>
		</div>
	</div>
</div>
