import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import dotenv from 'dotenv';
import { visualizer } from 'rollup-plugin-visualizer';

// Load environment variables
dotenv.config();

export default defineConfig(({ mode }) => ({
    plugins: [
        react(),
        // Add bundle analyzer in production builds
        mode === 'production' && visualizer({
            filename: 'bundle-analysis.html',
            open: false,
            gzipSize: true,
            brotliSize: true,
        }),
    ].filter(Boolean),
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
            output: {
                // Manual chunk splitting for better caching
                manualChunks: {
                    // Vendor chunks
                    'react-vendor': ['react', 'react-dom'],
                    'ui-vendor': [
                        '@radix-ui/react-dropdown-menu',
                        '@radix-ui/react-label', 
                        '@radix-ui/react-select',
                        '@radix-ui/react-slot',
                        'class-variance-authority',
                        'clsx',
                        'tailwind-merge',
                        'tailwindcss-animate'
                    ],
                    'i18n-vendor': ['i18next', 'i18next-browser-languagedetector', 'react-i18next'],
                    'chart-vendor': ['recharts'],
                    'utils-vendor': ['axios', 'lucide-react'],
                },
                // Optimize chunk naming
                chunkFileNames: (chunkInfo) => {
                    const facadeModuleId = chunkInfo.facadeModuleId ? chunkInfo.facadeModuleId.split('/').pop() : 'chunk';
                    return `js/[name]-[hash].js`;
                },
                entryFileNames: 'js/[name]-[hash].js',
                assetFileNames: (assetInfo) => {
                    const info = assetInfo.name.split('.');
                    const ext = info[info.length - 1];
                    if (/\.(css)$/.test(assetInfo.name)) {
                        return `css/[name]-[hash].${ext}`;
                    }
                    return `assets/[name]-[hash].${ext}`;
                },
            },
        },
        minify: mode === 'production', // Minify only if the mode is production
        sourcemap: mode !== 'production', // Generate source maps only in development
        // Increase chunk size warning limit
        chunkSizeWarningLimit: 1000,
        // Enable tree shaking
        target: 'es2015',
    },
    base: '/assets/dist/',
    // Optimize dependencies
    optimizeDeps: {
        include: [
            'react',
            'react-dom',
            'recharts',
            'i18next',
            'react-i18next',
            'axios',
            'lucide-react'
        ],
    },
}));
