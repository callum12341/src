// src/components/customers/CustomerForm.js
import React, { useState } from 'react';
import { User, Mail, Phone, Building, MapPin, Tag } from 'lucide-react';

const CustomerForm = ({ customer = null, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    address: customer?.address || '',
    status: customer?.status || 'Lead',
    orderValue: customer?.orderValue || 0,
    tags: customer?.tags ? customer.tags.join(', ') : ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.orderValue < 0) {
      newErrors.orderValue = 'Order value cannot be negative';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions = [
    { value: 'Lead', label: 'Lead' },
    { value: 'Active', label: 'Active' },
    { value: 'Inactive', label: 'Inactive' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Name Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <User size={16} className="mr-2" />
          Full Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="Enter customer's full name"
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      {/* Email Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Mail size={16} className="mr-2" />
          Email Address *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          placeholder="customer@example.com"
        />
        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
      </div>

      {/* Phone Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Phone size={16} className="mr-2" />
          Phone Number
        </label>
        <input
          type="tel"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="+1-555-0123"
        />
      </div>

      {/* Company Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Building size={16} className="mr-2" />
          Company
        </label>
        <input
          type="text"
          name="company"
          value={formData.company}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Company name"
        />
      </div>

      {/* Address Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <MapPin size={16} className="mr-2" />
          Address
        </label>
        <textarea
          name="address"
          value={formData.address}
          onChange={handleChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Customer's address"
        />
      </div>

      {/* Status and Order Value Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Status Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Order Value Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Order Value ($)
          </label>
          <input
            type="number"
            name="orderValue"
            value={formData.orderValue}
            onChange={handleChange}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.orderValue ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="0.00"
          />
          {errors.orderValue && <p className="text-red-500 text-sm mt-1">{errors.orderValue}</p>}
        </div>
      </div>

      {/* Tags Field */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Tag size={16} className="mr-2" />
          Tags
        </label>
        <input
          type="text"
          name="tags"
          value={formData.tags}
          onChange={handleChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="VIP, Enterprise, Hot Lead (comma separated)"
        />
        <p className="text-sm text-gray-500 mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Saving...' : (customer ? 'Update Customer' : 'Add Customer')}
        </button>
      </div>
    </form>
  );
};

export default CustomerForm;