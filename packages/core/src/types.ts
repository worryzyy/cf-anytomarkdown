/**
 * 转换结果
 */
export interface ConversionResult {
	// 文档名称
	name: string

	// MIME 类型
	mimeType: string

	// 输出格式（通常是 'markdown'）
	format: string

	// 使用的令牌数量
	tokens: number

	// Markdown 内容
	data: string
}

/**
 * API响应
 */
export interface ApiResponse {
	success: boolean
	results?: ConversionResult[]
	error?: string
}

/**
 * 转换状态
 */
export type ConversionStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * 通知类型
 */
export type NotificationType = 'success' | 'error' | 'info'

/**
 * 通知信息
 */
export interface Notification {
	id: string
	type: NotificationType
	message: string
}
