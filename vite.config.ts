import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        secure: false,
        timeout: 10000,
        connectTimeout: 5000,
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, res) => {
            console.error('Erro no proxy:', err.message)
            if (res && !res.headersSent) {
              res.writeHead(500, {
                'Content-Type': 'application/json',
              })
              res.end(JSON.stringify({
                error: 'Servidor backend não está rodando. Execute: npm run dev:server ou npm run dev:all'
              }))
            }
          })
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log(`[Proxy] ${req.method} ${req.url} -> http://localhost:3001${req.url}`)
          })
        },
      }
    }
  }
})
