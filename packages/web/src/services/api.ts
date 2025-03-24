import axios from 'axios'

// 获取API基础URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
console.log(API_BASE_URL)
// API响应接口
export interface ApiResponse<T> {
	success: boolean
	result?: T
	error?: string
}

// 批量API响应接口
export interface BatchApiResponse<T> {
	success: boolean
	results?: T[]
	error?: string
}

// 转换单个文件
export const convertFile = async (file: File): Promise<ApiResponse<any>> => {
	try {
		const formData = new FormData()
		formData.append('file', file)

		const response = await axios.post(`${API_BASE_URL}/api/convert`, formData, {
			headers: {
				'Content-Type': 'multipart/form-data'
			}
		})

		return response.data
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			return error.response.data as ApiResponse<any>
		} else {
			return {
				success: false,
				error: '无法连接到服务器，请检查您的网络连接。'
			}
		}
	}
}

// 批量转换文件
export const convertMultipleFiles = async (
	files: File[]
): Promise<BatchApiResponse<any>> => {
	try {
		const formData = new FormData()

		files.forEach((file, index) => {
			formData.append(`file${index + 1}`, file)
		})

		const response = await axios.post(
			`${API_BASE_URL}/api/batch-convert`,
			formData,
			{
				headers: {
					'Content-Type': 'multipart/form-data'
				}
			}
		)

		return response.data
	} catch (error) {
		if (axios.isAxiosError(error) && error.response) {
			return error.response.data as BatchApiResponse<any>
		} else {
			return {
				success: false,
				error: '无法连接到服务器，请检查您的网络连接。'
			}
		}
	}
}

// 检查服务状态
export const checkServiceStatus = async (): Promise<ApiResponse<any>> => {
	try {
		const response = await axios.get(`${API_BASE_URL}/api/status`)
		return response.data
	} catch (error) {
		return {
			success: false,
			error: '服务不可用'
		}
	}
}
