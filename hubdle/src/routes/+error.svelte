<script lang="ts">
	import { page } from '$app/stores';
	import PageContainer from '$lib/components/PageContainer.svelte';
</script>

<svelte:head>
	<title>{$page.status} - Hubdle</title>
</svelte:head>

<PageContainer>
	<div class="flex h-full flex-col items-center justify-center py-24 text-center">
		<p class="text-6xl font-bold opacity-20">{$page.status}</p>
		<p class="mt-4 text-lg opacity-70">{$page.error?.message ?? 'Something went wrong.'}</p>
		<a href="/" class="btn btn-primary btn-outline mt-6">Go Home</a>
	</div>
</PageContainer>
