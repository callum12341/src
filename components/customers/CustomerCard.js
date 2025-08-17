// src/components/customers/CustomerCard.js
import React from 'react';
import { User, Mail, Phone, Building, Send, Edit2, Trash2 } from 'lucide-react';

const CustomerCard = ({ customer, onEdit, onDelete, onSendEmail }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'Lead':
        return 'bg-yellow-100 text-yellow-800';
      case 'Inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${customer.name}"?`)) {
      onDelete();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="text-blue-600" size={20} />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{customer.name}</h4>
            <p className="text-sm text-gray-500">{customer.company}</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(customer.status)}`}>
          {customer.status}
        </span>
      </div>

      {/* Contact Information */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="mr-2 flex-shrink-0" size={14} />
          <span className="truncate">{customer.email}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="mr-2 flex-shrink-0" size={14} />
          <span>{customer.phone || 'No phone'}</span>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Building className="mr-2 flex-shrink-0" size={14} />
          <span>{formatCurrency(customer.orderValue)}</span>
        </div>
      </div>

      {/* Tags */}
      {customer.tags && customer.tags.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {customer.tags.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
            {customer.tags.length > 3 && (
              <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                +{customer.tags.length - 3}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div className="text-xs text-gray-500">
          Created: {customer.created}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onSendEmail}
            className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
            title="Send Email"
          >
            <Send size={14} />
          </button>
          <button
            onClick={onEdit}
            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors"
            title="Edit Customer"
          >
            <Edit2 size={14} />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
            title="Delete Customer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerCard;