// src/components/emails/EmailSetupModule.js
import React, { useState, useEffect } from 'react';
import { 
  Settings, Mail, Send, CheckCircle, AlertCircle, 
  Eye, EyeOff, Save, TestTube, RefreshCw 
} from 'lucide-react';

const EmailSetupModule = ({ 
  emailConfig, 
  onUpdateConfig, 
  onTestConnection,
  showNotification 
}) => {
  const [activeTab, setActiveTab] = useState('smtp');
  const [configs, setConfigs] = useState({
    smtp: {
      host: '',
      port: 587,
      secure: false,
      username: '',
      password: '',
      from: '',
      configured: false
    },
    imap: {
      host: '',
      port: 993,
      secure: true,
      username: '',
      password: '',
      configured: false
    },
    sendgrid: {
      apiKey: '',
      from: '',
      configured: false
    }
  });

  const [showPasswords, setShowPasswords] = useState({
    smtp: false,
    imap: false
  });

  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState({});

  // Load existing config on mount
  useEffect(() => {
    if (emailConfig) {
      setConfigs(emailConfig);
    }
  }, [emailConfig]);

  // Handle config changes
  const handleConfigChange = (provider, field, value) => {
    setConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  // Save configuration
  const handleSaveConfig = async (provider) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/email/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider,
          config: configs[provider]
        })
      });

      const result = await response.json();

      if (result.success) {
        setConfigs(prev => ({
          ...prev,
          [provider]: {
            ...prev[provider],
            configured: true
          }
        }));

        onUpdateConfig({
          ...configs,
          [provider]: {
            ...configs[provider],
            configured: true
          }
        });

        showNotification(`${provider.toUpperCase()} configuration saved successfully!`, 'success');
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Config save error:', error);
      showNotification(`Failed to save ${provider.toUpperCase()} configuration: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Test connection
  const handleTestConnection = async (provider) => {
    setIsLoading(true);
    setTestResults(prev => ({
      ...prev,
      [provider]: { testing: true }
    }));

    try {
      const result = await onTestConnection(provider, configs[provider]);
      
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          testing: false,
          success: result.success,
          message: result.message
        }
      }));

      if (result.success) {
        showNotification(`${provider.toUpperCase()} connection test successful!`, 'success');
      } else {
        showNotification(`${provider.toUpperCase()} connection test failed: ${result.message}`, 'error');
      }
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: {
          testing: false,
          success: false,
          message: error.message
        }
      }));
      showNotification(`${provider.toUpperCase()} connection test failed: ${error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Common email providers with presets
  const emailProviders = {
    gmail: {
      smtp: { host: 'smtp.gmail.com', port: 587, secure: false },
      imap: { host: 'imap.gmail.com', port: 993, secure: true }
    },
    outlook: {
      smtp: { host: 'smtp-mail.outlook.com', port: 587, secure: false },
      imap: { host: 'outlook.office365.com', port: 993, secure: true }
    },
    yahoo: {
      smtp: { host: 'smtp.mail.yahoo.com', port: 587, secure: false },
      imap: { host: 'imap.mail.yahoo.com', port: 993, secure: true }
    }
  };

  const handleProviderPreset = (provider, service) => {
    const preset = emailProviders[provider][service];
    setConfigs(prev => ({
      ...prev,
      [service]: {
        ...prev[service],
        ...preset
      }
    }));
  };

  const tabs = [
    { id: 'smtp', label: 'SMTP (Sending)', icon: <Send size={16} /> },
    { id: 'imap', label: 'IMAP (Receiving)', icon: <Mail size={16} /> },
    { id: 'sendgrid', label: 'SendGrid', icon: <Settings size={16} /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-lg font-semibold mb-2">Email Configuration</h3>
        <p className="text-gray-600">
          Configure your email settings to send and receive emails through the CRM.
        </p>
      </div>

      {/* Status Overview */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-medium mb-3">Configuration Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tabs.map(tab => {
            const isConfigured = configs[tab.id]?.configured;
            return (
              <div key={tab.id} className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${isConfigured ? 'bg-green-500' : 'bg-red-500'}`} />
                <span className="text-sm">
                  {tab.label}: {isConfigured ? 'Configured' : 'Not Configured'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b">
        <nav className="flex space-x-8">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {configs[tab.id]?.configured && (
                <CheckCircle size={14} className="text-green-500" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* SMTP Configuration */}
      {activeTab === 'smtp' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium">SMTP Configuration (Outgoing Mail)</h4>
            {testResults.smtp && (
              <div className={`flex items-center space-x-2 ${testResults.smtp.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.smtp.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="text-sm">{testResults.smtp.message}</span>
              </div>
            )}
          </div>

          {/* Provider Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Setup (Optional)
            </label>
            <div className="flex space-x-2">
              {Object.keys(emailProviders).map(provider => (
                <button
                  key={provider}
                  onClick={() => handleProviderPreset(provider, 'smtp')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors capitalize"
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Host *
              </label>
              <input
                type="text"
                value={configs.smtp.host}
                onChange={(e) => handleConfigChange('smtp', 'host', e.target.value)}
                placeholder="smtp.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port *
              </label>
              <input
                type="number"
                value={configs.smtp.port}
                onChange={(e) => handleConfigChange('smtp', 'port', parseInt(e.target.value))}
                placeholder="587"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={configs.smtp.username}
                onChange={(e) => handleConfigChange('smtp', 'username', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.smtp ? 'text' : 'password'}
                  value={configs.smtp.password}
                  onChange={(e) => handleConfigChange('smtp', 'password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, smtp: !prev.smtp }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.smtp ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email *
              </label>
              <input
                type="email"
                value={configs.smtp.from}
                onChange={(e) => handleConfigChange('smtp', 'from', e.target.value)}
                placeholder="noreply@yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configs.smtp.secure}
                  onChange={(e) => handleConfigChange('smtp', 'secure', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Use SSL/TLS (recommended for port 465)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleTestConnection('smtp')}
              disabled={isLoading || testResults.smtp?.testing}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center transition-colors"
            >
              {testResults.smtp?.testing ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <TestTube size={16} className="mr-2" />
              )}
              Test Connection
            </button>

            <button
              onClick={() => handleSaveConfig('smtp')}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
            >
              <Save size={16} className="mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* IMAP Configuration */}
      {activeTab === 'imap' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium">IMAP Configuration (Incoming Mail)</h4>
            {testResults.imap && (
              <div className={`flex items-center space-x-2 ${testResults.imap.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.imap.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="text-sm">{testResults.imap.message}</span>
              </div>
            )}
          </div>

          {/* Provider Presets */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Quick Setup (Optional)
            </label>
            <div className="flex space-x-2">
              {Object.keys(emailProviders).map(provider => (
                <button
                  key={provider}
                  onClick={() => handleProviderPreset(provider, 'imap')}
                  className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors capitalize"
                >
                  {provider}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                IMAP Host *
              </label>
              <input
                type="text"
                value={configs.imap.host}
                onChange={(e) => handleConfigChange('imap', 'host', e.target.value)}
                placeholder="imap.gmail.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port *
              </label>
              <input
                type="number"
                value={configs.imap.port}
                onChange={(e) => handleConfigChange('imap', 'port', parseInt(e.target.value))}
                placeholder="993"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username *
              </label>
              <input
                type="text"
                value={configs.imap.username}
                onChange={(e) => handleConfigChange('imap', 'username', e.target.value)}
                placeholder="your@email.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <input
                  type={showPasswords.imap ? 'text' : 'password'}
                  value={configs.imap.password}
                  onChange={(e) => handleConfigChange('imap', 'password', e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, imap: !prev.imap }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.imap ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={configs.imap.secure}
                  onChange={(e) => handleConfigChange('imap', 'secure', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Use SSL/TLS (recommended)</span>
              </label>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleTestConnection('imap')}
              disabled={isLoading || testResults.imap?.testing}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center transition-colors"
            >
              {testResults.imap?.testing ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <TestTube size={16} className="mr-2" />
              )}
              Test Connection
            </button>

            <button
              onClick={() => handleSaveConfig('imap')}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
            >
              <Save size={16} className="mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* SendGrid Configuration */}
      {activeTab === 'sendgrid' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-medium">SendGrid Configuration</h4>
            {testResults.sendgrid && (
              <div className={`flex items-center space-x-2 ${testResults.sendgrid.success ? 'text-green-600' : 'text-red-600'}`}>
                {testResults.sendgrid.success ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
                <span className="text-sm">{testResults.sendgrid.message}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SendGrid API Key *
              </label>
              <input
                type="password"
                value={configs.sendgrid.apiKey}
                onChange={(e) => handleConfigChange('sendgrid', 'apiKey', e.target.value)}
                placeholder="SG.xxxxxxxxxxxxxxxx"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from the SendGrid dashboard
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Email *
              </label>
              <input
                type="email"
                value={configs.sendgrid.from}
                onChange={(e) => handleConfigChange('sendgrid', 'from', e.target.value)}
                placeholder="noreply@yourcompany.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This email must be verified in your SendGrid account
              </p>
            </div>
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={() => handleTestConnection('sendgrid')}
              disabled={isLoading || testResults.sendgrid?.testing}
              className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 disabled:opacity-50 flex items-center transition-colors"
            >
              {testResults.sendgrid?.testing ? (
                <RefreshCw size={16} className="mr-2 animate-spin" />
              ) : (
                <TestTube size={16} className="mr-2" />
              )}
              Test API Key
            </button>

            <button
              onClick={() => handleSaveConfig('sendgrid')}
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center transition-colors"
            >
              <Save size={16} className="mr-2" />
              Save Configuration
            </button>
          </div>
        </div>
      )}

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-800 mb-2">Setup Help</h4>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• For Gmail: Enable 2-factor authentication and use an App Password</p>
          <p>• For Outlook: Use your Microsoft account credentials</p>
          <p>• For SendGrid: Create an API key with "Mail Send" permissions</p>
          <p>• Test connections before saving to ensure everything works correctly</p>
        </div>
      </div>
    </div>
  );
};

export default EmailSetupModule;