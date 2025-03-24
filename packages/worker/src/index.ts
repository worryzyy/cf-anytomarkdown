import { Router } from 'itty-router'
import { toMarkdownDocument, toMarkdownDocumentResult } from './types'

// 环境变量类型定义
export interface Env {
	AI: {
		toMarkdown(
			documents: toMarkdownDocument[]
		): Promise<toMarkdownDocumentResult[]>
	}
	// 环境变量
	ENVIRONMENT: string
	MAX_FILE_SIZE?: string
	ENABLE_DEBUG?: string
	CORS_ALLOWED_ORIGINS?: string
}

// 创建路由器
const router = Router()

// 处理CORS的中间件
const withCors = (request: Request, env: Env) => {
	// 获取允许的跨域来源
	const corsOrigins = env.CORS_ALLOWED_ORIGINS
		? env.CORS_ALLOWED_ORIGINS.split(',')
		: []
	const origin = request.headers.get('Origin')

	// 如果没有配置CORS或者请求来源不在允许列表中，则跳过CORS处理
	if (
		!origin ||
		(corsOrigins.length > 0 &&
			!corsOrigins.includes(origin) &&
			!corsOrigins.includes('*'))
	) {
		return
	}

	// 设置CORS头到请求上下文中，供后续使用
	request.corsOrigin = origin
}

// 验证文件大小是否在允许范围内
function validateFileSize(size: number, env: Env): boolean {
	const maxFileSize = env.MAX_FILE_SIZE
		? parseInt(env.MAX_FILE_SIZE)
		: 5 * 1024 * 1024 // 默认5MB，降低以避免AI服务限制错误
	return size <= maxFileSize
}

// 验证文件类型是否支持
function validateFileType(mimeType: string): boolean {
	// 支持的MIME类型
	const supportedMimeTypes = [
		// PDF
		'application/pdf',
		// 图像
		'image/jpeg',
		'image/png',
		'image/webp',
		'image/svg+xml',
		// HTML
		'text/html',
		// XML
		'application/xml',
		'text/xml',
		// 电子表格
		'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
		'application/vnd.ms-excel',
		'application/vnd.ms-excel.sheet.macroenabled.12',
		'application/vnd.ms-excel.sheet.binary.macroenabled.12',
		'application/vnd.oasis.opendocument.spreadsheet',
		'text/csv',
		'application/vnd.apple.numbers'
	]

	return supportedMimeTypes.includes(mimeType)
}

// 处理错误并返回标准格式的错误响应
function errorResponse(error: Error | string, status: number = 500): Response {
	const message = error instanceof Error ? error.message : error

	return Response.json(
		{
			success: false,
			error: message
		},
		{
			status: status
		}
	)
}

// 添加CORS头到响应
function addCorsHeaders(response: Response, request: Request): Response {
	// 如果请求没有CORS信息，直接返回原响应
	if (!request.corsOrigin) {
		return response
	}

	const newHeaders = new Headers(response.headers)
	newHeaders.set('Access-Control-Allow-Origin', request.corsOrigin)

	return new Response(response.body, {
		status: response.status,
		statusText: response.statusText,
		headers: newHeaders
	})
}

// 状态检查路由
router.get('/api/status', async (request, env: Env) => {
	return addCorsHeaders(
		Response.json({
			success: true,
			status: 'online',
			service: 'anytomarkdown',
			version: '1.0.0'
		}),
		request
	)
})

// 健康检查路由
router.get('/api/health', async (request, env: Env) => {
	return addCorsHeaders(
		Response.json({
			success: true,
			status: 'online',
			service: 'anytomarkdown',
			version: '1.0.0'
		}),
		request
	)
})

