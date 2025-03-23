import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { ConversionResult } from '../types';

interface MarkdownOutputProps {
  results: ConversionResult[];
}

// 定义正确的组件类型
interface CodeProps {
  node?: any;
  inline?: boolean;
  className?: string;
  children: React.ReactNode;
}

const MarkdownOutput = ({ results }: MarkdownOutputProps) => {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');

  // 选择活动标签
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // 复制Markdown内容
  const handleCopyClick = () => {
    if (results[activeTab]) {
      navigator.clipboard.writeText(results[activeTab].data)
        .then(() => {
          alert('已复制到剪贴板!');
        })
        .catch((err) => {
          console.error('复制失败:', err);
        });
    }
  };

  // 下载Markdown文件
  const handleDownloadClick = () => {
    if (results[activeTab]) {
      const blob = new Blob([results[activeTab].data], { type: 'text/markdown' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${results[activeTab].name}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* 标签栏 */}
      {results.length > 1 && (
        <div className="border-b border-gray-200 dark:border-gray-700">
          <div className="flex overflow-x-auto">
            {results.map((result, index) => (
              <button
                key={index}
                className={`
                  px-4 py-2 font-medium text-sm whitespace-nowrap
                  ${activeTab === index
                    ? 'border-b-2 border-indigo-500 text-indigo-600 dark:text-indigo-400'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}
                `}
                onClick={() => handleTabClick(index)}
              >
                {result.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 工具栏 */}
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <button
            className={`
              px-3 py-1 text-xs rounded-md 
              ${viewMode === 'preview'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
            `}
            onClick={() => setViewMode('preview')}
          >
            预览
          </button>
          <button
            className={`
              px-3 py-1 text-xs rounded-md
              ${viewMode === 'source'
                ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'}
            `}
            onClick={() => setViewMode('source')}
          >
            源代码
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleCopyClick}
          >
            复制
          </button>
          <button
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleDownloadClick}
          >
            下载
          </button>
        </div>
      </div>

      {/* Markdown 内容 */}
      <div className="markdown-output overflow-auto max-h-96">
        {viewMode === 'preview' ? (
          <div
            className="prose prose-indigo max-w-none dark:prose-invert p-4"
            style={{
              /* 使用CSS让段落内容保持换行 */
              whiteSpace: 'pre-wrap'
            }}
          >
            <ReactMarkdown>
              {results[activeTab]?.data || ''}
            </ReactMarkdown>
          </div>
        ) : (
          <pre className="whitespace-pre-wrap font-mono text-sm p-4 bg-gray-50 dark:bg-gray-900 rounded">
            {results[activeTab]?.data || ''}
          </pre>
        )}
      </div>
    </div>
  );
};

export default MarkdownOutput; 