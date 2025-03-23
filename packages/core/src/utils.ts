/**
 * 生成唯一ID
 */
export function generateId(): string {
	return Date.now().toString(36) + Math.random().toString(36).substring(2)
}

/**
 * 格式化文件大小
 * @param bytes 文件大小（字节）
 * @param decimals 小数位数
 */
export function formatFileSize(bytes: number, decimals: number = 2): string {
	if (bytes === 0) return '0 Bytes'

	const k = 1024
	const dm = decimals < 0 ? 0 : decimals
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

/**
 * 从文件名获取扩展名
 * @param filename 文件名
 */
export function getFileExtension(filename: string): string {
	return filename.slice(
		(Math.max(0, filename.lastIndexOf('.')) || Infinity) + 1
	)
}

/**
 * 判断是否为图片文件
 * @param filename 文件名或MIME类型
 */
export function isImageFile(fileNameOrMimeType: string): boolean {
	const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
	const imageMimeTypes = [
		'image/jpeg',
		'image/png',
		'image/gif',
		'image/bmp',
		'image/webp',
		'image/svg+xml'
	]

	if (fileNameOrMimeType.startsWith('image/')) {
		return imageMimeTypes.includes(fileNameOrMimeType)
	}

	const ext = getFileExtension(fileNameOrMimeType).toLowerCase()
	return imageExtensions.includes(ext)
}

/**
 * 判断是否为PDF文件
 * @param filename 文件名或MIME类型
 */
export function isPdfFile(fileNameOrMimeType: string): boolean {
	return (
		fileNameOrMimeType === 'application/pdf' ||
		getFileExtension(fileNameOrMimeType).toLowerCase() === 'pdf'
	)
}

/**
 * 安全地从对象获取属性值
 * @param obj 对象
 * @param path 属性路径，例如 'user.profile.name'
 * @param defaultValue 默认值
 */
export function get<T>(obj: any, path: string, defaultValue: T): T {
	const travel = (regexp: RegExp, obj: any): any =>
		String.prototype.split
			.call(path, regexp)
			.filter(Boolean)
			.reduce(
				(res, key) => (res !== null && res !== undefined ? res[key] : res),
				obj
			)

	const result = travel(/[,[\]]+?/g, obj)
	return result === undefined || result === null ? defaultValue : result
}

/**
 * 延迟函数
 * @param ms 延迟毫秒数
 */
export function delay(ms: number): Promise<void> {
	return new Promise((resolve) => setTimeout(resolve, ms))
}
