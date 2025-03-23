import {
	Env,
	ApiResponse,
	ToMarkdownDocument,
	ToMarkdownDocumentResult
} from './types'

/**
 * 处理文件转换请求
 */
export async function handleConvertRequest(
	request: Request,
	env: Env
): Promise<Response> {
	try {
		// 检查请求方法
		if (request.method !== 'POST') {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Method not allowed. Only POST requests are supported.'
				}),
				{
					status: 405,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 检查是否为multipart/form-data
		const contentType = request.headers.get('Content-Type') || ''
		if (!contentType.includes('multipart/form-data')) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid content type. Only multipart/form-data is supported.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 解析请求表单数据
		const formData = await request.formData()
		const documents: ToMarkdownDocument[] = []

		// 提取上传的文件
		for (const [name, value] of formData.entries()) {
			if (value instanceof File) {
				const fileBuffer = await value.arrayBuffer()
				documents.push({
					name: value.name,
					blob: new Blob([fileBuffer], {
						type: value.type || 'application/octet-stream'
					})
				})
			}
		}

		// 检查是否有文件上传
		if (documents.length === 0) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'No files were uploaded.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 使用Cloudflare AI进行转换
		let results: ToMarkdownDocumentResult[] = []
		try {
			results = await env.AI.toMarkdown(documents)
		} catch (aiError) {
			console.error('AI conversion error:', aiError)
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Failed to convert document. AI service error.'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 返回转换结果
		const response: ApiResponse = {
			success: true,
			results
		}

		return new Response(JSON.stringify(response), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
	} catch (error) {
		// 处理错误
		console.error('Error processing convert request:', error)

		return new Response(
			JSON.stringify({
				success: false,
				error:
					error instanceof Error ? error.message : 'An unknown error occurred.'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
	}
}

/**
 * 处理批量转换请求
 */
export async function handleBatchConvertRequest(
	request: Request,
	env: Env
): Promise<Response> {
	try {
		// 检查请求方法
		if (request.method !== 'POST') {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Method not allowed. Only POST requests are supported.'
				}),
				{
					status: 405,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 检查是否为multipart/form-data
		const contentType = request.headers.get('Content-Type') || ''
		if (!contentType.includes('multipart/form-data')) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid content type. Only multipart/form-data is supported.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 解析请求表单数据
		const formData = await request.formData()
		const documents: ToMarkdownDocument[] = []

		// 提取上传的文件
		for (const [name, value] of formData.entries()) {
			if (value instanceof File) {
				const fileBuffer = await value.arrayBuffer()
				documents.push({
					name: value.name,
					blob: new Blob([fileBuffer], {
						type: value.type || 'application/octet-stream'
					})
				})
			}
		}

		// 检查是否有文件上传
		if (documents.length === 0) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'No files were uploaded.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 限制批量转换的文件数量
		const MAX_BATCH_FILES = 10
		if (documents.length > MAX_BATCH_FILES) {
			return new Response(
				JSON.stringify({
					success: false,
					error: `Too many files. Maximum ${MAX_BATCH_FILES} files allowed for batch conversion.`
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 使用Cloudflare AI进行转换
		let results: ToMarkdownDocumentResult[] = []
		try {
			results = await env.AI.toMarkdown(documents)
		} catch (aiError) {
			console.error('AI batch conversion error:', aiError)
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Failed to convert documents. AI service error.'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 返回转换结果
		const response: ApiResponse = {
			success: true,
			results
		}

		return new Response(JSON.stringify(response), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
	} catch (error) {
		// 处理错误
		console.error('Error processing batch convert request:', error)

		return new Response(
			JSON.stringify({
				success: false,
				error:
					error instanceof Error ? error.message : 'An unknown error occurred.'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
	}
}

/**
 * 处理URL转换请求
 */
export async function handleUrlConvertRequest(
	request: Request,
	env: Env
): Promise<Response> {
	try {
		// 检查请求方法
		if (request.method !== 'POST') {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Method not allowed. Only POST requests are supported.'
				}),
				{
					status: 405,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 解析请求JSON
		let requestData
		try {
			requestData = (await request.json()) as { url: string }
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid JSON data.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 验证URL
		if (!requestData.url || typeof requestData.url !== 'string') {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'URL is required.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 验证URL格式
		let urlObj: URL
		try {
			urlObj = new URL(requestData.url)
			// 确保使用http或https协议
			if (urlObj.protocol !== 'http:' && urlObj.protocol !== 'https:') {
				throw new Error('Invalid URL protocol')
			}
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Invalid URL format. Must be a valid HTTP or HTTPS URL.'
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 从URL获取文件
		let response
		try {
			response = await fetch(requestData.url, {
				headers: {
					'User-Agent': 'AnyToMarkdown/1.0'
				}
			})
		} catch (error) {
			return new Response(
				JSON.stringify({
					success: false,
					error: `Failed to fetch URL: ${
						error instanceof Error ? error.message : 'Unknown error'
					}`
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		if (!response.ok) {
			return new Response(
				JSON.stringify({
					success: false,
					error: `Failed to fetch URL: ${response.status} ${response.statusText}`
				}),
				{
					status: 400,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 读取响应内容
		const contentType =
			response.headers.get('Content-Type') || 'application/octet-stream'
		const buffer = await response.arrayBuffer()

		// 获取文件名
		let filename = 'document'

		// 从URL路径中获取文件名
		const pathname = urlObj.pathname
		if (pathname) {
			const pathParts = pathname.split('/')
			const lastPart = pathParts[pathParts.length - 1]
			if (lastPart && lastPart.length > 0) {
				filename = lastPart
			}
		}

		// 从Content-Disposition头中获取文件名
		const contentDisposition = response.headers.get('Content-Disposition')
		if (contentDisposition) {
			const filenameMatch = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(
				contentDisposition
			)
			if (filenameMatch && filenameMatch[1]) {
				let extractedName = filenameMatch[1].replace(/['"]/g, '')
				if (extractedName.length > 0) {
					filename = extractedName
				}
			}
		}

		// 如果是HTML内容，可以尝试从标题中获取文档名
		if (contentType.includes('text/html')) {
			try {
				const html = new TextDecoder().decode(buffer)
				const titleMatch = /<title[^>]*>([^<]+)<\/title>/i.exec(html)
				if (titleMatch && titleMatch[1]) {
					filename = titleMatch[1].trim() || filename
				}
			} catch (error) {
				console.error('Error extracting title from HTML:', error)
				// 继续使用之前确定的文件名
			}
		}

		// 创建文档对象
		const documents: ToMarkdownDocument[] = [
			{
				name: filename,
				blob: new Blob([buffer], { type: contentType })
			}
		]

		// 使用Cloudflare AI进行转换
		let results: ToMarkdownDocumentResult[] = []
		try {
			results = await env.AI.toMarkdown(documents)
		} catch (aiError) {
			console.error('AI URL conversion error:', aiError)
			return new Response(
				JSON.stringify({
					success: false,
					error: 'Failed to convert URL content. AI service error.'
				}),
				{
					status: 500,
					headers: {
						'Content-Type': 'application/json'
					}
				}
			)
		}

		// 返回转换结果
		const apiResponse: ApiResponse = {
			success: true,
			results
		}

		return new Response(JSON.stringify(apiResponse), {
			headers: {
				'Content-Type': 'application/json'
			}
		})
	} catch (error) {
		// 处理错误
		console.error('Error processing URL convert request:', error)

		return new Response(
			JSON.stringify({
				success: false,
				error:
					error instanceof Error ? error.message : 'An unknown error occurred.'
			}),
			{
				status: 500,
				headers: {
					'Content-Type': 'application/json'
				}
			}
		)
	}
}

/**
 * 处理状态请求
 */
export function handleStatusRequest(): Response {
	return new Response(
		JSON.stringify({
			success: true,
			status: 'online',
			service: 'anytomarkdown',
			version: '1.0.0'
		}),
		{
			headers: {
				'Content-Type': 'application/json'
			}
		}
	)
}
