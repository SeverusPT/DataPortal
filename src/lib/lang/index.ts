import { writable } from 'svelte/store';
import en from './en';
import pt from './pt';
import { browser } from '$app/environment';

export type Languages = 'en' | 'pt';
const translationsData = { en, pt };

// Store do idioma atual (reativa)
export const currentLang = writable<Languages>('pt');

// Store das traduções ativas (reativa)
export const t = writable<typeof en>(translationsData.pt);

// Inicializar idioma
export const initLanguage = () => {
	const storedLang = (localStorage.getItem('lang') as Languages) || 'pt';
	setLanguage(storedLang);
};

// Mudar idioma
export const setLanguage = (lang: Languages) => {
	if (translationsData[lang]) {
		currentLang.set(lang); // Atualiza a store do idioma
		t.set(translationsData[lang]); // Atualiza a store das traduções

		// Apenas guarda no localStorage se estiver no browser
		if (browser) {
			localStorage.setItem('lang', lang); // Guarda no localStorage
		}
	}
};
