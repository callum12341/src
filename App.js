// src/App.js - Final Version with Complete Task Integration
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// Import common components
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Notification from './components/common/Notification';
import Modal from './components/common/Modal';

// Import customer components
import CustomersModule from './components/customers';
import { CustomerForm } from './components/customers';

// Import email components
import { 
  EmailModule, 
  ComposeEmailModule, 
  EmailSetupModule 
} from './components/emails';

// Import task components
import { 
  TasksModule, 
  TaskForm 
} from './components/tasks';

// Import custom hooks
import { useNotification } from './hooks/useNotification';
import { useCustomers } from './hooks/useCustomers';
import { useEmails } from './hooks/useEmails';
import { useTasks } from './hooks/useTasks';

// Import data
import { initialCustomers, initialTasks, initialEmails, staffMembers } from './data/sampleData';
import { emailTemplates } from './data/emailTemplates';

const CRM = () => {
  // State management
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showDatabaseManager, setShowDatabaseManager] = useState(false);
  const [isDatabaseConnected, setIsDatabaseConnected] = useState(false);
  const [emailConfig, setEmailConfig] = useState({
    smtp: { configured: false },
    imap: { configured: false },
    sendgrid: { configured: false }
  });

  // Use custom hooks
  const { notification, showNotification, hideNotification, showSuccess, showError } = useNotification();
  
  const { 
    customers, 
    isLoading: isCustomersLoading,
    addCustomer, 
    updateCustomer, 
    deleteCustomer 
  } = useCustomers(initialCustomers);
  
  const {
    emails,
    setEmails,
    emailQueue,
    setEmailQueue,
    addEmail,
    updateEmail,
    deleteEmail,
    markEmailAsRead,
    toggleEmailStar,
    queueEmail,
    clearQueue
  } = useEmails(initialEmails);

  const {
    tasks,
    setTasks,
    isLoading: isTasksLoading,
    addTask,
    updateTask,
    deleteTask,
    updateTaskStatus,
    assignTask,
    getTaskStats
  } = useTasks(initialTasks);

  // Check email configuration on mount
  useEffect(() => {
    checkEmailConfig();
  }, []);

  // Check email configuration
  const checkEmailConfig = async () => {
    try {
      const response = await fetch('/api/email/config', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setEmailConfig(result.config);
        }
      }
    } catch (error) {
      console.warn('Failed to check email configuration:', error);
    }
  };

  // Modal handlers
  const openModal = (type, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
    setModalType('');
  };

  // Customer handlers
  const handleAddCustomer = async (customerData) => {
    const result = await addCustomer(customerData, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Customer "${result.customer.name}" added successfully!`);
      closeModal();
    } else {
      showError(`Failed to add customer: ${result.error}`);
    }
  };

  const handleUpdateCustomer = async (customerData) => {
    const result = await updateCustomer(selectedItem.id, customerData, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Customer "${customerData.name}" updated successfully!`);
      closeModal();
    } else {
      showError(`Failed to update customer: ${result.error}`);
    }
  };

  const handleDeleteCustomer = async (customerId) => {
    const result = await deleteCustomer(customerId, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Customer "${result.customer.name}" deleted successfully!`);
      // Also remove related tasks and emails
      setTasks(prev => prev.filter(t => t.customerId !== customerId));
      setEmails(prev => prev.filter(e => e.customerId !== customerId));
    } else {
      showError(`Failed to delete customer: ${result.error}`);
    }
  };

  // Task handlers
  const handleAddTask = async (taskData) => {
    const result = await addTask(taskData, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Task "${result.task.title}" created successfully!`);
      closeModal();
    } else {
      showError(`Failed to create task: ${result.error}`);
    }
  };

  const handleUpdateTask = async (taskData) => {
    const result = await updateTask(selectedItem.id, taskData, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Task "${taskData.title}" updated successfully!`);
      closeModal();
    } else {
      showError(`Failed to update task: ${result.error}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const result = await deleteTask(taskId, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Task "${result.task.title}" deleted successfully!`);
    } else {
      showError(`Failed to delete task: ${result.error}`);
    }
  };

  const handleUpdateTaskStatus = async (taskId, status) => {
    const result = await updateTaskStatus(taskId, status, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Task status updated to "${status}"!`);
    } else {
      showError(`Failed to update task status: ${result.error}`);
    }
  };

  const handleAssignTask = async (taskId, assignee) => {
    const result = await assignTask(taskId, assignee, isDatabaseConnected);
    if (result.success) {
      showSuccess(`Task assigned to ${assignee}!`);
    } else {
      showError(`Failed to assign task: ${result.error}`);
    }
  };

  // Email handlers
  const handleSendEmail = async (emailData) => {
    try {
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      const result = await response.json();

      if (result.success) {
        const newEmail = {
          id: Math.max(...emails.map(e => e.id), 0) + 1,
          ...emailData,
          timestamp: new Date().toISOString(),
          isRead: true,
          isStarred: false,
          thread: `thread_${Date.now()}`,
          type: 'outgoing',
          status: 'sent',
          smtpMessageId: result.messageId,
          customerName: emailData.customerId ? 
            customers.find(c => c.id === emailData.customerId)?.name || 'Unknown' : 
            'Unknown'
        };

        addEmail(newEmail);
        showSuccess('Email sent successfully!');
        closeModal();
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Send email error:', error);
      showError('Failed to send email: ' + error.message);
    }
  };

  const handleQueueEmail = async (emailData) => {
    const queuedEmail = {
      ...emailData,
      id: Math.max(...emailQueue.map(e => e.id || 0), 0) + 1,
      queuedAt: new Date().toISOString(),
      customerName: emailData.customerId ? 
        customers.find(c => c.id === emailData.customerId)?.name || 'Unknown' : 
        'Unknown'
    };

    queueEmail(queuedEmail);
    showSuccess('Email added to queue!');
    closeModal();
  };

  const handleSaveDraft = async (emailData) => {
    showSuccess('Draft saved!');
  };

  const handleReplyToEmail = (email) => {
    const replyData = {
      to: email.from,
      subject: email.subject.startsWith('Re:') ? email.subject : `Re: ${email.subject}`,
      body: `\n\n--- Original Message ---\nFrom: ${email.from}\nSent: ${email.timestamp}\nSubject: ${email.subject}\n\n${email.body}`,
      customerId: email.customerId
    };
    openModal('compose-email', replyData);
  };

  // Process email queue function
  const processEmailQueue = async () => {
    if (emailQueue.length === 0) {
      showNotification('No emails in queue', 'info');
      return;
    }

    showNotification(`Processing ${emailQueue.length} queued emails...`, 'info');
    
    try {
      const response = await fetch('/api/bulk-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emails: emailQueue })
      });

      const result = await response.json();

      if (result.success) {
        result.results.forEach((emailResult, index) => {
          if (emailResult.success) {
            const originalEmail = emailQueue[index];
            const newEmail = {
              id: Math.max(...emails.map(e => e.id), 0) + index + 1,
              ...originalEmail,
              timestamp: new Date().toISOString(),
              isRead: true,
              isStarred: false,
              thread: `thread_${Date.now()}_${index}`,
              type: 'outgoing',
              status: 'sent',
              smtpMessageId: emailResult.messageId,
              attachments: originalEmail.attachments || []
            };
            addEmail(newEmail);
          }
        });

        const failedEmails = emailQueue.filter((_, index) => 
          !result.results[index].success
        );
        setEmailQueue(failedEmails);

        showNotification(
          `${result.summary.successful} emails sent successfully, ${result.summary.failed} failed`,
          result.summary.failed > 0 ? 'warning' : 'success'
        );
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Bulk email error:', error);
      showError('Failed to process email queue: ' + error.message);
    }
  };

  // Email configuration handlers
  const handleUpdateEmailConfig = (newConfig) => {
    setEmailConfig(newConfig);
  };

  const handleTestEmailConnection = async (provider, config) => {
    try {
      const response = await fetch('/api/email/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, config })
      });

      const result = await response.json();
      return result;
    } catch (error) {
      return { success: false, message: error.message };
    }
  };

  // Global search functionality
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return { customers: [], tasks: [], emails: [] };
    
    const query = searchQuery.toLowerCase();
    
    const customerResults = customers.filter(customer =>
      customer.name.toLowerCase().includes(query) ||
      customer.email.toLowerCase().includes(query) ||
      customer.company.toLowerCase().includes(query) ||
      customer.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const taskResults = tasks.filter(task =>
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.customerName.toLowerCase().includes(query) ||
      task.assignedTo.toLowerCase().includes(query) ||
      task.tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const emailResults = emails.filter(email =>
      email.subject.toLowerCase().includes(query) ||
      email.body.toLowerCase().includes(query) ||
      email.customerName.toLowerCase().includes(query) ||
      email.from.toLowerCase().includes(query) ||
      email.to.toLowerCase().includes(query)
    );
    
    return { customers: customerResults, tasks: taskResults, emails: emailResults };
  }, [searchQuery, customers, tasks, emails]);

  // Modal title helper
  const getModalTitle = (modalType) => {
    switch (modalType) {
      case 'add-customer': return 'Add New Customer';
      case 'edit-customer': return 'Edit Customer';
      case 'add-task': return 'Create New Task';
      case 'edit-task': return 'Edit Task';
      case 'compose-email': return 'Compose Email';
      default: return 'Modal';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Notification */}
      <Notification 
        notification={notification} 
        onClose={hideNotification} 
      />

      {/* Sidebar */}
      <Sidebar 
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        setShowDatabaseManager={setShowDatabaseManager}
        isDatabaseConnected={isDatabaseConnected}
        emailConfig={emailConfig}
        emails={emails}
        emailQueue={emailQueue}
        processEmailQueue={processEmailQueue}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        {/* Header */}
        <Header 
          activeModule={activeModule}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          customers={customers}
          tasks={tasks}
          emails={emails}
        />

        {/* Content Area */}
        <main className="flex-1 overflow-auto p-6">
          {/* Database connection warning */}
          {!isDatabaseConnected && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="text-yellow-600 mr-3" size={20} />
                <div className="flex-1">
                  <p className="text-yellow-800 font-medium">Database Not Connected</p>
                  <p className="text-yellow-700 text-sm">
                    Your data is currently stored locally. Connect to a database for persistence across sessions.
                  </p>
                </div>
                <button
                  onClick={() => setShowDatabaseManager(true)}
                  className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 text-sm"
                >
                  Setup Database
                </button>
              </div>
            </div>
          )}

          {/* Search Results */}
          {searchQuery && (
            <SearchResults 
              results={searchResults} 
              onClearSearch={() => setSearchQuery('')}
            />
          )}
          
          {/* Module Content */}
          {!searchQuery && activeModule === 'dashboard' && (
            <Dashboard 
              customers={customers} 
              tasks={tasks} 
              emails={emails} 
              isDatabaseConnected={isDatabaseConnected}
              emailConfig={emailConfig}
              getTaskStats={getTaskStats}
            />
          )}
          
          {!searchQuery && activeModule === 'customers' && (
            <CustomersModule 
              customers={customers} 
              onAdd={() => openModal('add-customer')}
              onEdit={(customer) => openModal('edit-customer', customer)}
              onDelete={handleDeleteCustomer}
              onSendEmail={(customer) => openModal('compose-email', { customerId: customer.id, to: customer.email })}
            />
          )}

          {!searchQuery && activeModule === 'tasks' && (
            <TasksModule 
              tasks={tasks}
              customers={customers}
              staffMembers={staffMembers}
              onAdd={() => openModal('add-task')}
              onEdit={(task) => openModal('edit-task', task)}
              onDelete={handleDeleteTask}
              onUpdateStatus={handleUpdateTaskStatus}
              onAssignTask={handleAssignTask}
            />
          )}

          {!searchQuery && activeModule === 'emails' && (
            <EmailModule 
              emails={emails}
              customers={customers}
              onCompose={() => openModal('compose-email')}
              onReply={handleReplyToEmail}
              onDelete={deleteEmail}
              onMarkAsRead={markEmailAsRead}
              onToggleStar={toggleEmailStar}
            />
          )}

          {!searchQuery && activeModule === 'compose' && (
            <ComposeEmailModule 
              customers={customers}
              emailTemplates={emailTemplates}
              onSendEmail={handleSendEmail}
              onSaveDraft={handleSaveDraft}
              onQueueEmail={handleQueueEmail}
            />
          )}

          {!searchQuery && activeModule === 'email-setup' && (
            <EmailSetupModule 
              emailConfig={emailConfig}
              onUpdateConfig={handleUpdateEmailConfig}
              onTestConnection={handleTestEmailConnection}
              showNotification={showNotification}
            />
          )}
          
          {!searchQuery && activeModule === 'imap-debug' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">IMAP Debug</h3>
              <p className="text-gray-600">IMAP debug module will be extracted next...</p>
            </div>
          )}
        </main>
      </div>

      {/* Database Manager Modal */}
      {showDatabaseManager && (
        <Modal 
          onClose={() => setShowDatabaseManager(false)} 
          title="Database Management"
          maxWidth="max-w-6xl"
        >
          <div className="p-6">
            <p className="text-gray-600">Database Manager component will be extracted next...</p>
          </div>
        </Modal>
      )}

      {/* All Modals */}
      {showModal && (
        <Modal onClose={closeModal} title={getModalTitle(modalType)} maxWidth="max-w-4xl">
          {modalType === 'add-customer' && (
            <CustomerForm onSubmit={handleAddCustomer} />
          )}
          {modalType === 'edit-customer' && selectedItem && (
            <CustomerForm customer={selectedItem} onSubmit={handleUpdateCustomer} />
          )}
          {modalType === 'add-task' && (
            <TaskForm 
              customers={customers}
              staffMembers={staffMembers}
              onSubmit={handleAddTask} 
            />
          )}
          {modalType === 'edit-task' && selectedItem && (
            <TaskForm 
              task={selectedItem}
              customers={customers}
              staffMembers={staffMembers}
              onSubmit={handleUpdateTask} 
            />
          )}
          {modalType === 'compose-email' && (
            <ComposeEmailModule 
              customers={customers}
              emailTemplates={emailTemplates}
              onSendEmail={handleSendEmail}
              onSaveDraft={handleSaveDraft}
              onQueueEmail={handleQueueEmail}
              initialData={selectedItem}
              onCancel={closeModal}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

// Updated Dashboard with Task Stats
const Dashboard = ({ customers, tasks, emails, isDatabaseConnected, emailConfig, getTaskStats }) => {
  const taskStats = getTaskStats();
  
  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-blue-800">Customers</h4>
          <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
          <p className="text-sm text-gray-500 mt-1">Total customers</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-green-800">Tasks</h4>
          <p className="text-2xl font-bold text-green-600">{tasks.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {taskStats.overdue > 0 && (
              <span className="text-red-600">{taskStats.overdue} overdue</span>
            )}
            {taskStats.dueToday > 0 && (
              <span className="text-orange-600">{taskStats.dueToday} due today</span>
            )}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-purple-800">Emails</h4>
          <p className="text-2xl font-bold text-purple-600">{emails.length}</p>
          <p className="text-sm text-gray-500 mt-1">
            {emails.filter(e => !e.isRead).length} unread
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h4 className="font-medium text-yellow-800">Active Tasks</h4>
          <p className="text-2xl font-bold text-yellow-600">{taskStats.inProgress}</p>
          <p className="text-sm text-gray-500 mt-1">In progress</p>
        </div>
      </div>

      {/* Task Status Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Task Overview</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{taskStats.pending}</div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{taskStats.inProgress}</div>
            <div className="text-sm text-gray-500">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{taskStats.completed}</div>
            <div className="text-sm text-gray-500">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{taskStats.overdue}</div>
            <div className="text-sm text-gray-500">Overdue</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{taskStats.dueToday}</div>
            <div className="text-sm text-gray-500">Due Today</div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {tasks.slice(0, 5).map(task => (
              <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{task.title}</p>
                  <p className="text-xs text-gray-600">{task.assignedTo}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    task.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    task.status === 'In Progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {task.status}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">{task.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Recent Emails</h3>
          <div className="space-y-3">
            {emails.slice(0, 5).map(email => (
              <div key={email.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium text-sm">{email.subject}</p>
                  <p className="text-xs text-gray-600">{email.customerName}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    email.type === 'outgoing' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {email.type === 'outgoing' ? 'Sent' : 'Received'}
                  </span>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(email.timestamp).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SearchResults = ({ results, onClearSearch }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Search Results</h3>
      <button onClick={onClearSearch} className="text-blue-600 hover:text-blue-800">
        Clear search
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div>
        <h4 className="font-medium mb-2">Customers ({results.customers.length})</h4>
        {results.customers.slice(0, 3).map(customer => (
          <div key={customer.id} className="text-sm text-gray-600 mb-1">
            {customer.name} - {customer.email}
          </div>
        ))}
      </div>
      <div>
        <h4 className="font-medium mb-2">Tasks ({results.tasks.length})</h4>
        {results.tasks.slice(0, 3).map(task => (
          <div key={task.id} className="text-sm text-gray-600 mb-1">
            {task.title} - {task.status}
          </div>
        ))}
      </div>
      <div>
        <h4 className="font-medium mb-2">Emails ({results.emails.length})</h4>
        {results.emails.slice(0, 3).map(email => (
          <div key={email.id} className="text-sm text-gray-600 mb-1">
            {email.subject}
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default CRM;