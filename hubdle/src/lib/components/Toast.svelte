<script lang="ts">
	import { toasts } from '$lib/stores/toast.svelte';
	import { fly } from 'svelte/transition';
</script>

<div class="fixed top-2 right-2 z-50 flex flex-col gap-2 sm:top-4 sm:right-4">
	{#each toasts.items as toast (toast.id)}
		<button
			in:fly={{ x: 80, duration: 300 }}
			out:fly={{ x: 80, duration: 250 }}
			class="alert relative max-w-sm cursor-pointer overflow-hidden shadow-lg {toast.type === 'error' ? 'alert-error' : 'alert-success'}"
			onclick={() => toasts.dismiss(toast.id)}
		>
			<span>{toast.message}</span>
			<div
				class="absolute bottom-0 left-0 h-0.5 {toast.type === 'error' ? 'bg-error-content/30' : 'bg-success-content/30'}"
				style="animation: toast-drain {toast.duration}ms linear forwards; width: 100%"
			></div>
		</button>
	{/each}
</div>
