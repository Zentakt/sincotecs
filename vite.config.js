import { defineConfig } from 'vite';

export default defineConfig({
    base: '/sincotecs/',
    root: '.',
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: 'assets',
        rollupOptions: {
            output: {
                manualChunks: {
                    three: ['three'],
                    gsap: ['gsap']
                }
            }
        }
    },
    server: {
        port: 5173,
        open: true
    }
});
