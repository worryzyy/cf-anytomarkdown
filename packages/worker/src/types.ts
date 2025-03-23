/**
 * Cloudflare Worker 环境变量类型
 */
export interface Env {
	// AI 绑定
	AI: any

	// 允许的 CORS 来源
	ALLOWED_ORIGINS: string

	// 环境（开发/生产）
	ENVIRONMENT?: string
}

/**
 * API 响应格式
 */
export interface ApiResponse {
	success: boolean
	results?: ToMarkdownDocumentResult[]
	error?: string
}

/**
 * 转换文档格式
 */
export interface ToMarkdownDocument {
	// 文档名称
	name: string

	// 文档内容 Blob
	blob: Blob
}

/**
 * 转换结果格式
 */
export interface ToMarkdownDocumentResult {
	// 文档名称
	name: string

	// MIME 类型，通常是 text/markdown
	mimeType: string

	// 输出格式，通常是 markdown
	format: string

	// 处理的令牌数
	tokens: number

	// Markdown 内容
	data: string
}
