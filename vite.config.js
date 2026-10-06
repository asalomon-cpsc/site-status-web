import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

/** Must match path used in useApi when VITE_DEV_PROXY is true */
const AZURE_FUNCTIONS_ORIGIN =
  process.env.VITE_PROXY_TARGET ||
  'https://wt-health-dev-ok2.azurewebsites.net'

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 8080,
    proxy: {
      // Browser calls same-origin /__watchtower/... → Vite forwards to Azure (no CORS in dev).
      '/__watchtower': {
        target: AZURE_FUNCTIONS_ORIGIN,
        changeOrigin: true,
        secure: true,
        rewrite: (p) => p.replace(/^\/__watchtower/, '')
      }
    }
  }
})
