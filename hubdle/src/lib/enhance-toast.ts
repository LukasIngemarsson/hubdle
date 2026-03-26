import type { SubmitFunction } from '@sveltejs/kit';
import { toasts } from '$lib/stores/toast.svelte';

/**
 * Creates a use:enhance callback that shows toast notifications for form action results.
 * Optionally accepts a success message override (defaults to the message from the form result).
 */
export function toastEnhance(successMessage?: string): SubmitFunction {
	return ({ submitter }) => {
		const btn = submitter instanceof HTMLButtonElement ? submitter : null;
		if (btn) {
			btn.disabled = true;
			const spinner = document.createElement('span');
			spinner.className = 'loading loading-spinner loading-xs';
			btn.prepend(spinner);
		}
		return async ({ result, update }) => {
			await update();
			if (btn) {
				btn.disabled = false;
				btn.querySelector('.loading')?.remove();
			}
			if (result.type === 'success') {
				toasts.push('success', successMessage ?? 'Done!');
			} else if (result.type === 'failure' && result.data?.error) {
				toasts.push('error', result.data.error as string);
			}
		};
	};
}
