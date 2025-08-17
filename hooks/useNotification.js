// src/hooks/useNotification.js
import { useState, useCallback } from 'react';

export const useNotification = () => {
  const [notification, setNotification] = useState(null);

  const showNotification = useCallback((message, type = 'success', options = {}) => {
    const {
      title = null,
      duration = 5000,
      autoHide = true
    } = options;

    setNotification({
      message,
      type,
      title,
      duration,
      autoHide,
      id: Date.now() // Unique ID for each notification
    });
  }, []);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  // Convenience methods for different notification types
  const showSuccess = useCallback((message, options = {}) => {
    showNotification(message, 'success', options);
  }, [showNotification]);

  const showError = useCallback((message, options = {}) => {
    showNotification(message, 'error', options);
  }, [showNotification]);

  const showWarning = useCallback((message, options = {}) => {
    showNotification(message, 'warning', options);
  }, [showNotification]);

  const showInfo = useCallback((message, options = {}) => {
    showNotification(message, 'info', options);
  }, [showNotification]);

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo
  };
};