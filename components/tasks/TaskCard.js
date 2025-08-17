// src/components/tasks/TaskCard.js
import React, { useState } from 'react';
import { 
  Calendar, User, AlertCircle, CheckCircle, Clock, 
  Edit2, Trash2, MessageSquare, Mail, ChevronDown, ChevronUp
} from 'lucide-react';

const TaskCard = ({ 
  task, 
  customers = [],
  onEdit, 
  onDelete, 
  onUpdateStatus, 
  onAssign,
  staffMembers = []
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);

  // Get task urgency and styling
  const getTaskUrgency = () => {
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const diffTime = dueDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (task.status === 'Completed') {
      return { 
        type: 'completed', 
        label: 'Completed', 
        color: 'text-green-600 bg-green-50 border-green-200',
        urgency: 'low'
      };
    } else if (diffDays < 0) {
      return { 
        type: 'overdue', 
        label: `${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''} overdue`, 
        color: 'text-red-600 bg-red-50 border-red-200',
        urgency: 'critical'
      };
    } else if (diffDays === 0) {
      return { 
        type: 'due-today', 
        label: 'Due today', 
        color: 'text-orange-600 bg-orange-50 border-orange-200',
        urgency: 'high'
      };
    } else if (diffDays === 1) {
      return { 
        type: 'due-tomorrow', 
        label: 'Due tomorrow', 
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        urgency: 'medium'
      };
    } else if (diffDays <= 3) {
      return { 
        type: 'due-soon', 
        label: `Due in ${diffDays} days`, 
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        urgency: 'medium'
      };
    } else {
      return { 
        type: 'normal', 
        label: `Due in ${diffDays} days`, 
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        urgency: 'low'
      };
    }
  };

  // Get priority styling
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Get status styling
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800';
      case 'Pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString([], { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
  };

  // Find customer
  const customer = customers.find(c => c.id === task.customerId);

  // Find assignee details
  const assignee = staffMembers.find(m => m.name === task.assignedTo);

  const urgency = getTaskUrgency();

  const statusOptions = ['Pending', 'In Progress', 'Completed'];

  const handleStatusChange = (newStatus) => {
    onUpdateStatus(newStatus);
    setShowStatusDropdown(false);
  };

  const handleAssigneeChange = (newAssignee) => {
    onAssign(newAssignee);
    setShowAssigneeDropdown(false);
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the task "${task.title}"?`)) {
      onDelete();
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow hover:shadow-lg transition-all border-l-4 ${
      urgency.type === 'overdue' ? 'border-l-red-500' :
      urgency.type === 'due-today' ? 'border-l-orange-500' :
      urgency.type === 'due-tomorrow' ? 'border-l-yellow-500' :
      urgency.type === 'completed' ? 'border-l-green-500' :
      'border-l-blue-500'
    }`}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Title and Customer */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h4 className={`font-medium text-gray-900 ${task.status === 'Completed' ? 'line-through' : ''}`}>
                  {task.title}
                </h4>
                {customer && (
                  <div className="flex items-center text-sm text-gray-600 mt-1">
                    <User size={14} className="mr-1" />
                    <span>{customer.name}</span>
                    {customer.company && (
                      <span className="text-gray-400 ml-1">• {customer.company}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded transition-colors"
                  title={isExpanded ? 'Collapse' : 'Expand'}
                >
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                <button
                  onClick={onEdit}
                  className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50 transition-colors"
                  title="Edit Task"
                >
                  <Edit2 size={14} />
                </button>
                <button
                  onClick={handleDelete}
                  className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50 transition-colors"
                  title="Delete Task"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* Status, Priority, and Due Date Row */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Status Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                  className={`px-2 py-1 rounded-full text-xs font-medium border transition-colors hover:shadow-sm ${getStatusColor(task.status)}`}
                >
                  {task.status}
                </button>
                
                {showStatusDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[120px]">
                    {statusOptions.map(status => (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          task.status === status ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Priority */}
              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                {task.priority}
              </span>

              {/* Due Date with Urgency */}
              <div className={`flex items-center px-2 py-1 rounded-full text-xs border ${urgency.color}`}>
                <Calendar size={12} className="mr-1" />
                <span>{formatDate(task.dueDate)}</span>
                {urgency.type !== 'normal' && (
                  <span className="ml-1">• {urgency.label}</span>
                )}
              </div>
            </div>

            {/* Assignee */}
            <div className="flex items-center justify-between">
              <div className="relative">
                <button
                  onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                  className="flex items-center text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-50 px-2 py-1 rounded transition-colors"
                >
                  <User size={14} className="mr-1" />
                  <span>{task.assignedTo}</span>
                  {assignee?.email && (
                    <span className="text-gray-400 ml-1">• {assignee.role}</span>
                  )}
                </button>

                {showAssigneeDropdown && (
                  <div className="absolute top-full left-0 mt-1 bg-white border rounded-lg shadow-lg z-10 min-w-[200px]">
                    {staffMembers.map(member => (
                      <button
                        key={member.id}
                        onClick={() => handleAssigneeChange(member.name)}
                        className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                          task.assignedTo === member.name ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      >
                        <div>{member.name}</div>
                        <div className="text-xs text-gray-500">{member.role}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {task.tags.slice(0, 2).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                  {task.tags.length > 2 && (
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">
                      +{task.tags.length - 2}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description Preview */}
        {!isExpanded && task.description && (
          <p className="text-sm text-gray-600 mt-2 line-clamp-2">
            {task.description}
          </p>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t bg-gray-50 p-4">
          {/* Full Description */}
          {task.description && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Description</h5>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Task Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <h5 className="font-medium text-gray-900 mb-2">Task Details</h5>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Created:</span>
                  <span className="text-gray-700">{formatDate(task.created)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Due Date:</span>
                  <span className="text-gray-700">{formatDate(task.dueDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Priority:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h5 className="font-medium text-gray-900 mb-2">Assignment</h5>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-gray-500">Assigned to:</span>
                  <div className="mt-1">
                    <span className="text-gray-700 font-medium">{task.assignedTo}</span>
                    {assignee && (
                      <div className="text-gray-500 text-xs">
                        {assignee.email} • {assignee.role}
                      </div>
                    )}
                  </div>
                </div>
                {customer && (
                  <div>
                    <span className="text-gray-500">Customer:</span>
                    <div className="mt-1">
                      <span className="text-gray-700 font-medium">{customer.name}</span>
                      <div className="text-gray-500 text-xs">
                        {customer.email} • {customer.company}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* All Tags */}
          {task.tags && task.tags.length > 0 && (
            <div className="mb-4">
              <h5 className="font-medium text-gray-900 mb-2">Tags</h5>
              <div className="flex flex-wrap gap-2">
                {task.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex space-x-2">
              {customer && (
                <>
                  <button className="text-blue-600 hover:text-blue-800 px-3 py-1 rounded text-sm hover:bg-blue-50 flex items-center transition-colors">
                    <Mail size={14} className="mr-1" />
                    Email Customer
                  </button>
                  <button className="text-green-600 hover:text-green-800 px-3 py-1 rounded text-sm hover:bg-green-50 flex items-center transition-colors">
                    <MessageSquare size={14} className="mr-1" />
                    Add Note
                  </button>
                </>
              )}
            </div>

            <div className="text-xs text-gray-500">
              Task ID: #{task.id}
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(showStatusDropdown || showAssigneeDropdown) && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => {
            setShowStatusDropdown(false);
            setShowAssigneeDropdown(false);
          }}
        />
      )}
    </div>
  );
};

export default TaskCard;