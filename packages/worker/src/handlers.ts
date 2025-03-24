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
