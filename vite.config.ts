import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

const allowedHost = process.env.ALLOWED_HOST || 'localhost';
const hosts = allowedHost.split(',');

export default defineConfig(() => {
	return {
		plugins: [sveltekit()],
		server: {
			port: process.env.PORT ? parseInt(process.env.PORT) : 3001, // A porta do container Docker // 3001 para DEV e 3000 para PROD
			strictPort: true, // Garante que não muda a porta
			host: true, // Permite acesso fora do localhost
			allowedHosts: hosts // Permite acesso ao domínio correto
		},
		resolve: {
			alias: {
				// força "proj4-fully-loaded" a apontar para proj4
				'proj4-fully-loaded': 'proj4'
			}
		}
	};
});
