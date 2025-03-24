import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import FileUpload from './components/FileUpload';
import MarkdownOutput from './components/MarkdownOutput';
import Notification from './components/Notification';
import { ConversionResult, Notification as NotificationType } from './types';
import { checkServiceStatus } from './api';
import LanguageSwitcher from './components/LanguageSwitcher';

function App() {
  const { t } = useTranslation();
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
        console.log('Service status:', status);
        setServiceAvailable(serviceAvailable);
      } catch (error) {
        console.error('Service unavailable:', error);
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
    addNotification('success', t('notifications.conversionSuccess', { count: newResults.length }));
  };

  // 处理转换错误
  const handleConversionError = (error: string) => {
    addNotification('error', error);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {t('common.convert')}
          </h1>
          <LanguageSwitcher />
        </div>
        
        <div className="space-y-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <FileUpload
              onStartLoading={() => setLoading(true)}
              onEndLoading={() => setLoading(loading)}
              onSuccess={handleConversionResults}
              onError={handleConversionError}
            />
          </div>
          
          {results.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <MarkdownOutput results={results} />
            </div>
          )}
        </div>
      </div>

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

      <footer className="max-w-3xl mx-auto mt-12 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>AnyToMarkdown - {t('footer.basedOn')}</p>
        <p className="mt-1">
          <a href="https://github.com/worryzyy/cf-anytomarkdown.git" className="text-indigo-600 dark:text-indigo-400 hover:underline">GitHub</a>
          {" | "}
          <a href="https://developers.cloudflare.com/workers-ai/markdown-conversion/" className="text-indigo-600 dark:text-indigo-400 hover:underline">{t('footer.learnMore')}</a>
        </p>
      </footer>
    </div>
  );
}

export default App; 