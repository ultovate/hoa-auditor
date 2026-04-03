import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    target: 'esnext',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        auth: resolve(__dirname, 'auth.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        summary: resolve(__dirname, 'summary.html'),
        report:  resolve(__dirname, 'report.html'),
        buyer:   resolve(__dirname, 'buyer.html'),
        sample:  resolve(__dirname, 'sample.html'),
      }
    }
  }
})
