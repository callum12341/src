// src/components/customers/CustomersModule.js
import React from 'react';
import { Users, Plus } from 'lucide-react';
import CustomerCard from './CustomerCard';

const CustomersModule = ({ 
  customers, 
  onAdd, 
  onEdit, 
  onDelete, 
  onSendEmail 
}) => {
  return (
    <div className="space-y-6">
      {/* Header with Add Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Customer Management</h3>
          <p className="text-gray-600">{customers.length} total customers</p>
        </div>
        <button
          onClick={onAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
        >
          <Plus size={16} className="mr-2" />
          Add Customer
        </button>
      </div>

      {/* Customer Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(customer => (
          <CustomerCard
            key={customer.id}
            customer={customer}
            onEdit={() => onEdit(customer)}
            onDelete={() => onDelete(customer.id)}
            onSendEmail={() => onSendEmail(customer)}
          />
        ))}
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No customers yet</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first customer</p>
          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 inline-flex items-center"
          >
            <Plus size={16} className="mr-2" />
            Add Your First Customer
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomersModule;