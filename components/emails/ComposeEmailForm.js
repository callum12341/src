// src/components/emails/ComposeEmailForm.js
import React, { useState } from 'react';
import { Paperclip, X, User, AlertCircle } from 'lucide-react';

const ComposeEmailForm = ({ emailData, setEmailData, customers = [] }) => {
  const [showCcBcc, setShowCcBcc] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  // Handle input changes
  const handleChange = (field, value) => {
    setEmailData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle customer selection from dropdown
  const handleCustomerChange = (customerId) => {
    const customer = customers.find(c => c.id === parseInt(customerId));
    if (customer) {
      handleChange('customerId', customer.id);
      if (!emailData.to) {
        handleChange('to', customer.email);
      }
    } else {
      handleChange('customerId', '');
    }
  };

  // Handle file attachment
  const handleFileSelect = (files) => {
    const newAttachments = Array.from(files).map(file => ({
      file,
      filename: file.name,
      size: file.size,
      type: file.type,
      id: Math.random().toString(36).substr(2, 9)
    }));

    setEmailData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...newAttachments]
    }));
  };

  // Remove attachment
  const removeAttachment = (attachmentId) => {
    setEmailData(prev => ({
      ...prev,
      attachments: prev.attachments.filter(att => att.id !== attachmentId)
    }));
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files);
    }
  };

  // Validate email address
  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  // Split and validate multiple emails
  const validateEmailField = (emails) => {
    if (!emails.trim()) return { valid: true, emails: [] };
    
    const emailList = emails.split(',').map(email => email.trim()).filter(email => email);
    const invalid = emailList.filter(email => !isValidEmail(email));
    
    return {
      valid: invalid.length === 0,
      emails: emailList,
      invalid
    };
  };

  const toValidation = validateEmailField(emailData.to);
  const ccValidation = validateEmailField(emailData.cc);
  const bccValidation = validateEmailField(emailData.bcc);

  return (
    <div className="p-4 space-y-4">
      {/* Customer Selection */}
      {customers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer (Optional)
          </label>
          <select
            value={emailData.customerId}
            onChange={(e) => handleCustomerChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select a customer...</option>
            {customers.map(customer => (
              <option key={customer.id} value={customer.id}>
                {customer.name} ({customer.email})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* To Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          To *
        </label>
        <input
          type="text"
          value={emailData.to}
          onChange={(e) => handleChange('to', e.target.value)}
          placeholder="recipient@example.com, another@example.com"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            !toValidation.valid ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {!toValidation.valid && (
          <div className="flex items-center mt-1 text-red-600 text-sm">
            <AlertCircle size={14} className="mr-1" />
            Invalid email addresses: {toValidation.invalid.join(', ')}
          </div>
        )}
        <p className="text-xs text-gray-500 mt-1">
          Separate multiple emails with commas
        </p>
      </div>

      {/* CC/BCC Toggle */}
      {!showCcBcc && (
        <button
          onClick={() => setShowCcBcc(true)}
          className="text-blue-600 hover:text-blue-800 text-sm underline"
        >
          Add CC/BCC
        </button>
      )}

      {/* CC Field */}
      {showCcBcc && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            CC
          </label>
          <input
            type="text"
            value={emailData.cc}
            onChange={(e) => handleChange('cc', e.target.value)}
            placeholder="cc@example.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !ccValidation.valid ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {!ccValidation.valid && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle size={14} className="mr-1" />
              Invalid email addresses: {ccValidation.invalid.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* BCC Field */}
      {showCcBcc && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            BCC
          </label>
          <input
            type="text"
            value={emailData.bcc}
            onChange={(e) => handleChange('bcc', e.target.value)}
            placeholder="bcc@example.com"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              !bccValidation.valid ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {!bccValidation.valid && (
            <div className="flex items-center mt-1 text-red-600 text-sm">
              <AlertCircle size={14} className="mr-1" />
              Invalid email addresses: {bccValidation.invalid.join(', ')}
            </div>
          )}
        </div>
      )}

      {/* Subject Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Subject *
        </label>
        <input
          type="text"
          value={emailData.subject}
          onChange={(e) => handleChange('subject', e.target.value)}
          placeholder="Email subject"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Priority
        </label>
        <select
          value={emailData.priority}
          onChange={(e) => handleChange('priority', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="normal">Normal</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Body Field */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Message
        </label>
        <textarea
          value={emailData.body}
          onChange={(e) => handleChange('body', e.target.value)}
          placeholder="Type your message here..."
          rows={12}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Attachments */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Attachments
        </label>
        
        {/* File Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <Paperclip className="mx-auto h-8 w-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600 mb-2">
            Drag and drop files here, or{' '}
            <label className="text-blue-600 hover:text-blue-800 cursor-pointer underline">
              browse
              <input
                type="file"
                multiple
                onChange={(e) => handleFileSelect(e.target.files)}
                className="hidden"
              />
            </label>
          </p>
          <p className="text-xs text-gray-500">
            Maximum file size: 10MB per file
          </p>
        </div>

        {/* Attachment List */}
        {emailData.attachments.length > 0 && (
          <div className="mt-3 space-y-2">
            {emailData.attachments.map(attachment => (
              <div
                key={attachment.id}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <Paperclip size={14} className="text-gray-400" />
                  <span className="text-sm text-gray-700">{attachment.filename}</span>
                  <span className="text-xs text-gray-500">
                    ({(attachment.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
                <button
                  onClick={() => removeAttachment(attachment.id)}
                  className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ComposeEmailForm;