// 单文件转换路由
router.post('/api/convert', async (request, env: Env) => {
	try {
		// 检查是否是multipart/form-data请求
		const contentType = request.headers.get('Content-Type') || ''
		if (!contentType.includes('multipart/form-data')) {
			return addCorsHeaders(
				errorResponse('Content-Type must be multipart/form-data', 400),
				request
			)
		}

		// 解析表单数据
		const formData = await request.formData()
		const fileField = formData.get('file')

		if (!fileField || !(fileField instanceof File)) {
			return addCorsHeaders(errorResponse('No file uploaded', 400), request)
		}

		// 验证文件类型
		if (!validateFileType(fileField.type)) {
			return addCorsHeaders(
				errorResponse(`Unsupported file type: ${fileField.type}`, 415),
				request
			)
		}

		// 验证文件大小
		if (!validateFileSize(fileField.size, env)) {
			return addCorsHeaders(errorResponse('File too large', 413), request)
		}

		// 转换文件为Markdown
		const blob = new Blob([await fileField.arrayBuffer()], {
			type: fileField.type
		})

		try {
			const result = await env.AI.toMarkdown([
				{
					name: fileField.name,
					blob: blob
				}
			])

			return addCorsHeaders(
				Response.json({
					success: true,
					result: result[0]
				}),
				request
			)
		} catch (aiError) {
			// 处理AI服务特定错误
			console.error('AI Service Error:', aiError)

			// 检查是否是请求过大错误
			if (aiError instanceof Error && aiError.message.includes('3006')) {
				return addCorsHeaders(
					errorResponse(
						'文件内容过大，AI服务无法处理。请尝试更小的文件或减少内容复杂度。',
						413
					),
					request
				)
			}

			// 其他AI错误
			throw aiError
		}
	} catch (error) {
		console.error('Error in /api/convert:', error)
		return addCorsHeaders(
			errorResponse(error instanceof Error ? error : 'Unknown error', 500),
			request
		)
	}
})

// 批量文件转换路由
router.post('/api/batch-convert', async (request, env: Env) => {
	try {
		// 检查是否是multipart/form-data请求
		const contentType = request.headers.get('Content-Type') || ''
		if (!contentType.includes('multipart/form-data')) {
			return addCorsHeaders(
				errorResponse('Content-Type must be multipart/form-data', 400),
				request
			)
		}

		// 解析表单数据
		const formData = await request.formData()
		const documents: toMarkdownDocument[] = []
		const errors: string[] = []

		// 收集所有文件
		for (const [_, value] of formData.entries()) {
			if (value instanceof File) {
				// 验证文件类型
				if (!validateFileType(value.type)) {
					errors.push(`Unsupported file type: ${value.name} (${value.type})`)
					continue
				}

				// 验证文件大小
				if (!validateFileSize(value.size, env)) {
					errors.push(`File too large: ${value.name}`)
					continue
				}

				// 添加到文档列表
				documents.push({
					name: value.name,
					blob: new Blob([await value.arrayBuffer()], { type: value.type })
				})
			}
		}

		if (documents.length === 0) {
			return addCorsHeaders(
				errorResponse(
					errors.length > 0
						? `No valid files: ${errors.join('; ')}`
						: 'No files uploaded',
					400
				),
				request
			)
		}

		// 批量转换文件为Markdown
		try {
			const results = await env.AI.toMarkdown(documents)

			return addCorsHeaders(
				Response.json({
					success: true,
					results: results,
					errors: errors.length > 0 ? errors : undefined
				}),
				request
			)
		} catch (aiError) {
			// 处理AI服务特定错误
			console.error('AI Service Error in batch conversion:', aiError)

			// 检查是否是请求过大错误
			if (aiError instanceof Error && aiError.message.includes('3006')) {
				return addCorsHeaders(
					errorResponse(
						'批量处理文件过大，AI服务无法处理。请减少一次性上传的文件数量或大小。',
						413
					),
					request
				)
			}

			// 其他AI错误
			throw aiError
		}
	} catch (error) {
		console.error('Error in /api/batch-convert:', error)
		return addCorsHeaders(
			errorResponse(error instanceof Error ? error : 'Unknown error', 500),
			request
		)
	}
})

// OPTIONS请求处理程序
router.options('*', (request) => {
	// 如果请求没有CORS信息，返回204 No Content
	if (!request.corsOrigin) {
		return new Response(null, { status: 204 })
	}

	// 返回CORS预检响应
	return new Response(null, {
		headers: {
			'Access-Control-Allow-Origin': request.corsOrigin,
			'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
			'Access-Control-Allow-Headers': 'Content-Type, Authorization',
			'Access-Control-Max-Age': '86400'
		}
	})
})

// 404处理程序
router.all('*', () => errorResponse('Not Found', 404))

// 扩展Request类型以支持存储CORS信息
declare global {
	interface Request {
		corsOrigin?: string
	}

	interface FormData {
		entries(): IterableIterator<[string, FormDataEntryValue]>
	}
}

export default {
	async fetch(
		request: Request,
		env: Env,
		ctx: ExecutionContext
	): Promise<Response> {
		try {
			// 应用CORS中间件
			withCors(request, env)

			// 处理请求
			return await router.handle(request, env)
		} catch (error) {
			// 记录错误信息（如果启用了调试模式）
			if (env.ENABLE_DEBUG === 'true') {
				console.error('Uncaught error:', error)
			}

			// 返回错误响应
			return errorResponse(
				error instanceof Error ? error : 'Internal Server Error',
				500
			)
		}
	}
}
