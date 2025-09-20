import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit()
	],
	server: {
		host: '0.0.0.0', // Untuk akses dari network lain (RasPi)
		port: 5173
	},
	preview: {
		host: '0.0.0.0',
		port: 4173
	}
});