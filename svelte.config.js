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
			trustedOrigins: [
				'http://localhost:3000',
				'http://localhost:5173', 
				'http://192.168.8.103:3000',
				'http://192.168.8.101:3000',
				'http://192.168.8.100:3000',
				'http://192.168.8.102:3000',
				'http://192.168.8.104:3000',
				'http://192.168.8.105:3000'
			]
		}
	}
};

export default config;