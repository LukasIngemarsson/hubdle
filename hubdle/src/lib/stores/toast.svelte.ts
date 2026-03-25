export type Toast = {
	id: number;
	type: 'error' | 'success';
	message: string;
	duration: number;
};

let nextId = 0;
let items = $state<Toast[]>([]);

export const toasts = {
	get items() {
		return items;
	},
	push(type: Toast['type'], message: string, duration = 4000) {
		const id = nextId++;
		items = [...items, { id, type, message, duration }];
		setTimeout(() => {
			items = items.filter((t) => t.id !== id);
		}, duration);
	},
	dismiss(id: number) {
		items = items.filter((t) => t.id !== id);
	}
};
