import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import SearchFilter from './SearchFilter';
import BrotherCard from './BrotherCard';
import BrotherProfile from './BrotherProfile';
import AddBrotherForm from './AddBrotherForm';
import { useBrothers } from '../../contexts/BrothersContext';
import { useBrothers as useBrothersHook } from '../../hooks/useBrothers';

const BrotherhoodDirectory = () => {
  const { brothers, loading } = useBrothers();
  const { addNewBrother, updateBrotherInfo } = useBrothersHook();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedBrother, setSelectedBrother] = useState(null);

  const filteredBrothers = brothers.filter(brother => {
    const matchesSearch = brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         brother.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (statusFilter === 'all') return matchesSearch;
    
    // Add status filtering logic based on last contact
    const daysAgo = brother.lastContact ? 
      Math.floor((new Date() - new Date(brother.lastContact.seconds * 1000)) / (1000 * 60 * 60 * 24)) : 999;
    
    switch (statusFilter) {
      case 'urgent':
        return matchesSearch && daysAgo > 30;
      case 'needs_contact':
        return matchesSearch && daysAgo > 21 && daysAgo <= 30;
      case 'recent':
        return matchesSearch && daysAgo <= 7;
      default:
        return matchesSearch;
    }
  });

  const handleAddBrother = async (brotherData) => {
    return await addNewBrother(brotherData);
  };

  const handleUpdateBrother = async (updatedBrother) => {
    await updateBrotherInfo(updatedBrother.id, updatedBrother);
    setSelectedBrother(updatedBrother);
  };

  if (loading) {
    return <div className="text-center py-8">Loading brothers...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Brotherhood Directory</h2>
        <button 
          onClick={() => setShowAddForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <SearchFilter
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
      />
      
      <div className="text-sm text-gray-600 mb-4">
        {filteredBrothers.length} of {brothers.length} brothers
      </div>
      
      <div className="space-y-3">
        {filteredBrothers.map(brother => (
          <BrotherCard 
            key={brother.id} 
            brother={brother} 
            onClick={() => setSelectedBrother(brother)}
          />
        ))}
        
        {filteredBrothers.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p>No brothers found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Add Brother Form Modal */}
      {showAddForm && (
        <AddBrotherForm
          onClose={() => setShowAddForm(false)}
          onSave={handleAddBrother}
        />
      )}

      {/* Brother Profile Modal */}
      {selectedBrother && (
        <BrotherProfile
          brother={selectedBrother}
          onClose={() => setSelectedBrother(null)}
          onUpdate={handleUpdateBrother}
        />
      )}
    </div>
  );
};

export default BrotherhoodDirectory;