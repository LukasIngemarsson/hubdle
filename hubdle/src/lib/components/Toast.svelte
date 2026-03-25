<script lang="ts">
	import { toasts } from '$lib/stores/toast';
	import { fly } from 'svelte/transition';
</script>

{#if $toasts.length > 0}
	<div class="fixed top-2 right-2 z-50 flex flex-col gap-2 sm:top-4 sm:right-4">
		{#each $toasts as toast (toast.id)}
			<button
				in:fly={{ x: 80, duration: 300 }}
				out:fly={{ x: 80, duration: 250 }}
				class="alert relative max-w-sm cursor-pointer overflow-hidden shadow-lg {toast.type === 'error' ? 'alert-error' : 'alert-success'}"
				onclick={() => toasts.dismiss(toast.id)}
			>
				<span>{toast.message}</span>
				<div
					class="absolute bottom-0 left-0 h-0.5 {toast.type === 'error' ? 'bg-error-content/30' : 'bg-success-content/30'}"
					style="animation: toast-drain {toast.duration}ms linear forwards"
				></div>
			</button>
		{/each}
	</div>
{/if}

<style>
	@keyframes toast-drain {
		from { width: 100%; }
		to { width: 0%; }
	}
</style>
