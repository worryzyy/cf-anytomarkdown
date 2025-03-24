import { useState, useRef, DragEvent, ChangeEvent } from 'react';
import { convertToMarkdown } from '../api';
import { ConversionResult } from '../types';
import { useTranslation } from 'react-i18next';

interface FileUploadProps {
  onStartLoading: () => void;
  onEndLoading: () => void;
  onSuccess: (results: ConversionResult[]) => void;
  onError: (error: string) => void;
}

// 支持的文件类型
const SUPPORTED_FILE_EXTENSIONS = [
  // PDF 文档
  '.pdf',
  // 图片文件
  '.jpeg', '.jpg', '.png', '.webp', '.svg',
  // HTML 文档
  '.html',
  // XML 文档
  '.xml',
  // Microsoft Office 电子表格文档
  '.xlsx', '.xlsm', '.xlsb', '.xls', '.et',
  // 开放文档格式
  '.ods',
  // CSV 文件
  '.csv',
  // Apple 电子表格文档
  '.numbers'
];

// 支持的 MIME 类型
const SUPPORTED_MIME_TYPES = [
  // PDF 文档
  'application/pdf',
  // 图片文件
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml',
  // HTML 文档
  'text/html',
  // XML 文档
  'application/xml',
  // Microsoft Office 电子表格文档
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  'application/vnd.ms-excel',
  // 开放文档格式
  'application/vnd.oasis.opendocument.spreadsheet',
  // CSV 文件
  'text/csv',
  // Apple 电子表格文档
  'application/vnd.apple.numbers'
];

// 检查文件是否为支持的类型
const isFileSupported = (file: File): boolean => {
  // 检查文件扩展名
  const fileName = file.name.toLowerCase();
  const fileExtension = fileName.substring(fileName.lastIndexOf('.'));
  const hasValidExtension = SUPPORTED_FILE_EXTENSIONS.includes(fileExtension);

  // 检查 MIME 类型
  const fileType = file.type.toLowerCase();
  const hasValidMimeType = SUPPORTED_MIME_TYPES.includes(fileType);

  return hasValidExtension || hasValidMimeType;
};

const FileUpload = ({ onStartLoading, onEndLoading, onSuccess, onError }: FileUploadProps) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    setErrorMessage(null);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const supportedFiles = files.filter(isFileSupported);
      
      if (supportedFiles.length === 0) {
        setErrorMessage(t('errors.noSupportedFiles'));
        onError(t('errors.noSupportedFiles'));
        return;
      }
      
      if (supportedFiles.length < files.length) {
        const unsupportedCount = files.length - supportedFiles.length;
        setErrorMessage(t('errors.someFilesUnsupported', { count: unsupportedCount }));
        onError(t('errors.someFilesUnsupported', { count: unsupportedCount }));
      }
      
      setSelectedFiles(supportedFiles);
    }
  };

  // 处理文件选择
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const supportedFiles = files.filter(isFileSupported);
      
      if (supportedFiles.length === 0) {
        setErrorMessage(t('errors.noSupportedFiles'));
        onError(t('errors.noSupportedFiles'));
        return;
      }
      
      if (supportedFiles.length < files.length) {
        const unsupportedCount = files.length - supportedFiles.length;
        setErrorMessage(t('errors.someFilesUnsupported', { count: unsupportedCount }));
        onError(t('errors.someFilesUnsupported', { count: unsupportedCount }));
      }
      
      setSelectedFiles(supportedFiles);
    }
  };

  // 打开文件选择对话框
  const handleSelectFilesClick = () => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  // 移除文件
  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => {
      const newFiles = [...prev];
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  // 提交转换请求
  const handleSubmit = async () => {
    if (selectedFiles.length === 0) {
      setErrorMessage(t('errors.noFilesSelected'));
      onError(t('errors.noFilesSelected'));
      return;
    }

    try {
      setIsLoading(true);
      setErrorMessage(null);
      onStartLoading();
      const response = await convertToMarkdown(selectedFiles);

      if (response.success && response.results) {
        onSuccess(response.results);
      } else {
        const errorMsg = response.error || t('errors.conversionFailed');
        setErrorMessage(errorMsg);
        onError(errorMsg);
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : t('errors.conversionError');
      setErrorMessage(errorMsg);
      onError(errorMsg);
      console.error(error);
    } finally {
      setIsLoading(false);
      onEndLoading();
    }
  };

  return (
    <div className="space-y-4">
      {/* 拖放区域 */}
      <div
        className={`drop-area ${isDragging ? 'active' : ''} ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
        onDragOver={!isLoading ? handleDragOver : undefined}
        onDragLeave={!isLoading ? handleDragLeave : undefined}
        onDrop={!isLoading ? handleDrop : undefined}
        onClick={!isLoading ? handleSelectFilesClick : undefined}
      >
        <div className="text-gray-500 dark:text-gray-400">
          {isLoading ? (
            <>
              <svg 
                className="mx-auto h-12 w-12 animate-spin" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="mt-2">{t('common.processing')}</p>
            </>
          ) : (
            <>
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
              <p className="mt-2">{t('upload.dragDrop')}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {t('upload.supportedFormats')}
              </p>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept={SUPPORTED_FILE_EXTENSIONS.join(',')}
          disabled={isLoading}
        />
      </div>

      {/* 错误提示 */}
      {errorMessage && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-lg text-red-600 dark:text-red-300 text-sm">
          <p className="font-medium">{t('common.error')}:</p>
          <p>{errorMessage}</p>
        </div>
      )}

      {/* 选中的文件列表 */}
      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <h3 className="text-sm font-medium mb-2">{t('upload.selectedFiles')}:</h3>
          <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex justify-between items-center truncate">
                <span className="truncate">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                {!isLoading && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveFile(index);
                    }}
                    className="ml-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    title={t('upload.removeFile')}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 提交按钮 */}
      <div className="flex justify-end">
        <button
          onClick={handleSubmit}
          disabled={selectedFiles.length === 0 || isLoading}
          className={`
            px-4 py-2 rounded-md text-white flex items-center justify-center min-w-[150px]
            ${selectedFiles.length === 0 || isLoading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700'}
            transition duration-200
          `}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              {t('common.processing')}
            </>
          ) : (
            t('common.convert')
          )}
        </button>
      </div>
    </div>
  );
};

export default FileUpload; 