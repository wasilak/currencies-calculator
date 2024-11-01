import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default defineConfig(({ mode }) => ({
    plugins: [react()],
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './web/src'),
        },
        extensions: ['.tsx', '.ts', '.js'],
    },
    build: {
        outDir: 'web/assets/dist', // Output directory
        emptyOutDir: true,
        manifest: true, // Enable manifest generation
        rollupOptions: {
            input: './web/src/app/index.tsx', // Entry point
        },
        minify: mode === 'production', // Minify only if the mode is production
        sourcemap: mode !== 'production', // Generate source maps only in development
    },
    base: '/assets/dist/',
}));
