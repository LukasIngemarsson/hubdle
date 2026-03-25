import { writable } from 'svelte/store';

export type Toast = {
	id: number;
	type: 'error' | 'success';
	message: string;
	duration: number;
};

let nextId = 0;

const { subscribe, update } = writable<Toast[]>([]);

const APPEAR_DELAY = 500;

export const toasts = {
	subscribe,
	push(type: Toast['type'], message: string, duration = 4000) {
		const id = nextId++;
		// Delay appearance so the page has time to render the update first
		setTimeout(() => {
			update((all) => [...all, { id, type, message, duration }]);
			setTimeout(() => {
				update((all) => all.filter((t) => t.id !== id));
			}, duration);
		}, APPEAR_DELAY);
	},
	dismiss(id: number) {
		update((all) => all.filter((t) => t.id !== id));
	}
};
