// 全局类型声明，确保Worker环境中能使用Web API类型
// 这样不需要额外的DOM类型库，就能使用Blob等类型

// Blob 定义
interface Blob {
	readonly size: number
	readonly type: string
	arrayBuffer(): Promise<ArrayBuffer>
	slice(start?: number, end?: number, contentType?: string): Blob
	text(): Promise<string>
	stream(): ReadableStream
}

// File 定义
interface File extends Blob {
	readonly name: string
	readonly lastModified: number
}

// 声明全局构造函数
declare var Blob: {
	prototype: Blob
	new (blobParts?: BlobPart[], options?: BlobPropertyBag): Blob
}

declare var File: {
	prototype: File
	new (fileBits: BlobPart[], fileName: string, options?: FilePropertyBag): File
}

interface FilePropertyBag extends BlobPropertyBag {
	lastModified?: number
}

// BlobPart 和 BlobPropertyBag 定义
type BlobPart = BufferSource | Blob | string
interface BlobPropertyBag {
	type?: string
	endings?: 'transparent' | 'native'
}

// ArrayBuffer 等相关类型
interface BufferSource {}
interface ArrayBuffer {}
interface ArrayBufferView {}

// ReadableStream 定义
interface ReadableStream<R = any> {}

// Headers 定义
interface Headers {
	get(name: string): string | null
	set(name: string, value: string): void
}

declare var Headers: {
	prototype: Headers
	new (init?: HeadersInit): Headers
}

type HeadersInit = Headers | Iterable<[string, string]> | Record<string, string>

// 添加Request和Response类型
interface Request {
	readonly method: string
	readonly url: string
	readonly headers: Headers
	formData(): Promise<FormData>
	json<T>(): Promise<T>
}

interface Response {
	readonly ok: boolean
	readonly status: number
	readonly statusText: string
	readonly headers: Headers
	readonly body: ReadableStream<Uint8Array> | null
	arrayBuffer(): Promise<ArrayBuffer>
	json<T>(): Promise<T>
	text(): Promise<string>
}

declare var Response: {
	prototype: Response
	new (body?: BodyInit | null, init?: ResponseInit): Response
}

interface ResponseInit {
	status?: number
	statusText?: string
	headers?: HeadersInit
}

type BodyInit =
	| ReadableStream
	| Blob
	| ArrayBuffer
	| ArrayBufferView
	| string
	| null

interface FormData {
	append(name: string, value: string | Blob, fileName?: string): void
	entries(): IterableIterator<[string, FormDataEntryValue]>
}

type FormDataEntryValue = File | string

declare var FormData: {
	prototype: FormData
	new (): FormData
}

// 添加URL类型
interface URL {
	readonly href: string
	readonly origin: string
	readonly protocol: string
	readonly host: string
	readonly hostname: string
	readonly port: string
	readonly pathname: string
	readonly search: string
	readonly hash: string
}

declare var URL: {
	prototype: URL
	new (url: string, base?: string): URL
}

// 添加TextDecoder类型
interface TextDecoder {
	decode(input?: BufferSource): string
}

declare var TextDecoder: {
	prototype: TextDecoder
	new (label?: string, options?: TextDecoderOptions): TextDecoder
}

interface TextDecoderOptions {
	fatal?: boolean
	ignoreBOM?: boolean
}

// 添加console
interface Console {
	log(...data: any[]): void
	error(...data: any[]): void
}

declare var console: Console

// Cloudflare Workers 特定类型
interface ExecutionContext {
	waitUntil(promise: Promise<any>): void
	passThroughOnException(): void
}
