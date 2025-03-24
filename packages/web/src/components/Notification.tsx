import { useEffect } from 'react';
import { Notification as NotificationType } from '../types';
import { useTranslation } from 'react-i18next';

interface NotificationProps {
  notification?: NotificationType;
  type?: 'success' | 'error' | 'info';
  message?: string;
  onDismiss?: (id: string) => void;
  autoHideDuration?: number;
}

const Notification = ({
  notification,
  type,
  message,
  onDismiss,
  autoHideDuration = 5000
}: NotificationProps) => {
  const { t } = useTranslation();
  
  // 兼容两种使用方式
  const notificationType = notification?.type || type || 'info';
  const notificationMessage = notification?.message || message || '';
  const notificationId = notification?.id || '';

  useEffect(() => {
    // 自动消失定时器 (只有当onDismiss存在时才设置定时器)
    if (onDismiss && notificationId) {
      const timer = setTimeout(() => {
        onDismiss(notificationId);
      }, autoHideDuration);

      return () => {
        clearTimeout(timer);
      };
    }
  }, [notificationId, onDismiss, autoHideDuration]);

  // 根据通知类型设置样式
  const typeStyles = {
    success: 'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200',
    error: 'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200',
    info: 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200'
  };
  
  const iconByType = {
    success: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
      </svg>
    ),
    error: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
      </svg>
    ),
    info: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    )
  };

  // 如果没有消息，则不渲染
  if (!notificationMessage) {
    return null;
  }

  return (
    <div className={`flex items-center p-4 rounded-lg shadow-md ${typeStyles[notificationType]}`}>
      <div className="flex-shrink-0">
        {iconByType[notificationType]}
      </div>
      <div className="ml-3">
        <p className="text-sm font-medium">{notificationMessage}</p>
      </div>
      {onDismiss && notificationId && (
        <button
          type="button"
          className={`ml-auto -mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 hover:bg-gray-200 dark:hover:bg-gray-700`}
          onClick={() => onDismiss(notificationId)}
          aria-label={t('close')}
        >
          <span className="sr-only">{t('close')}</span>
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

interface NotificationListProps {
  notifications?: NotificationType[];
  onDismiss: (id: string) => void;
}

const NotificationList = ({ notifications, onDismiss }: NotificationListProps) => {
  // 确保notifications始终是一个数组
  const notificationArray = Array.isArray(notifications) ? notifications : [];

  return (
    <div className="fixed top-4 right-4 z-50 space-y-4 w-80">
      {notificationArray.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
        />
      ))}
    </div>
  );
};

export { NotificationList, Notification };
export default Notification; 