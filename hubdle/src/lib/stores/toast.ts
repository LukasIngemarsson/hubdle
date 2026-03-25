import { writable } from 'svelte/store';

export type Toast = {
	id: number;
	type: 'error' | 'success';
	message: string;
};

let nextId = 0;

const { subscribe, update } = writable<Toast[]>([]);

export const toasts = {
	subscribe,
	push(type: Toast['type'], message: string, duration = 4000) {
		const id = nextId++;
		update((all) => [...all, { id, type, message }]);
		setTimeout(() => {
			update((all) => all.filter((t) => t.id !== id));
		}, duration);
	},
	dismiss(id: number) {
		update((all) => all.filter((t) => t.id !== id));
	}
};
