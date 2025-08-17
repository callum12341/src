// src/hooks/useCustomers.js
import { useState, useCallback } from 'react';

export const useCustomers = (initialCustomers = []) => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [isLoading, setIsLoading] = useState(false);

  // Add customer
  const addCustomer = useCallback(async (customerData, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      const newCustomer = {
        ...customerData,
        id: Math.max(...customers.map(c => c.id), 0) + 1,
        created: new Date().toISOString().split('T')[0],
        lastContact: '',
        source: 'Manual',
        orderValue: parseFloat(customerData.orderValue) || 0,
        tags: customerData.tags ? 
          customerData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
          []
      };

      // Add to local state first
      setCustomers(prev => [...prev, newCustomer]);

      // Try to add to database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/customers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: newCustomer.name,
              email: newCustomer.email,
              phone: newCustomer.phone,
              company: newCustomer.company,
              address: newCustomer.address,
              status: newCustomer.status,
              source: newCustomer.source,
              order_value: newCustomer.orderValue,
              tags: newCustomer.tags
            })
          });
        } catch (dbError) {
          console.warn('Failed to save customer to database:', dbError);
          // Don't remove from local state if database fails
        }
      }

      return { success: true, customer: newCustomer };
    } catch (error) {
      console.error('Error adding customer:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [customers]);

  // Update customer
  const updateCustomer = useCallback(async (customerId, customerData, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      const updatedCustomer = {
        ...customerData,
        orderValue: parseFloat(customerData.orderValue) || 0,
        tags: customerData.tags ? 
          customerData.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : 
          []
      };

      // Update local state
      setCustomers(prev => prev.map(c => 
        c.id === customerId ? { ...c, ...updatedCustomer } : c
      ));

      // Try to update in database if connected
      if (isDatabaseConnected) {
        try {
          await fetch('/api/database/customers', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: customerId,
              name: updatedCustomer.name,
              email: updatedCustomer.email,
              phone: updatedCustomer.phone,
              company: updatedCustomer.company,
              address: updatedCustomer.address,
              status: updatedCustomer.status,
              order_value: updatedCustomer.orderValue,
              tags: updatedCustomer.tags
            })
          });
        } catch (dbError) {
          console.warn('Failed to update customer in database:', dbError);
        }
      }

      return { success: true, customer: updatedCustomer };
    } catch (error) {
      console.error('Error updating customer:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Delete customer
  const deleteCustomer = useCallback(async (customerId, isDatabaseConnected = false) => {
    setIsLoading(true);
    
    try {
      const customer = customers.find(c => c.id === customerId);
      
      // Remove from local state
      setCustomers(prev => prev.filter(c => c.id !== customerId));

      // Try to delete from database if connected
      if (isDatabaseConnected) {
        try {
          await fetch(`/api/database/customers?customerId=${customerId}`, {
            method: 'DELETE'
          });
        } catch (dbError) {
          console.warn('Failed to delete customer from database:', dbError);
          // Could restore customer to local state here if needed
        }
      }

      return { success: true, customer };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, [customers]);

  // Find customer by ID
  const findCustomerById = useCallback((customerId) => {
    return customers.find(c => c.id === customerId);
  }, [customers]);

  // Find customer by email
  const findCustomerByEmail = useCallback((email) => {
    return customers.find(c => c.email.toLowerCase() === email.toLowerCase());
  }, [customers]);

  // Filter customers
  const filterCustomers = useCallback((filters) => {
    return customers.filter(customer => {
      // Status filter
      if (filters.status && customer.status !== filters.status) {
        return false;
      }
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        return (
          customer.name.toLowerCase().includes(searchLower) ||
          customer.email.toLowerCase().includes(searchLower) ||
          customer.company.toLowerCase().includes(searchLower) ||
          customer.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [customers]);

  // Get customer statistics
  const getCustomerStats = useCallback(() => {
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'Active').length,
      leads: customers.filter(c => c.status === 'Lead').length,
      inactive: customers.filter(c => c.status === 'Inactive').length,
      totalRevenue: customers.reduce((sum, c) => sum + c.orderValue, 0),
      averageRevenue: customers.length > 0 ? 
        customers.reduce((sum, c) => sum + c.orderValue, 0) / customers.length : 0
    };
  }, [customers]);

  // Load customers from database
  const loadCustomersFromDatabase = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/database/customers');
      const result = await response.json();
      
      if (result.success) {
        setCustomers(result.data);
        return { success: true, customers: result.data };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('Error loading customers from database:', error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    customers,
    setCustomers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    findCustomerById,
    findCustomerByEmail,
    filterCustomers,
    getCustomerStats,
    loadCustomersFromDatabase
  };
};