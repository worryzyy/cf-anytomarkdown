import { useEffect, useState } from 'react';
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import 'highlight.js/styles/github.css';

// 定义结果接口
interface ResultProps {
  result: {
    name: string;
    mimeType: string;
    format: string;
    tokens: number;
    data: string;
  };
}

function MarkdownOutput({ result }: ResultProps) {
  const [renderedHtml, setRenderedHtml] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'preview' | 'source'>('preview');

  // 使用markdown-it渲染markdown
  useEffect(() => {
    if (result?.data) {
      const md = new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true,
        highlight: function (str, lang) {
          if (lang && hljs.getLanguage(lang)) {
            try {
              return hljs.highlight(str, { language: lang }).value;
            } catch (_) { }
          }
          return ''; // 使用默认的转义
        }
      });

      const html = md.render(result.data);
      setRenderedHtml(html);
    }
  }, [result]);

  // 处理Markdown下载
  const handleDownload = () => {
    const blob = new Blob([result.data], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');

    // 从原始文件名中提取基础名称，并添加.md扩展名
    const originalName = result.name;
    const baseName = originalName.includes('.')
      ? originalName.substring(0, originalName.lastIndexOf('.'))
      : originalName;

    a.href = url;
    a.download = `${baseName}.md`;
    document.body.appendChild(a);
    a.click();

    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  };

  return (
    <div className="markdown-output">
      {/* 标签切换 */}
      <div className="flex border-b mb-4">
        <button
          className={`px-4 py-2 ${activeTab === 'preview'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-500'
            }`}
          onClick={() => setActiveTab('preview')}
        >
          预览
        </button>
        <button
          className={`px-4 py-2 ${activeTab === 'source'
              ? 'border-b-2 border-blue-500 text-blue-600'
              : 'text-gray-600 hover:text-blue-500'
            }`}
          onClick={() => setActiveTab('source')}
        >
          源代码
        </button>

        <div className="ml-auto">
          <button
            className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            onClick={handleDownload}
          >
            下载 Markdown
          </button>
        </div>
      </div>

      {/* 文件信息 */}
      <div className="bg-gray-50 p-3 rounded-md mb-4 text-sm text-gray-600">
        <div><strong>文件名称:</strong> {result.name}</div>
        <div><strong>MIME类型:</strong> {result.mimeType}</div>
        <div><strong>输出格式:</strong> {result.format}</div>
        {result.tokens > 0 && <div><strong>Token数量:</strong> {result.tokens}</div>}
      </div>

      {/* 内容显示区域 */}
      <div className="border rounded-md overflow-hidden">
        {activeTab === 'preview' ? (
          <div
            className="markdown-body p-4 prose max-w-none"
            dangerouslySetInnerHTML={{ __html: renderedHtml }}
          />
        ) : (
          <pre className="bg-gray-50 p-4 overflow-auto whitespace-pre-wrap">
            <code>{result.data}</code>
          </pre>
        )}
      </div>
    </div>
  );
}

export default MarkdownOutput; 