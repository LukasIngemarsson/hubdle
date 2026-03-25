import { browser } from '$app/environment';

const STORAGE_KEY = 'hubdle-theme';

const Theme = { Light: 'light', Dark: 'dark' } as const;
type Theme = (typeof Theme)[keyof typeof Theme];

function getInitialTheme(): Theme {
	if (browser) {
		const stored = localStorage.getItem(STORAGE_KEY);
		if (stored === Theme.Light || stored === Theme.Dark) return stored;
		if (window.matchMedia('(prefers-color-scheme: dark)').matches) return Theme.Dark;
	}
	return Theme.Light;
}

let current = $state<Theme>(getInitialTheme());

export const theme = {
	get current() {
		return current;
	},
	get isDark() {
		return current === Theme.Dark;
	},
	toggle() {
		current = current === Theme.Light ? Theme.Dark : Theme.Light;
		if (browser) {
			localStorage.setItem(STORAGE_KEY, current);
			document.documentElement.setAttribute('data-theme', current);
		}
	},
	apply() {
		if (browser) {
			document.documentElement.setAttribute('data-theme', current);
		}
	}
};
