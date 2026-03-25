import type { SubmitFunction } from '@sveltejs/kit';
import { toasts } from '$lib/stores/toast';

/**
 * Creates a use:enhance callback that shows toast notifications for form action results.
 * Optionally accepts a success message override (defaults to the message from the form result).
 */
export function toastEnhance(successMessage?: string): SubmitFunction {
	return () => {
		return async ({ result, update }) => {
			await update();
			if (result.type === 'success') {
				toasts.push('success', successMessage ?? 'Done!');
			} else if (result.type === 'failure' && result.data?.error) {
				toasts.push('error', result.data.error as string);
			}
		};
	};
}
