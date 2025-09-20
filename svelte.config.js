import adapter from '@sveltejs/adapter-node';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			// Konfigurasi untuk deployment lintas platform
			out: 'build',
			precompress: false,
			envPrefix: ''
		}),
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;