<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let email = $state('');
	let password = $state('');
	let isSignUp = $state(false);
	let loading = $state(false);
	let error = $state('');

	async function handleSubmit() {
		loading = true;
		error = '';

		const { supabase } = data;

		if (isSignUp) {
			const { error: err } = await supabase.auth.signUp({
				email,
				password,
				options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
			});
			if (err) {
				error = err.message;
			} else {
				error = '';
				alert('Check your email for a confirmation link.');
			}
		} else {
			const { error: err } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (err) {
				error = err.message;
			} else {
				window.location.href = '/';
			}
		}

		loading = false;
	}
</script>

<div class="flex min-h-screen items-center justify-center">
	<div class="card w-full max-w-sm bg-base-200 shadow-xl">
		<div class="card-body">
			<h2 class="card-title justify-center text-2xl">
				{isSignUp ? 'Sign Up' : 'Log In'}
			</h2>

			<form onsubmit={handleSubmit} class="mt-4 flex flex-col gap-4">
				<label class="floating-label">
					<span>Email</span>
					<input
						type="email"
						placeholder="Email"
						class="input input-bordered w-full"
						bind:value={email}
						required
					/>
				</label>

				<label class="floating-label">
					<span>Password</span>
					<input
						type="password"
						placeholder="Password"
						class="input input-bordered w-full"
						bind:value={password}
						required
						minlength="6"
					/>
				</label>

				{#if error}
					<p class="text-error text-sm">{error}</p>
				{/if}

				<button class="btn btn-primary w-full" disabled={loading}>
					{#if loading}
						<span class="loading loading-spinner loading-sm"></span>
					{:else}
						{isSignUp ? 'Sign Up' : 'Log In'}
					{/if}
				</button>
			</form>

			<div class="divider"></div>

			<p class="text-center text-sm">
				{isSignUp ? 'Already have an account?' : "Don't have an account?"}
				<button class="link link-primary" onclick={() => (isSignUp = !isSignUp)}>
					{isSignUp ? 'Log In' : 'Sign Up'}
				</button>
			</p>
		</div>
	</div>
</div>
