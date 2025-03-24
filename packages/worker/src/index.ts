import {
	handleConvertRequest,
	handleBatchConvertRequest,
	handleStatusRequest
} from './handlers'
import { Env } from './types'

/**
 * 设置CORS头
 */
function setCorsHeaders(response: Response, env: Env): Response {
	// 获取允许的源
	const allowedOrigins = env.ALLOWED_ORIGINS
	if (!allowedOrigins) {
		return response
	}

	// 创建一个新的响应头对象
	const headers = new Headers(response.headers)

	// 设置CORS头
	if (allowedOrigins === '*') {
		headers.set('Access-Control-Allow-Origin', '*')
	} else {
		// 解析允许的源
		const origins = allowedOrigins.split(',').map((origin) => origin.trim())
		headers.set('Access-Control-Allow-Origin', origins.join(', '))
	}

	headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
	headers.set('Access-Control-Allow-Headers', 'Content-Type')
	headers.set('Access-Control-Max-Age', '86400') // 24小时

	// 创建新的响应对象
	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers
	})
}

/**
 * 主处理函数
 */
export default {
	/**
	 * 处理请求
	 */
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		// 处理预检请求
		if (request.method === 'OPTIONS') {
			return setCorsHeaders(new Response(null, { status: 204 }), env)
		}

		// 获取请求URL
		const url = new URL(request.url)
		const path = url.pathname

		// 根据路径处理不同的请求
		let response: Response

		try {
			if (path === '/convert' || path === '/api/convert') {
				// 单文件转换
				response = await handleConvertRequest(request, env)
			} else if (path === '/convert/batch' || path === '/api/convert/batch') {
				// 批量转换
				response = await handleBatchConvertRequest(request, env)
			} else if (path === '/status' || path === '/api/status') {
				// 状态检查
				response = handleStatusRequest()
			} else {
				// 404未找到
				response = new Response(
					JSON.stringify({
						success: false,
						error: 'Not found'
					}),
					{
						status: 404,
						headers: {
							'Content-Type': 'application/json'
						}
					}
				)
			}
		} catch (error) {
			// 处理内部错误
			console.error('Unhandled error:', error)

			response = new Response(
				JSON.stringify({
					success: false,
					error:
						error instanceof Error ? error.message : 'An unknown error occurred'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 设置CORS头并返回
		return setCorsHeaders(response, env)
	}
}
