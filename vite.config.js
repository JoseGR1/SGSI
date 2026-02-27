import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
    base: '/SGSI/',
    build: {
        outDir: 'dist',
        rollupOptions: {
            input: {
                index: resolve(__dirname, 'index.html'),
                editor: resolve(__dirname, 'editor.html'),
            },
        },
    },
})