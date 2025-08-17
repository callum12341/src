// src/components/tasks/TaskForm.js
import React, { useState } from 'react';
import { CheckSquare, Calendar, User, AlertTriangle, Tag } from 'lucide-react';

const TaskForm = ({ 
  task = null, 
  customers = [],
  staffMembers = [],
  onSubmit 
}) => {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    customerId: task?.customerId || '',
    assignedTo: task?.assignedTo || '',
    assignedToEmail: task?.assignedToEmail || '',
    priority: task?.priority || 'Medium',
    status: task?.status || 'Pending',
    dueDate: task?.dueDate || '',
    tags: task?.tags ? task.tags.join(', ') : ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Task title is required';
    }

    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    } else {
      const today = new Date();
      const dueDate = new Date(formData.dueDate);
      today.setHours(0, 0, 0, 0);
      dueDate.setHours(0, 0, 0, 0);
      
      if (dueDate < today && !task) {
        newErrors.dueDate = 'Due date cannot be in the past';
      }
    }

    if (!formData.assignedTo.trim()) {
      newErrors.assignedTo = 'Task must be assigned to someone';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle input changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-fill assignee email when staff member is selected
    if (field === 'assignedTo') {
      const staffMember = staffMembers.find(member => member.name === value);
      if (staffMember) {
        setFormData(prev => ({
          ...prev,
          assignedToEmail: staffMember.email
        }));
      }
    }
  };

  // Handle customer selection
  const handleCustomerChange = (customerId) => {
    setFormData(prev => ({
      ...prev,
      customerId: customerId
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Process tags
      const processedData = {
        ...formData,
        customerId: formData.customerId ? parseInt(formData.customerId) : null,
        customerName: formData.customerId ? 
          customers.find(c => c.id === parseInt(formData.customerId))?.name || '' : '',
        tags: formData.tags ? 
          formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      await onSubmit(processedData);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get minimum date (today)
  const getMinDate = () => {
    return new Date().toISOString().split('T')[0];
  };

  // Priority options
  const priorityOptions = [
    { value: 'Low', label: 'Low Priority', color: 'text-green-600' },
    { value: 'Medium', label: 'Medium Priority', color: 'text-yellow-600' },
    { value: 'High', label: 'High Priority', color: 'text-red-600' }
  ];

  // Status options
  const statusOptions = [
    { value: 'Pending', label: 'Pending' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }
  ];

  // Check if due date is in the past
  const isDueDateInPast = () => {
    if (!formData.dueDate) return false;
    const today = new Date();
    const dueDate = new Date(formData.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Task Title */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <CheckSquare size={16} className="mr-2" />
          Task Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          placeholder="Enter task title"
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            errors.title ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
      </div>

      {/* Task Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the task in detail..."
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
        />
      </div>

      {/* Customer Selection */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <User size={16} className="mr-2" />
          Related Customer (Optional)
        </label>
        <select
          value={formData.customerId}
          onChange={(e) => handleCustomerChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select a customer...</option>
          {customers.map(customer => (
            <option key={customer.id} value={customer.id}>
              {customer.name} - {customer.company}
            </option>
          ))}
        </select>
      </div>

      {/* Assignment and Due Date Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Assigned To */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <User size={16} className="mr-2" />
            Assign To *
          </label>
          <select
            value={formData.assignedTo}
            onChange={(e) => handleChange('assignedTo', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.assignedTo ? 'border-red-500' : 'border-gray-300'
            }`}
          >
            <option value="">Select assignee...</option>
            {staffMembers.map(member => (
              <option key={member.id} value={member.name}>
                {member.name} - {member.role}
              </option>
            ))}
          </select>
          {errors.assignedTo && <p className="text-red-500 text-sm mt-1">{errors.assignedTo}</p>}
        </div>

        {/* Due Date */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Calendar size={16} className="mr-2" />
            Due Date *
          </label>
          <input
            type="date"
            value={formData.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
            min={task ? undefined : getMinDate()}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.dueDate ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.dueDate && <p className="text-red-500 text-sm mt-1">{errors.dueDate}</p>}
          {isDueDateInPast() && task && (
            <div className="flex items-center mt-1 text-orange-600 text-sm">
              <AlertTriangle size={14} className="mr-1" />
              This task is overdue
            </div>
          )}
        </div>
      </div>

      {/* Priority and Status Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <AlertTriangle size={16} className="mr-2" />
            Priority
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {priorityOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status
          </label>
          <select
            value={formData.status}
            onChange={(e) => handleChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Tag size={16} className="mr-2" />
          Tags
        </label>
        <input
          type="text"
          value={formData.tags}
          onChange={(e) => handleChange('tags', e.target.value)}
          placeholder="Sales, Follow-up, Important (comma separated)"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <p className="text-sm text-gray-500 mt-1">
          Separate multiple tags with commas
        </p>
      </div>

      {/* Form Preview */}
      {formData.title && (
        <div className="bg-gray-50 border rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">Task Preview</h4>
          <div className="text-sm space-y-1">
            <div><span className="font-medium">Title:</span> {formData.title}</div>
            {formData.assignedTo && (
              <div><span className="font-medium">Assigned to:</span> {formData.assignedTo}</div>
            )}
            {formData.dueDate && (
              <div><span className="font-medium">Due:</span> {new Date(formData.dueDate).toLocaleDateString()}</div>
            )}
            <div className="flex items-center space-x-2">
              <span className="font-medium">Priority:</span>
              <span className={`px-2 py-1 rounded-full text-xs ${
                formData.priority === 'High' ? 'bg-red-100 text-red-800' :
                formData.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                'bg-green-100 text-green-800'
              }`}>
                {formData.priority}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Submit Button */}
      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          <CheckSquare size={16} className="mr-2" />
          {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
        </button>
      </div>
    </form>
  );
};

export default TaskForm;