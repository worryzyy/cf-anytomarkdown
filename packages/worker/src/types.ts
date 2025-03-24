/**
 * toMarkdown输入文档定义
 */
export interface toMarkdownDocument {
	/**
	 * 文档名称
	 */
	name: string

	/**
	 * 文档内容（Blob类型）
	 */
	blob: Blob
}

/**
 * toMarkdown转换结果定义
 */
export interface toMarkdownDocumentResult {
	/**
	 * 原始文档名称
	 */
	name: string

	/**
	 * 文档的MIME类型
	 */
	mimeType: string

	/**
	 * 输出格式，通常是'markdown'
	 */
	format: string

	/**
	 * 转换后的Markdown中估算的token数量
	 */
	tokens: number

	/**
	 * Markdown格式的文档内容
	 */
	data: string
}
