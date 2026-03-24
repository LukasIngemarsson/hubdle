<script lang="ts">
	let {
		text,
		size = 'sm',
		onclick
	}: { text: string; size?: 'sm' | 'lg'; onclick?: (e: MouseEvent) => void } = $props();

	let copied = $state(false);

	async function handleClick(e: MouseEvent) {
		onclick?.(e);
		await navigator.clipboard.writeText(text);
		copied = true;
		setTimeout(() => (copied = false), 1500);
	}
</script>

<button
	class="flex items-center gap-1 opacity-70 hover:opacity-100"
	onclick={handleClick}
>
	<span class="badge badge-ghost font-mono {size === 'lg' ? 'text-lg' : 'text-sm'}">{text}</span>
	<span class="text-xs">{copied ? 'Copied!' : 'Copy'}</span>
</button>
