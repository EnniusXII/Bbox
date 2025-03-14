import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	server: {
		host: '0.0.0.0', // Gör att Vite lyssnar på alla nätverksinterface
		port: 5009,
		strictPort: true,
	},
});
