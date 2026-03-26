<script lang="ts">
	import CheckmarkIcon from '$lib/components/icons/CheckmarkIcon.svelte';
	import ClipboardIcon from '$lib/components/icons/ClipboardIcon.svelte';

	let {
		text,
		label,
		size = 'sm',
		onclick
	}: {
		text: string;
		label?: string;
		size?: 'sm' | 'lg';
		onclick?: (e: MouseEvent) => void;
	} = $props();

	let copied = $state(false);

	async function handleClick(e: MouseEvent) {
		onclick?.(e);
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button class="flex items-center gap-1 opacity-70 hover:opacity-100" onclick={handleClick}>
	<span class="badge badge-ghost font-mono {size === 'lg' ? 'text-lg' : 'text-sm'}"
		>{label ?? text}</span
	>
	{#if copied}
		<CheckmarkIcon class="h-4 w-4 text-success" />
	{:else}
		<ClipboardIcon />
	{/if}
</button>
