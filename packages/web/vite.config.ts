import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src')
		}
	},
	server: {
		host: true,
		port: 3000,
		// 设置代理，本地开发时将API请求转发到Wrangler开发服务器
		proxy: {
			'/api': {
				target: 'http://localhost:8787',
				changeOrigin: true,
				rewrite: (path) => path.replace(/^\/api/, '')
			}
		}
	},
	build: {
		outDir: 'dist',
		// 生成sourcemap以便于调试生产环境代码
		sourcemap: true
	}
})
