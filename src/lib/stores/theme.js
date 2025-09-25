// src/lib/stores/theme.js
// Simple theme utilities for localStorage management

export const THEME_KEY = 'selected-theme';

// Get system theme preference
export function getSystemTheme() {
	if (typeof window !== 'undefined' && window.matchMedia) {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return 'light';
}

// Get initial theme (saved or system)
export function getInitialTheme() {
	if (typeof window === 'undefined') return 'light';
	
	try {
		const saved = localStorage.getItem(THEME_KEY);
		return saved || getSystemTheme();
	} catch {
		return 'light';
	}
}

// Save theme to localStorage
export function saveTheme(theme) {
	if (typeof window !== 'undefined') {
		try {
			localStorage.setItem(THEME_KEY, theme);
		} catch (e) {
			console.warn('Failed to save theme:', e);
		}
	}
}

// Apply theme to document
export function applyTheme(theme) {
	if (typeof window !== 'undefined') {
		document.documentElement.setAttribute('data-theme', theme);
	}
}