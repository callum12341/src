// src/components/common/Sidebar.js
import React from 'react';
import { 
  Settings, Users, CheckSquare, Mail, Send, Settings2, 
  Database, AlertCircle, Menu, Clock 
} from 'lucide-react';

const Sidebar = ({ 
  sidebarOpen, 
  setSidebarOpen, 
  activeModule, 
  setActiveModule, 
  setShowDatabaseManager,
  isDatabaseConnected,
  emailConfig,
  emails,
  emailQueue,
  processEmailQueue
}) => {
  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: <Settings size={20} /> },
    { id: 'customers', label: 'Customers', icon: <Users size={20} /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare size={20} /> },
    { id: 'emails', label: 'Emails', icon: <Mail size={20} /> },
    { id: 'compose', label: 'Compose', icon: <Send size={20} /> },
    { id: 'email-setup', label: 'Email Setup', icon: <Settings2 size={20} /> },
    { id: 'database', label: 'Database', icon: <Database size={20} /> },
    { id: 'imap-debug', label: 'IMAP Debug', icon: <AlertCircle size={20} /> }
  ];

  const handleItemClick = (item) => {
    if (item.id === 'database') {
      setShowDatabaseManager(true);
    } else {
      setActiveModule(item.id);
    }
  };

  const getUnreadEmailCount = () => {
    return emails.filter(e => !e.isRead).length;
  };

  const isEmailNotConfigured = () => {
    return !emailConfig.smtp?.configured && !emailConfig.sendgrid?.configured;
  };

  return (
    <div className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white shadow-lg transition-all duration-300 ease-in-out flex-shrink-0 relative`}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          {sidebarOpen && (
            <div>
              <h1 className="text-xl font-bold text-gray-800">CRM Pro</h1>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-gray-500">v4.0.0 - Database Ready</p>
                <div 
                  className={`w-2 h-2 rounded-full ${isDatabaseConnected ? 'bg-green-500' : 'bg-red-500'}`}
                  title={isDatabaseConnected ? 'Database Connected' : 'Database Disconnected'}
                />
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-1 rounded hover:bg-gray-100 transition-colors"
            aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="mt-4">
        {sidebarItems.map(item => {
          const unreadCount = item.id === 'emails' ? getUnreadEmailCount() : 0;
          const hasWarning = (
            (item.id === 'database' && !isDatabaseConnected) ||
            (item.id === 'email-setup' && isEmailNotConfigured())
          );

          return (
            <button
              key={item.id}
              onClick={() => handleItemClick(item)}
              className={`w-full flex items-center px-4 py-3 text-left hover:bg-gray-100 transition-colors ${
                activeModule === item.id 
                  ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' 
                  : 'text-gray-700'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className="mr-3">{item.icon}</span>
              {sidebarOpen && (
                <>
                  <span className="flex-1">{item.label}</span>
                  
                  {/* Badges */}
                  {hasWarning && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      !
                    </span>
                  )}
                  
                  {unreadCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                      {unreadCount}
                    </span>
                  )}
                  
                  {item.id === 'email-setup' && isEmailNotConfigured() && (
                    <span className="bg-yellow-500 text-white text-xs rounded-full px-2 py-1">
                      !
                    </span>
                  )}
                </>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Status Area */}
      {sidebarOpen && (
        <div className="absolute bottom-4 left-4 right-4 space-y-2">
          {/* Email Queue Status */}
          {emailQueue.length > 0 && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-yellow-800 font-medium">
                    📧 {emailQueue.length} Queued
                  </p>
                  <button
                    onClick={processEmailQueue}
                    className="text-xs text-yellow-600 hover:text-yellow-800 underline"
                  >
                    Send now
                  </button>
                </div>
                <Clock size={16} className="text-yellow-600" />
              </div>
            </div>
          )}
          
          {/* Database Status */}
          <div className={`rounded-lg p-3 ${isDatabaseConnected ? 'bg-green-50' : 'bg-yellow-50'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs font-medium ${isDatabaseConnected ? 'text-green-800' : 'text-yellow-800'}`}>
                  {isDatabaseConnected ? '🗄️ Database Online' : '⚠️ Database Offline'}
                </p>
                <button
                  onClick={() => setShowDatabaseManager(true)}
                  className={`text-xs underline hover:no-underline ${
                    isDatabaseConnected ? 'text-green-600' : 'text-yellow-600'
                  }`}
                >
                  Manage Database
                </button>
              </div>
              <Database 
                size={16} 
                className={isDatabaseConnected ? 'text-green-600' : 'text-yellow-600'} 
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;