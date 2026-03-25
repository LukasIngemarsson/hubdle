<script lang="ts">
	let {
		src = null,
		username = '',
		size = 'md'
	}: { src?: string | null; username?: string; size?: 'xs' | 'sm' | 'md' | 'lg' } = $props();

	const sizeClasses = {
		xs: 'h-5 w-5 text-[0.5rem]',
		sm: 'h-7 w-7 text-xs',
		md: 'h-10 w-10 text-sm',
		lg: 'h-20 w-20 text-2xl'
	} as const;

	let initials = $derived(
		username
			.split(/[\s_-]+/)
			.slice(0, 2)
			.map((w) => w[0]?.toUpperCase() ?? '')
			.join('') || '?'
	);

	let imgError = $state(false);
	let showImg = $derived(!!src && !imgError);
</script>

<div class="avatar {showImg ? '' : 'placeholder'}">
	<div class="rounded-full bg-neutral text-neutral-content {sizeClasses[size]}">
		{#if showImg}
			<img src={src} alt="{username}'s avatar" onerror={() => (imgError = true)} />
		{:else}
			<span>{initials}</span>
		{/if}
	</div>
</div>
