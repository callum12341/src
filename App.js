// src/App.js - Updated with Header and Customer Components
import React, { useState, useMemo, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

// Import new common components
import Sidebar from './components/common/Sidebar';
import Header from './components/common/Header';
import Notification from './components/common/Notification';
import Modal from './components/common/Modal';

// Import customer components
import CustomersModule from './components/customers';
import { CustomerForm } from './components/customers';

// Import custom hooks
import { useNotification } from './hooks/useNotification';
import { useCustomers } from './hooks/useCustomers';

// Keep existing component imports for modules we haven't extracted yet
// TODO: Extract these next
// import TasksModule from './components/tasks';
// import EmailModule from './components/emails';
// etc...

// Sample data (TODO: move to data files)
const initialCustomersData = [
  {
    id: 1,
    name: 'John Smith',
    email: 'john.smith@example.com',
    phone: '+1-555-0123',
    company: 'Acme Corp',
    address: '123 Main St, City, State 12345',
    status: 'Active',
    source: 'WooCommerce',
    created: '2024-01-15',
    lastContact: '2024-08-10',
    orderValue: 2500.00,
    tags: ['VIP', 'Enterprise']
  },
  {
    id: 2,
    name: 'Sarah Johnson',
    email: 'sarah.j@techstart.com',
    phone: '+1-555-0124',
    company: 'TechStart Inc',
    address: '456 Oak Ave, City, State 12345',
    status: 'Lead',
    source: 'Manual',
    created: '2024-02-20',
    lastContact: '2024-08-12',
    orderValue: 1200.00,
    tags: ['Hot Lead']
  }
];

const initialTasks = [
  {
    id: 1,
    title: 'Follow up on proposal',
    description: 'Send follow-up email regarding the enterprise package proposal',
    customerId: 1,
    customerName: 'John Smith',
    assignedTo: 'Mike Wilson',
    assignedToEmail: 'mike@company.com',
    priority: 'High',
    status: 'In Progress',
    dueDate: '2024-08-20',
    created: '2024-08-15',
    tags: ['Sales', 'Follow-up']
  },
  {
    id: 2,
    title: 'Schedule demo call',
    description: 'Set up product demo for potential client',
    customerId: 2,
    customerName: 'Sarah Johnson',
    assignedTo: 'Lisa Chen',
    assignedToEmail: 'lisa@company.com',
    priority: 'Medium',
    status: 'Pending',
    dueDate: '2024-08-18',
    created: '2024-08-14',
    tags: ['Demo', 'Sales']
  }
];

const initialEmails = [
  {
    id: 1,
    customerId: 1,
    customerName: 'John Smith',
    subject: 'Re: Enterprise Package Inquiry',
    from: 'john.smith@example.com',
    to: 'sales@company.com',
    cc: '',
    bcc: '',
    body: 'Hi, I am interested in learning more about your enterprise package. Could you please send me more details about pricing and features?',
    timestamp: '2024-08-15 10:30:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_1',
    type: 'incoming',
    status: 'delivered',
    priority: 'normal',
    attachments: []
  },
  {
    id: 2,
    customerId: 2,
    customerName: 'Sarah Johnson',
    subject: 'Welcome to our CRM!',
    from: 'sales@company.com',
    to: 'sarah.j@techstart.com',
    cc: '',
    bcc: '',
    body: 'Thank you for your interest in our services. We are excited to work with you!',
    timestamp: '2024-08-14 14:15:00',
    isRead: true,
    isStarred: false,
    thread: 'thread_2',
    type: 'outgoing',
    status: 'sent',
    priority: 'normal',
    smtpMessageId: 'msg_12345',
    attachments: []
  }
];

const CRM = () => {
  // State management
  const [activeModule, setActiveModule] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [tasks, setTasks] = useState(initialTasks);
  const [emails, setEmails] = useState(initialEmails);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [emailQueue, setEmailQueue] = useState([]);
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
  } = useCustomers(initialCustomersData);

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

  // Customer handlers using the new hook
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
      // Also remove related tasks
      setTasks(prev => prev.filter(t => t.customerId !== customerId));
    } else {
      showError(`Failed to delete customer: ${result.error}`);
    }
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ emails: emailQueue })
      });

      const result = await response.json();

      if (result.success) {
        // Process results and update UI
        result.results.forEach((emailResult, index) => {
          if (emailResult.success) {
            const originalEmail = emailQueue[index];
            const newEmail = {
              id: Math.max(...emails.map(e => e.id), 0) + index + 1,
              ...originalEmail,
              timestamp: new Date().toLocaleString(),
              isRead: true,
              isStarred: false,
              thread: `thread_${Date.now()}_${index}`,
              type: 'outgoing',
              status: 'sent',
              smtpMessageId: emailResult.messageId,
              attachments: originalEmail.attachments || []
            };
            setEmails(prev => [newEmail, ...prev]);
          }
        });

        // Clear successful emails from queue
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
      task.assignedTo.toLowerCase().includes(query)
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
            />
          )}
          
          {!searchQuery && activeModule === 'customers' && (
            <CustomersModule 
              customers={customers} 
              onAdd={() => openModal('add-customer')}
              onEdit={(customer) => openModal('edit-customer', customer)}
              onDelete={handleDeleteCustomer}
              onSendEmail={(customer) => openModal('compose-email', customer)}
            />
          )}
          
          {/* TODO: Add other modules here */}
          {!searchQuery && activeModule === 'tasks' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Tasks Module</h3>
              <p className="text-gray-600">Tasks module will be extracted next...</p>
            </div>
          )}
          
          {!searchQuery && activeModule === 'emails' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Email Module</h3>
              <p className="text-gray-600">Email module will be extracted next...</p>
            </div>
          )}
          
          {!searchQuery && activeModule === 'compose' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Compose Email</h3>
              <p className="text-gray-600">Compose module will be extracted next...</p>
            </div>
          )}
          
          {!searchQuery && activeModule === 'email-setup' && (
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">Email Setup</h3>
              <p className="text-gray-600">Email setup module will be extracted next...</p>
            </div>
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

      {/* Customer Modals */}
      {showModal && (
        <Modal onClose={closeModal} title={getModalTitle(modalType)}>
          {modalType === 'add-customer' && (
            <CustomerForm onSubmit={handleAddCustomer} />
          )}
          {modalType === 'edit-customer' && selectedItem && (
            <CustomerForm customer={selectedItem} onSubmit={handleUpdateCustomer} />
          )}
          {modalType === 'compose-email' && selectedItem && (
            <div className="p-6">
              <h4 className="text-lg font-semibold mb-4">
                Compose Email to {selectedItem.name}
              </h4>
              <p className="text-gray-600">Email compose form will be extracted next...</p>
            </div>
          )}
          {/* TODO: Add other modal types */}
        </Modal>
      )}
    </div>
  );
};

// Temporary placeholder components (TODO: Extract these)
const Dashboard = ({ customers, tasks, emails, isDatabaseConnected, emailConfig }) => (
  <div className="bg-white rounded-lg shadow p-6">
    <h3 className="text-lg font-semibold mb-4">Dashboard</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-blue-50 p-4 rounded-lg">
        <h4 className="font-medium text-blue-800">Customers</h4>
        <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
      </div>
      <div className="bg-green-50 p-4 rounded-lg">
        <h4 className="font-medium text-green-800">Tasks</h4>
        <p className="text-2xl font-bold text-green-600">{tasks.length}</p>
      </div>
      <div className="bg-purple-50 p-4 rounded-lg">
        <h4 className="font-medium text-purple-800">Emails</h4>
        <p className="text-2xl font-bold text-purple-600">{emails.length}</p>
      </div>
    </div>
  </div>
);

const SearchResults = ({ results, onClearSearch }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-lg font-semibold">Search Results</h3>
      <button onClick={onClearSearch} className="text-blue-600 hover:text-blue-800">
        Clear search
      </button>
    </div>
    <p className="text-gray-600">Search results component will be extracted next...</p>
  </div>
);

export default CRM;