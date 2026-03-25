<script lang="ts">
	import UserIcon from '$lib/components/icons/UserIcon.svelte';

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
	<div
		class="flex items-center justify-center rounded-full bg-neutral text-neutral-content {sizeClasses[
			size
		]}"
	>
		{#if showImg}
			<img {src} alt="{username}'s avatar" onerror={() => (imgError = true)} />
		{:else}
			<UserIcon class={iconSizeClasses[size]} />
		{/if}
	</div>
</div>
