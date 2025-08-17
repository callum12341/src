// src/components/emails/ComposeEmailModule.js
import React, { useState } from 'react';
import { Send, Save, X, Plus, User, Mail } from 'lucide-react';
import ComposeEmailForm from './ComposeEmailForm';

const ComposeEmailModule = ({ 
  customers = [], 
  emailTemplates = [],
  onSendEmail,
  onSaveDraft,
  onQueueEmail,
  initialData = null,
  onCancel
}) => {
  const [emailData, setEmailData] = useState({
    to: initialData?.to || '',
    cc: initialData?.cc || '',
    bcc: initialData?.bcc || '',
    subject: initialData?.subject || '',
    body: initialData?.body || '',
    customerId: initialData?.customerId || '',
    priority: initialData?.priority || 'normal',
    attachments: initialData?.attachments || []
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [showCustomerSelector, setShowCustomerSelector] = useState(false);

  // Handle form submission
  const handleSend = async () => {
    if (!emailData.to || !emailData.subject) {
      alert('Please fill in recipient and subject fields');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSendEmail(emailData);
    } catch (error) {
      console.error('Error sending email:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQueue = async () => {
    if (!emailData.to || !emailData.subject) {
      alert('Please fill in recipient and subject fields');
      return;
    }

    try {
      await onQueueEmail(emailData);
    } catch (error) {
      console.error('Error queueing email:', error);
    }
  };

  const handleSaveDraft = async () => {
    try {
      await onSaveDraft(emailData);
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Handle customer selection
  const handleCustomerSelect = (customer) => {
    setEmailData(prev => ({
      ...prev,
      to: customer.email,
      customerId: customer.id
    }));
    setShowCustomerSelector(false);
  };

  // Handle template selection
  const handleTemplateSelect = (template) => {
    const customer = customers.find(c => c.id === emailData.customerId);
    
    // Replace template variables
    let subject = template.subject;
    let body = template.body;

    if (customer) {
      subject = subject.replace(/\{\{customer_name\}\}/g, customer.name);
      subject = subject.replace(/\{\{company_name\}\}/g, customer.company || '');
      
      body = body.replace(/\{\{customer_name\}\}/g, customer.name);
      body = body.replace(/\{\{company_name\}\}/g, customer.company || '');
      body = body.replace(/\{\{sender_name\}\}/g, 'Your Name'); // TODO: Get from user settings
    }

    setEmailData(prev => ({
      ...prev,
      subject,
      body
    }));
    setShowTemplateSelector(false);
  };

  const canSend = emailData.to && emailData.subject;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            {initialData ? 'Reply to Email' : 'Compose New Email'}
          </h3>
          <div className="flex items-center space-x-2">
            {/* Quick Actions */}
            <button
              onClick={() => setShowCustomerSelector(true)}
              className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
              title="Select Customer"
            >
              <User size={16} />
            </button>
            
            <button
              onClick={() => setShowTemplateSelector(true)}
              className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
              title="Use Template"
            >
              <Mail size={16} />
            </button>

            {onCancel && (
              <button
                onClick={onCancel}
                className="text-gray-600 hover:text-gray-800 p-2 rounded-full hover:bg-gray-100 transition-colors"
                title="Cancel"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Customer Selector Modal */}
        {showCustomerSelector && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full m-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Select Customer</h4>
                <button
                  onClick={() => setShowCustomerSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-2">
                {customers.map(customer => (
                  <button
                    key={customer.id}
                    onClick={() => handleCustomerSelect(customer)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border transition-colors"
                  >
                    <div className="font-medium">{customer.name}</div>
                    <div className="text-sm text-gray-600">{customer.email}</div>
                    {customer.company && (
                      <div className="text-xs text-gray-500">{customer.company}</div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Template Selector Modal */}
        {showTemplateSelector && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-lg w-full m-4 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-lg font-semibold">Select Template</h4>
                <button
                  onClick={() => setShowTemplateSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-3">
                {emailTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left p-3 rounded-lg hover:bg-gray-50 border transition-colors"
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-sm text-gray-600 truncate">{template.subject}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <ComposeEmailForm
          emailData={emailData}
          setEmailData={setEmailData}
          customers={customers}
        />

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-4 border-t bg-gray-50">
          <div className="flex space-x-2">
            <button
              onClick={handleSaveDraft}
              className="text-gray-600 hover:text-gray-800 px-3 py-2 rounded-lg hover:bg-gray-100 flex items-center transition-colors text-sm"
            >
              <Save size={14} className="mr-1" />
              Save Draft
            </button>
            
            <button
              onClick={handleQueue}
              disabled={!canSend}
              className="text-yellow-600 hover:text-yellow-800 px-3 py-2 rounded-lg hover:bg-yellow-50 flex items-center transition-colors text-sm disabled:opacity-50"
            >
              <Plus size={14} className="mr-1" />
              Add to Queue
            </button>
          </div>

          <button
            onClick={handleSend}
            disabled={!canSend || isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
          >
            <Send size={16} className="mr-2" />
            {isSubmitting ? 'Sending...' : 'Send Email'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposeEmailModule;