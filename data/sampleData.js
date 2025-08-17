export const initialCustomers = [
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

export const initialTasks = [
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

export const initialEmails = [
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

export const staffMembers = [
  { id: 1, name: 'Mike Wilson', email: 'mike@company.com', role: 'Sales Manager' },
  { id: 2, name: 'Lisa Chen', email: 'lisa@company.com', role: 'Account Executive' },
  { id: 3, name: 'David Brown', email: 'david@company.com', role: 'Support Lead' }
];