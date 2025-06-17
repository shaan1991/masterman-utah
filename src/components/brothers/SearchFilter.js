// ===== src/components/brothers/SearchFilter.js =====
import React from 'react';
import { Search, Filter } from 'lucide-react';

const SearchFilter = ({ 
  searchTerm, 
  onSearchChange, 
  statusFilter, 
  onStatusChange 
}) => {
  const filterOptions = [
    { value: 'all', label: 'All' },
    { value: 'urgent', label: 'Urgent' },
    { value: 'needs_contact', label: 'Due' },
    { value: 'recent', label: 'Recent' }
  ];

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border">
      <div className="flex space-x-2 mb-4">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search brothers..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <button className="p-2 border border-gray-300 rounded-md hover:bg-gray-50">
          <Filter className="w-4 h-4 text-gray-600" />
        </button>
      </div>
      
      <div className="flex space-x-2">
        {filterOptions.map(option => (
          <button
            key={option.value}
            onClick={() => onStatusChange(option.value)}
            className={`px-3 py-1 text-xs rounded-full border transition-colors ${
              statusFilter === option.value 
                ? 'bg-green-100 text-green-700 border-green-300'
                : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
