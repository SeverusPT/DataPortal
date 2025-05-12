import { writable } from 'svelte/store';

type Toast = {
	message: string;
	type: 'success' | 'error';
};

export const toasts = writable<Toast[]>([]);

export function toast(message: string, type: 'success' | 'error') {
	toasts.update((state) => [{ message: message, type: type }, ...state]);
	setTimeout(removeToast, 8000);
}

function removeToast() {
	toasts.update((state) => {
		return [...state.slice(0, state.length - 1)];
	});
}
