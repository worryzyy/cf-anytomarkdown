import { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import MarkdownOutput from './components/MarkdownOutput';
import Notification from './components/Notification';
import { ConversionResult, Notification as NotificationType } from './types';
import { checkServiceStatus } from './api';

function App() {
  // 转换结果状态
  const [results, setResults] = useState<ConversionResult[]>([]);
  // 加载状态
  const [loading, setLoading] = useState(false);
  // 通知状态
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  // 服务状态
  const [serviceAvailable, setServiceAvailable] = useState(true);



  // 检查服务是否可用
  useEffect(() => {
    const checkService = async () => {
      try {
        const status = await checkServiceStatus();
        console.log('服务状态:', status);
        setServiceAvailable(true);
      } catch (error) {
        console.error('服务不可用:', error);
        setServiceAvailable(false);
      }
    };

    checkService();
  }, []);

  // 显示通知
  const addNotification = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);

    // 3秒后自动移除通知
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  // 处理文件转换结果
  const handleConversionResults = (newResults: ConversionResult[]) => {
    setResults(newResults);
    addNotification('success', `成功转换 ${newResults.length} 个文件`);
  };

  // 处理转换错误
  const handleConversionError = (error: string) => {
    addNotification('error', error);
  };

 

  return (
    <div className="min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <header className="max-w-4xl mx-auto mb-8">
        <h1 className="text-3xl font-bold text-center">AnyToMarkdown</h1>
        <p className="text-center text-gray-600 dark:text-gray-300 mt-2">
          将各种文档格式转换为Markdown
        </p>
      </header>

      <main className="max-w-4xl mx-auto space-y-8">
        {/* 服务不可用提示 */}
        {!serviceAvailable && (
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-red-700 dark:text-red-300 text-center">
            服务当前不可用，请稍后再试。如果问题持续，请联系管理员。
          </div>
        )}

        {/* 文件上传区域 */}
        <section className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">上传文件转换</h2>
          <FileUpload
            onStartLoading={() => setLoading(true)}
            onEndLoading={() => setLoading(loading)}
            onSuccess={handleConversionResults}
            onError={handleConversionError}
          />
        </section>

        {/* 结果输出区域 */}
        {results.length > 0 && (
          <section className="bg-white dark:bg-gray-800 shadow sm:rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">转换结果</h2>
            <MarkdownOutput results={results} />
          </section>
        )}
      </main>

      {/* 通知区域 */}
      <div className="fixed bottom-4 right-4 space-y-2 z-50">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            type={notification.type}
            message={notification.message}
          />
        ))}
      </div>

      <footer className="max-w-4xl mx-auto mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>AnyToMarkdown - 基于 Cloudflare Workers AI</p>
        <p className="mt-1">
          <a href="https://github.com/worryzyy/cf-anytomarkdown.git" className="text-indigo-600 dark:text-indigo-400 hover:underline">GitHub</a>
          {" | "}
          <a href="https://developers.cloudflare.com/workers-ai/markdown-conversion/" className="text-indigo-600 dark:text-indigo-400 hover:underline">了解更多</a>
        </p>
      </footer>
    </div>
  );
}

export default App; 