// src/hooks/useTasks.js
import { useState, useCallback } from 'react';

export const useTasks = (initialTasks = []) => {
  const [tasks, setTasks] = useState(initialTasks);
  const [isLoading, setIsLoading] = useState(false);

  // Add task
  const addTask = useCallback(async (taskData, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      const newTask = {
        ...taskData,
        id: Math.max(...tasks.map(t => t.id), 0) + 1,
        created: new Date().toISOString().split('T')[0]
      };

      // Add to local state first
      setTasks(prev => [...prev, newTask]);

      // Try to add to database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/tasks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              title: newTask.title,
              description: newTask.description,
              customer_id: newTask.customerId,
              customer_name: newTask.customerName,
              assigned_to: newTask.assignedTo,
              assigned_to_email: newTask.assignedToEmail,
              priority: newTask.priority,
              status: newTask.status,
              due_date: newTask.dueDate,
              tags: newTask.tags
            })
          });
        } catch (dbError) {
          console.warn('Failed to save task to database:', dbError);
        }
      }

      return { success: true, task: newTask };
    } catch (error) {
      console.error('Error adding task:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  // Update task
  const updateTask = useCallback(async (taskId, taskData, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      const updatedTask = {
        ...taskData,
        id: taskId
      };

      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, ...updatedTask } : t
      ));

      // Try to update in database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/tasks', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: taskId,
              title: updatedTask.title,
              description: updatedTask.description,
              customer_id: updatedTask.customerId,
              customer_name: updatedTask.customerName,
              assigned_to: updatedTask.assignedTo,
              assigned_to_email: updatedTask.assignedToEmail,
              priority: updatedTask.priority,
              status: updatedTask.status,
              due_date: updatedTask.dueDate,
              tags: updatedTask.tags
            })
          });
        } catch (dbError) {
          console.warn('Failed to update task in database:', dbError);
        }
      }

      return { success: true, task: updatedTask };
    } catch (error) {
      console.error('Error updating task:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete task
  const deleteTask = useCallback(async (taskId, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      const task = tasks.find(t => t.id === taskId);
      
      // Remove from local state
      setTasks(prev => prev.filter(t => t.id !== taskId));

      // Try to delete from database if connected
      if (isDatabaseConnected) {
        try {
          await fetch(`/api/database/tasks?taskId=${taskId}`, {
            method: 'DELETE'
          });
        } catch (dbError) {
          console.warn('Failed to delete task from database:', dbError);
        }
      }

      return { success: true, task };
    } catch (error) {
      console.error('Error deleting task:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [tasks]);

  // Update task status
  const updateTaskStatus = useCallback(async (taskId, status, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, status } : t
      ));

      // Try to update in database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/tasks/status', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, status })
          });
        } catch (dbError) {
          console.warn('Failed to update task status in database:', dbError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating task status:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Assign task to someone
  const assignTask = useCallback(async (taskId, assignedTo, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      // Update local state
      setTasks(prev => prev.map(t => 
        t.id === taskId ? { ...t, assignedTo } : t
      ));

      // Try to update in database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/tasks/assign', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: taskId, assigned_to: assignedTo })
          });
        } catch (dbError) {
          console.warn('Failed to assign task in database:', dbError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error assigning task:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Find task by ID
  const findTaskById = useCallback((taskId) => {
    return tasks.find(t => t.id === taskId);
  }, [tasks]);

  // Find tasks by customer ID
  const findTasksByCustomerId = useCallback((customerId) => {
    return tasks.filter(t => t.customerId === customerId);
  }, [tasks]);

  // Find tasks by assignee
  const findTasksByAssignee = useCallback((assignee) => {
    return tasks.filter(t => t.assignedTo === assignee);
  }, [tasks]);

  // Filter tasks by status
  const filterTasksByStatus = useCallback((status) => {
    return tasks.filter(t => t.status === status);
  }, [tasks]);

  // Get overdue tasks
  const getOverdueTasks = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return tasks.filter(task => {
      const dueDate = new Date(task.dueDate);
      dueDate.setHours(0, 0, 0, 0);
      return dueDate < today && task.status !== 'Completed';
    });
  }, [tasks]);

  // Get tasks due today
  const getTasksDueToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    return tasks.filter(task => task.dueDate === today && task.status !== 'Completed');
  }, [tasks]);

  // Get task statistics
  const getTaskStats = useCallback(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split('T')[0];
    
    return {
      total: tasks.length,
      pending: tasks.filter(t => t.status === 'Pending').length,
      inProgress: tasks.filter(t => t.status === 'In Progress').length,
      completed: tasks.filter(t => t.status === 'Completed').length,
      overdue: tasks.filter(t => {
        const dueDate = new Date(t.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today && t.status !== 'Completed';
      }).length,
      dueToday: tasks.filter(t => t.dueDate === todayStr && t.status !== 'Completed').length,
      high: tasks.filter(t => t.priority === 'High' && t.status !== 'Completed').length,
      medium: tasks.filter(t => t.priority === 'Medium' && t.status !== 'Completed').length,
      low: tasks.filter(t => t.priority === 'Low' && t.status !== 'Completed').length,
      byAssignee: tasks.reduce((acc, task) => {
        acc[task.assignedTo] = (acc[task.assignedTo] || 0) + 1;
        return acc;
      }, {})
    };
  }, [tasks]);

  // Load tasks from database
  const loadTasksFromDatabase = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/database/tasks');
      const result = await response.json();
      
      if (result.success) {
        setTasks(result.data);
        return { success: true, tasks: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error loading tasks from database:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Bulk update tasks
  const bulkUpdateTasks = useCallback(async (taskIds, updates, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      // Update local state
      setTasks(prev => prev.map(task => 
        taskIds.includes(task.id) ? { ...task, ...updates } : task
      ));

      // Try to update in database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/tasks/bulk-update', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskIds, updates })
          });
        } catch (dbError) {
          console.warn('Failed to bulk update tasks in database:', dbError);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error bulk updating tasks:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    tasks,
    setTasks,
    isLoading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    findTaskById,
    findTasksByCustomerId,
    findTasksByAssignee,
    filterTasksByStatus,
    getOverdueTasks,
    getTasksDueToday,
    getTaskStats,
    loadTasksFromDatabase,
    bulkUpdateTasks
  };
};