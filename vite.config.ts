import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api/imf': {
                target: 'https://www.imf.org/external/datamapper/api/v1',
                changeOrigin: true,
                rewrite: (path) => path.replace(/^\/api\/imf/, ''),
                secure: false,
            }
        }
    }
})
