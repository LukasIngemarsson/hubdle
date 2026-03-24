<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();

	let email = $state('');
	let password = $state('');
	let isSignUp = $state(false);
	let loading = $state(false);
	let error = $state('');
	let signUpSuccess = $state(false);

	async function handleSubmit() {
		loading = true;
		error = '';
		signUpSuccess = false;

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
				signUpSuccess = true;
			}
		} else {
			const { error: err, data: signInData } = await supabase.auth.signInWithPassword({
				email,
				password
			});
			if (err) {
				error = err.message;
			} else {
				if (signInData.user) {
					const username = signInData.user.email?.split('@')[0] ?? `user-${signInData.user.id.slice(0, 8)}`;
					await supabase.from('profiles').upsert(
						{ id: signInData.user.id, username },
						{ onConflict: 'id', ignoreDuplicates: true }
					);
				}
				window.location.href = '/';
			}
		}

		loading = false;
	}
</script>

<div class="flex h-full items-center justify-center">
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
				{#if signUpSuccess}
					<p class="text-success text-sm">Check your email for a confirmation link.</p>
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
