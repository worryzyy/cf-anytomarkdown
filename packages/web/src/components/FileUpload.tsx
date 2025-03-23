import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { convertToMarkdown } from '../api';
import { ConversionResult } from '../types';

interface FileUploadProps {
  onStartLoading: () => void;
  onEndLoading: () => void;
  onSuccess: (results: ConversionResult[]) => void;
  onError: (error: string) => void;
}

const FileUpload = ({ onStartLoading, onEndLoading, onSuccess, onError }: FileUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 处理拖放事件
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setSelectedFiles(files);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setSelectedFiles(files);
    }
  };

  // 打开文件选择对话框
  const handleSelectFilesClick = () => {
    fileInputRef.current?.click();
  };

  // 提交转换请求
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      onError('请选择要转换的文件');
      return;
    }

    try {
      onStartLoading();
      const response = await convertToMarkdown(selectedFiles);

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
    <div className="space-y-4">
      {/* 拖放区域 */}
      <div
        className={`drop-area ${isDragging ? 'active' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectFilesClick}
      >
        <div className="text-gray-500 dark:text-gray-400">
          <svg
            className="mx-auto h-12 w-12"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <p className="mt-2">拖放文件到这里，或者点击选择文件</p>
          <p className="text-sm text-gray-400 dark:text-gray-500">
            支持PDF、图片、Office文档等多种格式
          </p>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {/* 选中的文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">已选择的文件:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="truncate">
                {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0}
          className={`
            px-4 py-2 rounded-md text-white 
            ${selectedFiles.length === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'}
            transition duration-200
          `}
        >
          转换为Markdown
        </button>
      </div>
    </div>
  );
};

export default FileUpload; 