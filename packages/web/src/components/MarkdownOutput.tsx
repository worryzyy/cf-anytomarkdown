import { useState, useEffect, useRef } from 'react';
import MarkdownIt from 'markdown-it';
import highlightjs from 'markdown-it-highlightjs';
import 'highlight.js/styles/github.css';
import hljs from 'highlight.js';
import { ConversionResult } from '../types';
import { useTranslation } from 'react-i18next';

interface MarkdownOutputProps {
  results: ConversionResult[];
}

// 预处理 Markdown 文本，修复标题和换行符问题
const preprocessMarkdown = (markdown: string): string => {
  if (!markdown) return '';
  
  // 修复标题格式 - 确保#号后有空格
  let processed = markdown
    .replace(/^(#{1,6})([^#\s])/gm, '$1 $2')
    
  // 修复换行符 - 确保单行换行被正确转换
  // 添加两个空格加换行符来确保换行
  processed = processed
    .replace(/([^\n])\n([^\n])/g, '$1  \n$2')
    
  return processed;
};

const MarkdownOutput = ({ results }: MarkdownOutputProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<'preview' | 'source'>('preview');
  const markdownRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  
  // 创建并配置 markdown-it 实例
  const md = new MarkdownIt({
    html: true,             // 启用 HTML 标签
    linkify: true,          // 自动将 URL 转换为链接
    typographer: true,      // 启用一些语言中立的替换和引号美化
    breaks: true,           // 启用换行符转换为 <br>
    highlight: function(str, lang) {
      // 默认的代码高亮处理
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) {}
      }
      return ''; // 使用外部默认转义
    }
  }).use(highlightjs); // 使用 highlight.js 插件

  // 增强表格渲染，添加样式
  md.renderer.rules.table_open = () => {
    return '<table class="min-w-full divide-y divide-gray-300 dark:divide-gray-700 border border-gray-300 dark:border-gray-700">\n';
  };

  md.renderer.rules.thead_open = () => {
    return '<thead class="bg-gray-50 dark:bg-gray-800">\n';
  };

  md.renderer.rules.tbody_open = () => {
    return '<tbody class="divide-y divide-gray-200 dark:divide-gray-700">\n';
  };

  md.renderer.rules.tr_open = () => {
    return '<tr class="hover:bg-gray-50 dark:hover:bg-gray-700">\n';
  };

  md.renderer.rules.th_open = () => {
    return '<th class="px-3 py-2 text-left text-xs font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wider">';
  };

  md.renderer.rules.td_open = () => {
    return '<td class="px-3 py-2 text-sm text-gray-900 dark:text-gray-100">';
  };

  // 渲染 Markdown 内容
  useEffect(() => {
    if (viewMode === 'preview' && markdownRef.current && results[activeTab]?.data) {
      try {
        // 预处理 Markdown 内容，修复格式问题
        const processedMarkdown = preprocessMarkdown(results[activeTab].data);
        
        // 渲染 Markdown 为 HTML
        const renderedHTML = md.render(processedMarkdown);
        
        // 更新 DOM
        markdownRef.current.innerHTML = renderedHTML;
        
        // 处理所有链接，使其在新标签页中打开
        const links = markdownRef.current.querySelectorAll('a');
        links.forEach(link => {
          link.setAttribute('target', '_blank');
          link.setAttribute('rel', 'noopener noreferrer');
        });
      } catch (error) {
        console.error('Markdown rendering error:', error);
        markdownRef.current.innerHTML = `<div class="text-red-500">${t('errors.renderingFailed')}</div>`;
      }
    }
  }, [activeTab, viewMode, results, md, t]);

  // 选择活动标签
  const handleTabClick = (index: number) => {
    setActiveTab(index);
  };

  // 复制 Markdown 内容
  const handleCopyClick = async () => {
    if (results[activeTab]) {
      await copyToClipboard(results[activeTab].data);
    }
  };

  // 下载 Markdown 文件
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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (results.length === 0) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        {t('output.noFilesConverted')}
      </div>
    );
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
            {t('common.preview')}
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
            {t('common.source')}
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleCopyClick}
          >
            {copied ? t('output.copied') : t('output.copy')}
          </button>
          <button
            className="px-3 py-1 text-xs bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={handleDownloadClick}
          >
            {t('output.download')}
          </button>
        </div>
      </div>

      {/* Markdown 内容 */}
      <div className="markdown-output overflow-auto max-h-[50vh]">
        {viewMode === 'preview' ? (
          <div
            ref={markdownRef}
            className="prose prose-indigo max-w-none dark:prose-invert p-4"
            style={{
              /* 使用CSS让段落内容保持换行 */
              whiteSpace: 'pre-wrap'
            }}
          ></div>
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