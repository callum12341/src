// src/components/emails/EmailCard.js
import React, { useState } from 'react';
import { 
  Mail, MailOpen, Star, Reply, Trash2, User, 
  ChevronDown, ChevronUp, Paperclip, Send, Archive 
} from 'lucide-react';

const EmailCard = ({ 
  email, 
  isSelected, 
  onSelect, 
  onReply, 
  onDelete, 
  onMarkAsRead, 
  onToggleStar,
  customers = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Format timestamp
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  // Get email type styling
  const getTypeStyles = (type) => {
    return type === 'outgoing' 
      ? 'border-l-4 border-l-green-500 bg-green-50'
      : 'border-l-4 border-l-blue-500 bg-blue-50';
  };

  // Get status indicator
  const getStatusIndicator = (status) => {
    switch (status) {
      case 'sent':
        return <span className="text-green-600 text-xs">✓ Sent</span>;
      case 'delivered':
        return <span className="text-green-600 text-xs">✓✓ Delivered</span>;
      case 'failed':
        return <span className="text-red-600 text-xs">✗ Failed</span>;
      case 'pending':
        return <span className="text-yellow-600 text-xs">⏳ Pending</span>;
      default:
        return null;
    }
  };

  // Truncate text
  const truncateText = (text, maxLength = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Find customer info
  const customer = customers.find(c => c.id === email.customerId);

  const handleToggleRead = () => {
    onMarkAsRead(!email.isRead);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this email?')) {
      onDelete();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-md transition-all ${
      !email.isRead ? 'ring-2 ring-blue-100' : ''
    } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      {/* Header */}
      <div 
        className={`p-4 cursor-pointer ${getTypeStyles(email.type)}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {/* Checkbox */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => {
              e.stopPropagation();
              onSelect(e.target.checked);
            }}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />

          {/* Read/Unread indicator */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleRead();
            }}
            className="text-gray-500 hover:text-gray-700"
            title={email.isRead ? 'Mark as unread' : 'Mark as read'}
          >
            {email.isRead ? <MailOpen size={16} /> : <Mail size={16} />}
          </button>

          {/* Star */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleStar();
            }}
            className={`${email.isStarred ? 'text-yellow-500' : 'text-gray-300'} hover:text-yellow-500`}
            title={email.isStarred ? 'Remove star' : 'Add star'}
          >
            <Star size={16} fill={email.isStarred ? 'currentColor' : 'none'} />
          </button>

          {/* Customer Avatar */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
            <User size={14} className="text-gray-600" />
          </div>

          {/* Email Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span className={`font-medium truncate ${!email.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                  {email.customerName}
                </span>
                {customer && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {customer.company}
                  </span>
                )}
                <span className={`text-sm ${email.type === 'outgoing' ? 'text-green-600' : 'text-blue-600'}`}>
                  {email.type === 'outgoing' ? '→' : '←'}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                {email.attachments && email.attachments.length > 0 && (
                  <Paperclip size={14} className="text-gray-400" />
                )}
                <span className="text-sm text-gray-500">
                  {formatTimestamp(email.timestamp)}
                </span>
                {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>
            </div>

            <div className="mt-1">
              <p className={`text-sm truncate ${!email.isRead ? 'font-medium text-gray-900' : 'text-gray-700'}`}>
                {email.subject}
              </p>
              {!isExpanded && (
                <p className="text-xs text-gray-500 truncate mt-1">
                  {truncateText(email.body)}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t">
          {/* Email Headers */}
          <div className="p-4 bg-gray-50 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div>
                <span className="font-medium text-gray-700">From:</span>
                <span className="ml-2 text-gray-600">{email.from}</span>
              </div>
              <div>
                <span className="font-medium text-gray-700">To:</span>
                <span className="ml-2 text-gray-600">{email.to}</span>
              </div>
              {email.cc && (
                <div>
                  <span className="font-medium text-gray-700">CC:</span>
                  <span className="ml-2 text-gray-600">{email.cc}</span>
                </div>
              )}
              <div>
                <span className="font-medium text-gray-700">Date:</span>
                <span className="ml-2 text-gray-600">
                  {new Date(email.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            
            {/* Status */}
            <div className="mt-2 flex items-center justify-between">
              <div>
                {getStatusIndicator(email.status)}
              </div>
              {email.smtpMessageId && (
                <div className="text-xs text-gray-500">
                  ID: {email.smtpMessageId}
                </div>
              )}
            </div>
          </div>

          {/* Email Body */}
          <div className="p-4">
            <div className="prose prose-sm max-w-none">
              <div className="whitespace-pre-wrap text-gray-800">
                {email.body}
              </div>
            </div>

            {/* Attachments */}
            {email.attachments && email.attachments.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Attachments ({email.attachments.length})
                </h4>
                <div className="space-y-2">
                  {email.attachments.map((attachment, index) => (
                    <div key={index} className="flex items-center space-x-2 text-sm">
                      <Paperclip size={14} className="text-gray-400" />
                      <span className="text-blue-600 hover:text-blue-800 cursor-pointer">
                        {attachment.filename}
                      </span>
                      <span className="text-gray-500">
                        ({(attachment.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="px-4 pb-4 flex items-center justify-between">
            <div className="flex space-x-2">
              <button
                onClick={() => onReply()}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center transition-colors"
              >
                <Reply size={14} className="mr-1" />
                Reply
              </button>
              
              {email.type === 'incoming' && (
                <button className="bg-gray-600 text-white px-3 py-1 rounded text-sm hover:bg-gray-700 flex items-center transition-colors">
                  <Send size={14} className="mr-1" />
                  Forward
                </button>
              )}
            </div>

            <div className="flex space-x-2">
              <button className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-100 transition-colors">
                <Archive size={14} />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-100 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailCard;