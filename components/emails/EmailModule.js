// src/components/emails/EmailModule.js
import React, { useState, useMemo } from 'react';
import { Mail, Plus, Search, Filter, Star, Archive, Trash2, Send } from 'lucide-react';
import EmailCard from './EmailCard';

const EmailModule = ({ 
  emails, 
  onCompose, 
  onReply, 
  onDelete, 
  onMarkAsRead, 
  onToggleStar,
  customers = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedEmails, setSelectedEmails] = useState([]);

  // Filter and search emails
  const filteredEmails = useMemo(() => {
    let filtered = emails;

    // Apply filter
    switch (selectedFilter) {
      case 'unread':
        filtered = filtered.filter(email => !email.isRead);
        break;
      case 'starred':
        filtered = filtered.filter(email => email.isStarred);
        break;
      case 'sent':
        filtered = filtered.filter(email => email.type === 'outgoing');
        break;
      case 'received':
        filtered = filtered.filter(email => email.type === 'incoming');
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(email =>
        email.subject.toLowerCase().includes(query) ||
        email.body.toLowerCase().includes(query) ||
        email.customerName.toLowerCase().includes(query) ||
        email.from.toLowerCase().includes(query) ||
        email.to.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  }, [emails, searchQuery, selectedFilter]);

  // Email statistics
  const emailStats = useMemo(() => {
    return {
      total: emails.length,
      unread: emails.filter(e => !e.isRead).length,
      starred: emails.filter(e => e.isStarred).length,
      sent: emails.filter(e => e.type === 'outgoing').length,
      received: emails.filter(e => e.type === 'incoming').length
    };
  }, [emails]);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All', count: emailStats.total },
    { value: 'unread', label: 'Unread', count: emailStats.unread },
    { value: 'starred', label: 'Starred', count: emailStats.starred },
    { value: 'sent', label: 'Sent', count: emailStats.sent },
    { value: 'received', label: 'Received', count: emailStats.received }
  ];

  // Handle email selection
  const handleEmailSelect = (emailId, isSelected) => {
    setSelectedEmails(prev => 
      isSelected 
        ? [...prev, emailId]
        : prev.filter(id => id !== emailId)
    );
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredEmails.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredEmails.map(email => email.id));
    }
  };

  // Bulk actions
  const handleBulkMarkAsRead = () => {
    selectedEmails.forEach(emailId => {
      onMarkAsRead(emailId, true);
    });
    setSelectedEmails([]);
  };

  const handleBulkDelete = () => {
    if (window.confirm(`Are you sure you want to delete ${selectedEmails.length} emails?`)) {
      selectedEmails.forEach(emailId => {
        onDelete(emailId);
      });
      setSelectedEmails([]);
    }
  };

  const handleBulkStar = () => {
    selectedEmails.forEach(emailId => {
      onToggleStar(emailId);
    });
    setSelectedEmails([]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Email Management</h3>
          <p className="text-gray-600">
            {filteredEmails.length} of {emails.length} emails
            {emailStats.unread > 0 && (
              <span className="ml-2 text-blue-600 font-medium">
                ({emailStats.unread} unread)
              </span>
            )}
          </p>
        </div>
        
        <button
          onClick={() => onCompose()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Compose Email
        </button>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2">
            {filterOptions.map(option => (
              <button
                key={option.value}
                onClick={() => setSelectedFilter(option.value)}
                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                  selectedFilter === option.value
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
                {option.count > 0 && (
                  <span className="ml-1 text-xs">({option.count})</span>
                )}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search emails..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedEmails.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-blue-800 font-medium">
                {selectedEmails.length} email{selectedEmails.length !== 1 ? 's' : ''} selected
              </span>
              <button
                onClick={() => setSelectedEmails([])}
                className="text-blue-600 hover:text-blue-800 text-sm underline"
              >
                Clear selection
              </button>
            </div>
            
            <div className="flex space-x-2">
              <button
                onClick={handleBulkMarkAsRead}
                className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
              >
                Mark as Read
              </button>
              <button
                onClick={handleBulkStar}
                className="bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700 transition-colors"
              >
                Toggle Star
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Select All */}
      {filteredEmails.length > 0 && (
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={selectedEmails.length === filteredEmails.length}
            onChange={handleSelectAll}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label className="text-sm text-gray-600">
            Select all {filteredEmails.length} emails
          </label>
        </div>
      )}

      {/* Email List */}
      <div className="space-y-3">
        {filteredEmails.map(email => (
          <EmailCard
            key={email.id}
            email={email}
            isSelected={selectedEmails.includes(email.id)}
            onSelect={(isSelected) => handleEmailSelect(email.id, isSelected)}
            onReply={() => onReply(email)}
            onDelete={() => onDelete(email.id)}
            onMarkAsRead={(isRead) => onMarkAsRead(email.id, isRead)}
            onToggleStar={() => onToggleStar(email.id)}
            customers={customers}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredEmails.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Mail className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedFilter !== 'all' ? 'No emails found' : 'No emails yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by composing your first email'
            }
          </p>
          {(!searchQuery && selectedFilter === 'all') && (
            <button
              onClick={() => onCompose()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Compose Your First Email
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default EmailModule;