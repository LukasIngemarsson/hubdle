<script lang="ts">
	let {
		src = null,
		username = '',
		size = 'md'
	}: { src?: string | null; username?: string; size?: 'xs' | 'sm' | 'md' | 'lg' } = $props();

	const sizeClasses = {
		xs: 'h-6 w-6',
		sm: 'h-8 w-8',
		md: 'h-10 w-10',
		lg: 'h-20 w-20'
	} as const;

	const iconSizeClasses = {
		xs: 'h-3.5 w-3.5',
		sm: 'h-4.5 w-4.5',
		md: 'h-6 w-6',
		lg: 'h-12 w-12'
	} as const;

	let imgError = $state(false);
	let showImg = $derived(!!src && !imgError);
</script>

<div class="avatar {showImg ? '' : 'placeholder'}">
	<div class="flex items-center justify-center rounded-full bg-neutral text-neutral-content {sizeClasses[size]}">
		{#if showImg}
			<img src={src} alt="{username}'s avatar" onerror={() => (imgError = true)} />
		{:else}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="{iconSizeClasses[size]}">
				<path fill-rule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clip-rule="evenodd" />
			</svg>
		{/if}
	</div>
</div>
