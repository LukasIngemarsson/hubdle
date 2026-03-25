<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import { fly, fade } from 'svelte/transition';
</script>

{#if $toasts.length > 0}
	<div class="fixed top-2 right-2 z-50 flex flex-col gap-2 sm:top-4 sm:right-4">
		{#each $toasts as toast (toast.id)}
			<button
				in:fly={{ x: 80, duration: 250 }}
				out:fade={{ duration: 150 }}
				class="alert max-w-sm cursor-pointer shadow-lg {toast.type === 'error' ? 'alert-error' : 'alert-success'}"
				onclick={() => toasts.dismiss(toast.id)}
			>
				<span>{toast.message}</span>
			</button>
		{/each}
	</div>
{/if}
