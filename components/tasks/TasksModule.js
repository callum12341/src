// src/components/tasks/TasksModule.js
import React, { useState, useMemo } from 'react';
import { CheckSquare, Plus, Search, Filter, Calendar, User, AlertCircle } from 'lucide-react';
import TaskCard from './TaskCard';

const TasksModule = ({ 
  tasks, 
  customers = [],
  onAdd, 
  onEdit, 
  onDelete, 
  onUpdateStatus,
  onAssignTask,
  staffMembers = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAssignee, setSelectedAssignee] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' or 'list'

  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    let filtered = tasks;

    // Apply status filter
    switch (selectedFilter) {
      case 'pending':
        filtered = filtered.filter(task => task.status === 'Pending');
        break;
      case 'in-progress':
        filtered = filtered.filter(task => task.status === 'In Progress');
        break;
      case 'completed':
        filtered = filtered.filter(task => task.status === 'Completed');
        break;
      case 'overdue':
        const today = new Date();
        filtered = filtered.filter(task => {
          const dueDate = new Date(task.dueDate);
          return dueDate < today && task.status !== 'Completed';
        });
        break;
      case 'due-today':
        const todayStr = new Date().toISOString().split('T')[0];
        filtered = filtered.filter(task => task.dueDate === todayStr);
        break;
      default:
        // 'all' - no additional filtering
        break;
    }

    // Apply priority filter
    if (selectedPriority !== 'all') {
      filtered = filtered.filter(task => task.priority === selectedPriority);
    }

    // Apply assignee filter
    if (selectedAssignee !== 'all') {
      filtered = filtered.filter(task => task.assignedTo === selectedAssignee);
    }

    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(query) ||
        task.description.toLowerCase().includes(query) ||
        task.customerName.toLowerCase().includes(query) ||
        task.assignedTo.toLowerCase().includes(query) ||
        task.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Sort by due date and priority
    return filtered.sort((a, b) => {
      // First sort by overdue status
      const aOverdue = new Date(a.dueDate) < new Date() && a.status !== 'Completed';
      const bOverdue = new Date(b.dueDate) < new Date() && b.status !== 'Completed';
      
      if (aOverdue && !bOverdue) return -1;
      if (!aOverdue && bOverdue) return 1;
      
      // Then by priority
      const priorityOrder = { 'High': 3, 'Medium': 2, 'Low': 1 };
      const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
      if (priorityDiff !== 0) return priorityDiff;
      
      // Finally by due date
      return new Date(a.dueDate) - new Date(b.dueDate);
    });
  }, [tasks, searchQuery, selectedFilter, selectedPriority, selectedAssignee]);

  // Task statistics
  const taskStats = useMemo(() => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => new Date(t.dueDate) < today && t.status !== 'Completed').length,
      dueToday: tasks.filter(t => t.dueDate === todayStr).length,
      high: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length
    };
  }, [tasks]);

  // Filter options
  const filterOptions = [
    { value: 'all', label: 'All Tasks', count: taskStats.total },
    { value: 'pending', label: 'Pending', count: taskStats.pending },
    { value: 'in-progress', label: 'In Progress', count: taskStats.inProgress },
    { value: 'completed', label: 'Completed', count: taskStats.completed },
    { value: 'overdue', label: 'Overdue', count: taskStats.overdue },
    { value: 'due-today', label: 'Due Today', count: taskStats.dueToday }
  ];

  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'High', label: 'High Priority' },
    { value: 'Medium', label: 'Medium Priority' },
    { value: 'Low', label: 'Low Priority' }
  ];

  const assigneeOptions = [
    { value: 'all', label: 'All Assignees' },
    ...staffMembers.map(member => ({ value: member.name, label: member.name }))
  ];

  // Get task urgency info
  const getUrgencyInfo = () => {
    if (taskStats.overdue > 0) {
      return {
        type: 'error',
        message: `${taskStats.overdue} overdue task${taskStats.overdue !== 1 ? 's' : ''}`
      };
    } else if (taskStats.dueToday > 0) {
      return {
        type: 'warning',
        message: `${taskStats.dueToday} task${taskStats.dueToday !== 1 ? 's' : ''} due today`
      };
    } else if (taskStats.high > 0) {
      return {
        type: 'info',
        message: `${taskStats.high} high priority task${taskStats.high !== 1 ? 's' : ''}`
      };
    }
    return null;
  };

  const urgencyInfo = getUrgencyInfo();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold">Task Management</h3>
          <div className="flex items-center space-x-4 mt-1">
            <p className="text-gray-600">
              {filteredTasks.length} of {tasks.length} tasks
            </p>
            {urgencyInfo && (
              <div className={`flex items-center space-x-1 text-sm ${
                urgencyInfo.type === 'error' ? 'text-red-600' : 
                urgencyInfo.type === 'warning' ? 'text-yellow-600' : 'text-blue-600'
              }`}>
                <AlertCircle size={14} />
                <span>{urgencyInfo.message}</span>
              </div>
            )}
          </div>
        </div>
        
        <button
          onClick={() => onAdd()}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
              <p className="text-xl font-bold text-gray-900">{taskStats.total}</p>
            </div>
            <CheckSquare className="text-gray-400" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-500 uppercase tracking-wide">Pending</p>
              <p className="text-xl font-bold text-yellow-600">{taskStats.pending}</p>
            </div>
            <Calendar className="text-yellow-400" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-500 uppercase tracking-wide">In Progress</p>
              <p className="text-xl font-bold text-blue-600">{taskStats.inProgress}</p>
            </div>
            <User className="text-blue-400" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-green-500 uppercase tracking-wide">Completed</p>
              <p className="text-xl font-bold text-green-600">{taskStats.completed}</p>
            </div>
            <CheckSquare className="text-green-400" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-red-500 uppercase tracking-wide">Overdue</p>
              <p className="text-xl font-bold text-red-600">{taskStats.overdue}</p>
            </div>
            <AlertCircle className="text-red-400" size={20} />
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-orange-500 uppercase tracking-wide">Due Today</p>
              <p className="text-xl font-bold text-orange-600">{taskStats.dueToday}</p>
            </div>
            <Calendar className="text-orange-400" size={20} />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="space-y-4">
          {/* Status Filter Tabs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Status</label>
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
          </div>

          {/* Additional Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {priorityOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Assignee Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Assignee</label>
              <select
                value={selectedAssignee}
                onChange={(e) => setSelectedAssignee(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                {assigneeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            customers={customers}
            onEdit={() => onEdit(task)}
            onDelete={() => onDelete(task.id)}
            onUpdateStatus={(status) => onUpdateStatus(task.id, status)}
            onAssign={(assignee) => onAssignTask(task.id, assignee)}
            staffMembers={staffMembers}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredTasks.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <CheckSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchQuery || selectedFilter !== 'all' ? 'No tasks found' : 'No tasks yet'}
          </h3>
          <p className="text-gray-500 mb-4">
            {searchQuery || selectedFilter !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start by creating your first task'
            }
          </p>
          {(!searchQuery && selectedFilter === 'all') && (
            <button
              onClick={() => onAdd()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
            >
              <Plus size={16} className="mr-2" />
              Create Your First Task
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default TasksModule;