<script lang="ts">
	import { enhance } from '$app/forms';
	import Alert from './Alert.svelte';

	let { form }: { form: { error?: string; success?: boolean } | null } = $props();

	let rawText = $state('');

	$effect(() => {
		if (form?.success) rawText = '';
	});
</script>

<section class="card mt-6 bg-base-200">
	<div class="card-body">
		<h2 class="card-title text-base">Submit Score</h2>
		<form method="POST" action="?/submit" use:enhance class="flex flex-col gap-3">
			<textarea
				name="raw_text"
				placeholder="Paste your share text here (e.g. Wordle 1,234 3/6)"
				class="textarea textarea-bordered w-full"
				rows="3"
				required
				bind:value={rawText}
			></textarea>
			<button class="btn btn-primary w-fit">Submit</button>
		</form>

		{#if form?.error}
			<Alert type="error" message={form.error} />
		{/if}
		{#if form?.success}
			<Alert type="success" message="Score submitted!" />
		{/if}
	</div>
</section>
