// src/components/common/Header.js
import React from 'react';
import { Search, X } from 'lucide-react';

const Header = ({ 
  activeModule, 
  searchQuery, 
  setSearchQuery, 
  customers, 
  tasks, 
  emails 
}) => {
  const getModuleTitle = () => {
    switch (activeModule) {
      case 'dashboard':
        return 'Dashboard';
      case 'compose':
        return 'Compose Email';
      case 'email-setup':
        return 'Email Setup';
      case 'imap-debug':
        return 'IMAP Debugging';
      default:
        return activeModule.charAt(0).toUpperCase() + activeModule.slice(1);
    }
  };

  const getModuleCount = () => {
    if (activeModule === 'customers') return `${customers.length} total`;
    if (activeModule === 'tasks') return `${tasks.length} total`;
    if (activeModule === 'emails') return `${emails.length} total`;
    return null;
  };

  const shouldShowCount = () => {
    return !['dashboard', 'compose', 'email-setup', 'imap-debug'].includes(activeModule);
  };

  const handleSearchClear = () => {
    setSearchQuery('');
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <header className="bg-white shadow-sm border-b px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side - Title and Count */}
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-semibold text-gray-800">
            {getModuleTitle()}
          </h2>
          {shouldShowCount() && (
            <span className="text-sm text-gray-500">
              {getModuleCount()}
            </span>
          )}
        </div>
        
        {/* Right Side - Global Search */}
        <div className="relative">
          <Search 
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
            size={20} 
          />
          <input
            type="text"
            placeholder="Search everything..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleSearchClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;