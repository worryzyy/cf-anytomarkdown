import { useState, FormEvent, ChangeEvent } from 'react';
import { convertUrlToMarkdown } from '../api';
import { ConversionResult } from '../types';

interface UrlInputProps {
  onStartLoading: () => void;
  onEndLoading: () => void;
  onSuccess: (results: ConversionResult[]) => void;
  onError: (error: string) => void;
}

const UrlInput = ({ onStartLoading, onEndLoading, onSuccess, onError }: UrlInputProps) => {
  const [url, setUrl] = useState('');
  const [isValidUrl, setIsValidUrl] = useState(false);

  // 处理URL输入变化
  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setUrl(inputValue);

    // 简单的URL验证
    try {
      const urlObj = new URL(inputValue);
      setIsValidUrl(urlObj.protocol === 'http:' || urlObj.protocol === 'https:');
    } catch (error) {
      setIsValidUrl(false);
    }
  };

  // 提交转换请求
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!isValidUrl) {
      onError('请输入有效的URL');
      return;
    }

    try {
      onStartLoading();
      const response = await convertUrlToMarkdown(url);

      if (response.success && response.results) {
        onSuccess(response.results);
      } else {
        onError(response.error || '转换失败');
      }
    } catch (error) {
      onError('转换过程中出错');
      console.error(error);
    } finally {
      onEndLoading();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="url"
          value={url}
          onChange={handleUrlChange}
          placeholder="https://example.com/document.pdf"
          className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
        />
        <button
          type="submit"
          disabled={!isValidUrl}
          className={`
            px-4 py-2 rounded-md text-white
            ${!isValidUrl
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'}
            transition duration-200
          `}
        >
          转换
        </button>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400">
        输入包含PDF、图片或其他支持文档类型的URL
      </p>
    </form>
  );
};

export default UrlInput; 