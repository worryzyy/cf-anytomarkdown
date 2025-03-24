import { ApiResponse, ConversionResult } from './types'

// API基础URL，从环境变量获取
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || ''

/**
 * 处理API错误
 */
const handleApiError = (error: unknown): string => {
	if (error instanceof Error) {
		return error.message
	}
	return '未知错误'
}

/**
 * 将文件转换为Markdown
 */
export const convertToMarkdown = async (
	files: File[]
): Promise<ApiResponse> => {
	try {
		// 创建FormData对象用于文件上传
		const formData = new FormData()

		// 添加所有文件
		files.forEach((file) => {
			formData.append('files', file)
		})

		// 发送请求
		const response = await fetch(`${API_BASE_URL}/convert`, {
			method: 'POST',
			body: formData
		})

		// 检查HTTP状态
		if (!response.ok) {
			const errorText = await response.text()
			throw new Error(`API错误 (${response.status}): ${errorText}`)
		}

		// 解析响应
		const data = (await response.json()) as ApiResponse

		// 检查API响应状态
		if (!data.success) {
			throw new Error(data.error || '转换失败')
		}

		return data
	} catch (error) {
		console.error('转换过程中出错:', error)
		return {
			success: false,
			error: handleApiError(error)
		}
	}
}

/**
 * 检查服务状态
 */
export async function checkServiceStatus(): Promise<{
	status: string
	version: string
}> {
	try {
		const response = await fetch(`${API_BASE_URL}/api/status`)

		if (!response.ok) {
			throw new Error(`服务器错误: ${response.status}`)
		}

		const data = await response.json()

		if (!data.success) {
			throw new Error('获取服务状态失败')
		}

		return {
			status: data.status,
			version: data.version
		}
	} catch (error) {
		console.error('状态检查请求失败:', error)
		throw error
	}
}

/**
 * 通过文件上传进行转换
 * @param file 要转换的文件
 */
export async function convertFile(file: File): Promise<ConversionResult> {
	try {
		const formData = new FormData()
		formData.append('file', file)

		const response = await fetch(`${API_BASE_URL}/api/convert`, {
			method: 'POST',
			body: formData
		})

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.error || `服务器错误: ${response.status}`)
		}

		const data = await response.json()

		if (!data.success || !data.results || data.results.length === 0) {
			throw new Error('转换失败，服务器没有返回有效结果')
		}

		return data.results[0]
	} catch (error) {
		console.error('文件转换请求失败:', error)
		throw error
	}
}

/**
 * 批量转换文件
 * @param files 要转换的文件数组
 */
export async function convertMultipleFiles(
	files: File[]
): Promise<ConversionResult[]> {
	try {
		const formData = new FormData()

		// 添加所有文件到formData
		files.forEach((file) => {
			formData.append('file', file)
		})

		const response = await fetch(`${API_BASE_URL}/api/convert/batch`, {
			method: 'POST',
			body: formData
		})

		if (!response.ok) {
			const errorData = await response.json()
			throw new Error(errorData.error || `服务器错误: ${response.status}`)
		}

		const data = await response.json()

		if (!data.success || !data.results) {
			throw new Error('批量转换失败，服务器没有返回有效结果')
		}

		return data.results
	} catch (error) {
		console.error('批量文件转换请求失败:', error)
		throw error
	}
}
