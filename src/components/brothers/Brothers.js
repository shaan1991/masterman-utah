// src/components/brothers/Brothers.js
import React, { useState } from 'react';
import { Plus, Search, Users, AlertCircle } from 'lucide-react';
import { useBrothers } from '../../hooks/useBrothers';
import BrotherCard from './BrotherCard';
import BrotherProfile from './BrotherProfile';
import AddBrotherForm from './AddBrotherForm';

const Brothers = () => {
  const { 
    brothers, 
    loading, 
    error, 
    addNewBrother, 
    updateBrotherInfo,
    getOverdueBrothers 
  } = useBrothers();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBrother, setSelectedBrother] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const overdueBrothers = getOverdueBrothers();

  const filteredBrothers = brothers.filter(brother => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (brother.location && brother.location.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'overdue') {
      return matchesSearch && overdueBrothers.includes(brother);
    }
    
    return matchesSearch;
  });

  const handleAddBrother = async (brotherData) => {
    const result = await addNewBrother(brotherData);
    if (!result.error) {
      setShowAddForm(false);
    }
    return result;
  };

  const handleBrotherUpdate = async (brotherId, updates) => {
    if (!brotherId) {
      // If called without brotherId, it's a general refresh request
      // The useBrothers hook will automatically update via real-time subscription
      return;
    }
    
    const result = await updateBrotherInfo(brotherId, updates);
    if (result.error) {
      throw new Error(result.error);
    }
    
    // Update the selected brother if it's currently being viewed
    if (selectedBrother && selectedBrother.id === brotherId) {
      setSelectedBrother(prev => ({ ...prev, ...updates }));
    }
    
    return result;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Loading brothers...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brotherhood</h1>
          <p className="text-gray-600">Stay connected with your brothers in faith</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brother</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600" />
          <span className="text-red-700">{error}</span>
        </div>
      )}

      {/* Overdue Alert */}
      {overdueBrothers.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-yellow-800 font-medium">
                {overdueBrothers.length} brother{overdueBrothers.length > 1 ? 's' : ''} need{overdueBrothers.length === 1 ? 's' : ''} your attention
              </p>
              <p className="text-yellow-700 text-sm">
                It's been over 30 days since your last contact
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="flex space-x-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search brothers by name or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Brothers</option>
          <option value="overdue">Need Contact</option>
        </select>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Total Brothers</p>
              <p className="text-xl font-semibold text-gray-900">{brothers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-600" />
            <div>
              <p className="text-sm text-gray-600">Need Contact</p>
              <p className="text-xl font-semibold text-gray-900">{overdueBrothers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Filtered Results</p>
              <p className="text-xl font-semibold text-gray-900">{filteredBrothers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brothers Grid */}
      {filteredBrothers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No brothers found' : 'No brothers added yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Start building your brotherhood by adding your first brother'
            }
          </p>
          {!searchTerm && filterStatus === 'all' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Your First Brother</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBrothers.map(brother => (
            <BrotherCard
              key={brother.id}
              brother={brother}
              onClick={() => setSelectedBrother(brother)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showAddForm && (
        <AddBrotherForm
          onSave={handleAddBrother}
          onClose={() => setShowAddForm(false)}
        />
      )}

      {selectedBrother && (
        <BrotherProfile
          brother={selectedBrother}
          onClose={() => setSelectedBrother(null)}
          onBrotherUpdate={handleBrotherUpdate}
        />
      )}
    </div>
  );
};

export default Brothers;