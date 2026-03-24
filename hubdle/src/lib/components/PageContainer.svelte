<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="mx-auto max-w-2xl p-6">
	{@render children()}
</div>
