import { useState, useEffect } from 'react'
import FileUpload from './components/FileUpload'
import MarkdownOutput from './components/MarkdownOutput'
import Notification from './components/Notification'
import HelpGuide from './components/HelpGuide'
import { convertFile, convertMultipleFiles, checkServiceStatus } from './services/api'

// 消息类型
type NotificationType = 'success' | 'error' | 'info' | 'warning' | null;

// 通知消息接口
interface NotificationMessage {
  type: NotificationType;
  message: string;
}

// 转换结果接口
interface ConversionResult {
  name: string;
  mimeType: string;
  format: string;
  tokens: number;
  data: string;
}

// 添加批量处理结果接口
interface BatchProcessingInfo {
  total: number;
  current: number;
  results: ConversionResult[];
}

function App() {
  // 状态管理
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [notification, setNotification] = useState<NotificationMessage | null>(null);
  const [markdownResult, setMarkdownResult] = useState<ConversionResult | null>(null);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [batchResults, setBatchResults] = useState<BatchProcessingInfo | null>(null);
  const [showBatchMode, setShowBatchMode] = useState<boolean>(false);
  const [serviceAvailable, setServiceAvailable] = useState<boolean | null>(null);

  // 检查服务状态
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const result = await checkServiceStatus();
        setServiceAvailable(result.success);

        if (!result.success) {
          setNotification({
            type: 'error',
            message: '服务当前不可用，请稍后再试。'
          });
        }
      } catch (error) {
        console.error('服务检查错误:', error);
        setServiceAvailable(false);
        setNotification({
          type: 'error',
          message: '无法连接到服务，请检查您的网络连接或稍后再试。'
        });
      }
    };

    checkStatus();
  }, []);

  // 处理单个文件上传
  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true);
      setBatchResults(null); // 清除批量处理结果
      setNotification({ type: 'info', message: `正在转换文件 ${file.name}...` });

      // 调用API进行转换
      const result = await convertFile(file);

      if (result.success && result.result) {
        setMarkdownResult(result.result);
        setNotification({ type: 'success', message: '文件转换成功！' });
      } else {
        throw new Error(result.error || '转换失败，请检查文件格式。');
      }
    } catch (error) {
      console.error('转换错误:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : '转换过程中发生未知错误。'
      });
      setMarkdownResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理批量文件上传
  const handleBatchFileUpload = async (files: File[]) => {
    try {
      setIsLoading(true);
      setMarkdownResult(null); // 清除单个文件结果
      setNotification({ type: 'info', message: `正在批量转换 ${files.length} 个文件...` });

      // 创建批量处理状态
      setBatchResults({
        total: files.length,
        current: 0,
        results: []
      });

      // 调用API进行批量转换
      const result = await convertMultipleFiles(files);

      if (result.success && result.results) {
        setBatchResults({
          total: files.length,
          current: files.length,
          results: result.results
        });
        setNotification({ type: 'success', message: `成功转换${result.results.length}个文件！` });
        setShowBatchMode(true);
      } else {
        throw new Error(result.error || '批量转换失败，请检查文件格式。');
      }
    } catch (error) {
      console.error('批量转换错误:', error);
      setNotification({
        type: 'error',
        message: error instanceof Error ? error.message : '批量转换过程中发生未知错误。'
      });
      setBatchResults(null);
    } finally {
      setIsLoading(false);
    }
  };

  // 切换批量/单文件模式
  const toggleBatchMode = () => {
    setShowBatchMode(!showBatchMode);
  };

  // 切换到某个批量结果
  const showBatchResult = (result: ConversionResult) => {
    setMarkdownResult(result);
    setShowBatchMode(false);
  };

  // 清除通知
  const clearNotification = () => {
    setNotification(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* 头部区域 */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">AnyToMarkdown</h1>
            <p className="mt-2 text-gray-600">
              将各种文档格式（PDF、图像、HTML等）转换为Markdown格式
            </p>
          </div>
          <div className="flex space-x-3">
            {serviceAvailable !== null && (
              <div className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${serviceAvailable
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
                }`}>
                <span className={`h-2 w-2 rounded-full mr-1.5 ${serviceAvailable ? 'bg-green-500' : 'bg-red-500'
                  }`}></span>
                {serviceAvailable ? '服务在线' : '服务离线'}
              </div>
            )}
            {batchResults && (
              <button
                onClick={toggleBatchMode}
                className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path>
                </svg>
                {showBatchMode ? "查看当前文件" : "查看批量结果"}
              </button>
            )}
            <button
              onClick={() => setShowHelp(true)}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors flex items-center"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              使用指南
            </button>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="container mx-auto px-4 py-8 flex-grow">
        {/* 通知区域 */}
        {notification && (
          <Notification
            type={notification.type}
            message={notification.message}
            onClose={clearNotification}
          />
        )}

        {/* 文件上传区域 */}
        <section className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">上传文件</h2>
            <FileUpload
              onFileUpload={handleFileUpload}
              onBatchFileUpload={handleBatchFileUpload}
              isLoading={isLoading}
              multiple={true}
              serviceAvailable={serviceAvailable}
            />
          </div>
        </section>

        {/* 批量结果区域 */}
        {showBatchMode && batchResults && (
          <section className="mb-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">批量转换结果</h2>
              <p className="mb-4 text-gray-600">
                共转换 {batchResults.results.length} 个文件，点击文件名查看内容
              </p>
              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {batchResults.results.map((result, index) => (
                  <div
                    key={index}
                    className="border p-4 rounded-lg hover:border-blue-400 cursor-pointer transition-colors"
                    onClick={() => showBatchResult(result)}
                  >
                    <h3 className="font-medium text-blue-600 truncate">{result.name}</h3>
                    <p className="text-sm text-gray-500">格式: {result.format}</p>
                    <p className="text-sm text-gray-500">大小: {result.data.length} 字符</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Markdown输出区域 */}
        {markdownResult && !showBatchMode && (
          <section>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">转换结果</h2>
              <MarkdownOutput
                result={markdownResult}
              />
            </div>
          </section>
        )}
      </main>

      {/* 底部区域 */}
      <footer className="bg-gray-800 text-white">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center">
            AnyToMarkdown - 基于Cloudflare Workers AI构建
          </p>
          <p className="text-center mt-2 text-gray-400">
            支持多种文档格式转换为高质量Markdown
          </p>
          <p className="text-center mt-2 text-yellow-400">
            注意：Cloudflare Workers AI的Markdown转换功能目前处于Beta阶段，转换效果可能不完美
          </p>
        </div>
      </footer>

      {/* 帮助指南弹窗 */}
      {showHelp && <HelpGuide onClose={() => setShowHelp(false)} />}
    </div>
  )
}

export default App