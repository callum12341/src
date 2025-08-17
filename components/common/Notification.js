// src/components/common/Notification.js
import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const Notification = ({ notification, onClose, autoHide = true, duration = 5000 }) => {
  // Auto-hide notification
  useEffect(() => {
    if (notification && autoHide) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [notification, autoHide, duration, onClose]);

  if (!notification) return null;

  const getNotificationStyles = (type) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-500 text-white',
          icon: <CheckCircle size={20} />
        };
      case 'error':
        return {
          container: 'bg-red-500 text-white',
          icon: <AlertCircle size={20} />
        };
      case 'warning':
        return {
          container: 'bg-yellow-500 text-white',
          icon: <AlertTriangle size={20} />
        };
      case 'info':
      default:
        return {
          container: 'bg-blue-500 text-white',
          icon: <Info size={20} />
        };
    }
  };

  const { container, icon } = getNotificationStyles(notification.type);

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 ${container} min-w-[300px] max-w-[500px]`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 mt-0.5">
            {icon}
          </div>
          <div className="flex-1">
            {notification.title && (
              <div className="font-medium mb-1">{notification.title}</div>
            )}
            <div className={notification.title ? 'text-sm opacity-90' : ''}>
              {notification.message}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200 transition-colors p-1 rounded-full hover:bg-black hover:bg-opacity-10"
          aria-label="Close notification"
        >
          <X size={16} />
        </button>
      </div>
      
      {/* Progress bar for auto-hide */}
      {autoHide && (
        <div className="absolute bottom-0 left-0 h-1 bg-black bg-opacity-20 rounded-b-lg overflow-hidden">
          <div 
            className="h-full bg-white bg-opacity-30 rounded-b-lg transition-all ease-linear"
            style={{
              animation: `shrink ${duration}ms linear forwards`
            }}
          />
        </div>
      )}
      
      <style jsx>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

export default Notification;