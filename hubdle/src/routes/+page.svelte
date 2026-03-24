<script lang="ts">
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
</script>

{#if data.user}
	<div class="p-6">
		<h1 class="text-2xl font-bold">Welcome to Hubdle</h1>
		<p class="mt-2 opacity-70">You're signed in as {data.user.email}.</p>
		<a href="/groups" class="btn btn-primary mt-4">Your Groups</a>
	</div>
{:else}
	<div class="flex min-h-[60vh] flex-col items-center justify-center text-center">
		<h1 class="text-4xl font-bold">Hubdle</h1>
		<p class="mt-4 max-w-md opacity-70">
			Compete with friends at daily games. Track scores, climb leaderboards, and settle who's really the best.
		</p>
		<a href="/login" class="btn btn-primary mt-6">Get Started</a>
	</div>
{/if}
