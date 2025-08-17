import { useState } from 'react';

export const useEmails = (initialEmails = []) => {
  const [emails, setEmails] = useState(initialEmails);
  const [emailQueue, setEmailQueue] = useState([]);

  const addEmail = (email) => {
    setEmails(prev => [email, ...prev]);
  };

  const updateEmail = (emailId, updates) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, ...updates } : email
    ));
  };

  const deleteEmail = (emailId) => {
    setEmails(prev => prev.filter(e => e.id !== emailId));
  };

  const markEmailAsRead = (emailId, isRead = true) => {
    updateEmail(emailId, { isRead });
  };

  const toggleEmailStar = (emailId) => {
    setEmails(prev => prev.map(email => 
      email.id === emailId ? { ...email, isStarred: !email.isStarred } : email
    ));
  };

  const queueEmail = (emailData) => {
    const queuedEmail = {
      ...emailData,
      id: Math.max(...emailQueue.map(e => e.id || 0), 0) + 1,
      queuedAt: new Date().toISOString()
    };
    setEmailQueue(prev => [...prev, queuedEmail]);
  };

  const clearQueue = () => {
    setEmailQueue([]);
  };

  return {
    emails,
    setEmails,
    emailQueue,
    setEmailQueue,
    addEmail,
    updateEmail,
    deleteEmail,
    markEmailAsRead,
    toggleEmailStar,
    queueEmail,
    clearQueue
  };
};