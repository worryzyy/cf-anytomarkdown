import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  onBatchFileUpload?: (files: File[]) => void;
  isLoading: boolean;
  multiple?: boolean;
  serviceAvailable?: boolean | null;
}

// 支持的文件类型
const supportedFileTypes = [
  'application/pdf',                  // PDF
  'image/jpeg', 'image/png', 'image/webp', 'image/svg+xml', // 图像
  'text/html',                        // HTML
  'application/xml', 'text/xml',      // XML
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
  'application/vnd.ms-excel',
  'application/vnd.ms-excel.sheet.macroenabled.12',
  'application/vnd.ms-excel.sheet.binary.macroenabled.12',
  'application/vnd.oasis.opendocument.spreadsheet', // ODS
  'text/csv',                         // CSV
  'application/vnd.apple.numbers'     // Numbers
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

function FileUpload({ onFileUpload, onBatchFileUpload, isLoading, multiple = false, serviceAvailable = true }: FileUploadProps) {
  const [fileError, setFileError] = useState<string | null>(null);
  const [draggedFiles, setDraggedFiles] = useState<File[]>([]);

  // 文件拖放处理
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // 重置错误状态
    setFileError(null);

    // 验证是否有文件
    if (acceptedFiles.length === 0) {
      return;
    }

    // 验证文件类型和大小
    const validFiles: File[] = [];
    const errors: string[] = [];

    acceptedFiles.forEach(file => {
      // 验证文件类型
      if (!supportedFileTypes.includes(file.type)) {
        errors.push(`不支持的文件类型: ${file.name} (${file.type})`);
        return;
      }

      // 验证文件大小
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`文件过大: ${file.name} (最大限制5MB)`);
        return;
      }

      validFiles.push(file);
    });

    // 如果有错误，显示第一个错误
    if (errors.length > 0) {
      setFileError(errors[0]);
      if (errors.length > 1) {
        setFileError(`${errors[0]} 等${errors.length}个错误`);
      }
    }

    // 没有有效文件则返回
    if (validFiles.length === 0) {
      return;
    }

    // 处理文件上传
    if (multiple && onBatchFileUpload && validFiles.length > 1) {
      onBatchFileUpload(validFiles);
    } else {
      onFileUpload(validFiles[0]);
    }

    // 清空拖放状态
    setDraggedFiles([]);
  }, [onFileUpload, onBatchFileUpload, multiple]);

  // 拖入文件时预览
  const onDragEnter = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.items)
      .filter(item => item.kind === 'file')
      .map(item => item.getAsFile())
      .filter((file): file is File => file !== null);

    setDraggedFiles(files);
  }, []);

  const onDragLeave = useCallback(() => {
    setDraggedFiles([]);
  }, []);

  // 配置react-dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.svg'],
      'text/html': ['.html', '.htm'],
      'application/xml': ['.xml'],
      'text/xml': ['.xml'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.ms-excel.sheet.macroenabled.12': ['.xlsm'],
      'application/vnd.ms-excel.sheet.binary.macroenabled.12': ['.xlsb'],
      'application/vnd.oasis.opendocument.spreadsheet': ['.ods'],
      'text/csv': ['.csv'],
      'application/vnd.apple.numbers': ['.numbers']
    },
    disabled: isLoading || serviceAvailable === false,
    multiple: multiple
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${isDragActive
          ? 'border-blue-400 bg-blue-50'
          : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
          } ${isLoading || serviceAvailable === false ? 'opacity-50 cursor-not-allowed' : ''}`}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
      >
        <input {...getInputProps()} />

        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-500">文件转换中，请稍候...</p>
          </div>
        ) : serviceAvailable === false ? (
          <div className="flex flex-col items-center justify-center">
            <svg className="w-12 h-12 text-red-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <p className="text-gray-600 mb-2">服务当前不可用</p>
            <p className="text-sm text-gray-500">
              请稍后再试或检查您的网络连接
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              ></path>
            </svg>

            <p className="text-gray-600 mb-2">
              {isDragActive
                ? '放开以上传文件'
                : `拖放文件到此处或点击选择文件${multiple ? '（支持多选）' : ''}`}
            </p>
            <p className="text-sm text-gray-500">
              支持PDF、图像、HTML、XML、Excel等格式
            </p>

            {draggedFiles.length > 0 && (
              <div className="mt-3 text-left w-full">
                <p className="text-sm font-medium text-gray-700">准备上传的文件:</p>
                <ul className="mt-1 text-sm text-gray-500 max-h-24 overflow-y-auto">
                  {draggedFiles.map((file, index) => (
                    <li key={index} className="truncate">
                      {file.name} ({(file.size / 1024).toFixed(1)}KB)
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>

      {fileError && (
        <div className="mt-3 text-red-500 text-sm">{fileError}</div>
      )}

      <div className="mt-4">
        <h3 className="font-medium text-gray-700 mb-2">支持的文件格式：</h3>
        <ul className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm text-gray-600">
          <li>• PDF文档</li>
          <li>• 图像 (JPG, PNG, WEBP, SVG)</li>
          <li>• HTML文档</li>
          <li>• XML文档</li>
          <li>• Excel电子表格</li>
          <li>• CSV文件</li>
          <li>• OpenDocument电子表格</li>
          <li>• Apple Numbers文档</li>
        </ul>
        <p className="text-xs text-gray-500 mt-2">文件大小限制：5MB</p>
      </div>
    </div>
  );
}

export default FileUpload;