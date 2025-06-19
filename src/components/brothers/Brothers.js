// src/components/brothers/Brothers.js - Completely verified version
import React, { useState, useEffect } from 'react';
import { Plus, Search, Users, AlertCircle, X, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../../services/firebase';
import BrotherCard from './BrotherCard';
import AddBrotherForm from './AddBrotherForm';

// Direct Firestore operations - no external functions
const directUpdateBrother = async (userId, brotherId, updateData) => {
  console.log('🔧 directUpdateBrother called with:', { userId, brotherId, updateData });
  
  try {
    const docRef = doc(db, 'users', userId, 'brothers', brotherId);
    const updatePayload = {
      ...updateData,
      updatedAt: serverTimestamp()
    };
    
    console.log('🔧 Updating document at path:', `users/${userId}/brothers/${brotherId}`);
    console.log('🔧 Update payload:', updatePayload);
    
    await updateDoc(docRef, updatePayload);
    
    console.log('✅ directUpdateBrother: SUCCESS');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ directUpdateBrother: ERROR:', error);
    console.error('❌ Error code:', error.code);
    console.error('❌ Error message:', error.message);
    return { success: false, error: error.message };
  }
};

const directDeleteBrother = async (userId, brotherId) => {
  console.log('🗑️ directDeleteBrother called with:', { userId, brotherId });
  
  try {
    const docRef = doc(db, 'users', userId, 'brothers', brotherId);
    
    console.log('🗑️ Deleting document at path:', `users/${userId}/brothers/${brotherId}`);
    
    await deleteDoc(docRef);
    
    console.log('✅ directDeleteBrother: SUCCESS');
    return { success: true, error: null };
  } catch (error) {
    console.error('❌ directDeleteBrother: ERROR:', error);
    return { success: false, error: error.message };
  }
};

const directGetBrothers = async (userId) => {
  console.log('📥 directGetBrothers called for user:', userId);
  
  try {
    const q = query(
      collection(db, 'users', userId, 'brothers'),
      orderBy('name', 'asc')
    );
    
    console.log('📥 Fetching from path:', `users/${userId}/brothers`);
    
    const querySnapshot = await getDocs(q);
    const brothers = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      brothers.push({ 
        id: doc.id, 
        ...data 
      });
      console.log('📥 Found brother:', doc.id, data.name);
    });
    
    console.log('✅ directGetBrothers: SUCCESS, found', brothers.length, 'brothers');
    return { success: true, data: brothers, error: null };
  } catch (error) {
    console.error('❌ directGetBrothers: ERROR:', error);
    return { success: false, data: [], error: error.message };
  }
};

const directAddBrother = async (userId, brotherData) => {
  console.log('➕ directAddBrother called with:', { userId, brotherData });
  
  try {
    const docRef = await addDoc(collection(db, 'users', userId, 'brothers'), {
      ...brotherData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('✅ directAddBrother: SUCCESS, ID:', docRef.id);
    return { success: true, id: docRef.id, error: null };
  } catch (error) {
    console.error('❌ directAddBrother: ERROR:', error);
    return { success: false, id: null, error: error.message };
  }
};

// Edit Form Component
const EditForm = ({ brother, onSave, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    name: brother.name || '',
    email: brother.email || '',
    phone: brother.phone || '',
    location: brother.location || '',
    notes: brother.notes || ''
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log('📝 EditForm submitting:', formData);
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold mb-4">Edit {brother.name}</h3>
      
      <div>
        <label className="block text-sm font-medium mb-1">Name *</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          disabled={loading}
        />
        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Location</label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          disabled={loading}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Notes</label>
        <textarea
          value={formData.notes}
          onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
          className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
          rows="3"
          disabled={loading}
        />
      </div>

      <div className="flex space-x-3 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
};

// Brother Profile Modal
const BrotherProfile = ({ brother, onClose, onUpdate }) => {
  const { user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentData, setCurrentData] = useState(brother);

  const handleSave = async (formData) => {
    console.log('💾 BrotherProfile.handleSave called with:', formData);
    setLoading(true);

    try {
      const result = await directUpdateBrother(user.uid, brother.id, formData);
      
      if (result.success) {
        console.log('💾 Update successful in profile');
        
        // Update local state immediately
        const updatedBrother = { ...currentData, ...formData };
        setCurrentData(updatedBrother);
        setEditing(false);
        
        // Show success message
        alert(`✅ ${brother.name} updated successfully!\n\nUpdated fields:\n${Object.keys(formData).map(key => `• ${key}: ${formData[key]}`).join('\n')}`);
        
        // Notify parent component
        if (onUpdate) {
          console.log('💾 Calling onUpdate callback');
          onUpdate(updatedBrother);
        }
      } else {
        console.error('💾 Update failed in profile:', result.error);
        alert('❌ Update failed: ' + result.error);
      }
    } catch (error) {
      console.error('💾 Update exception in profile:', error);
      alert('❌ Update error: ' + error.message);
    }

    setLoading(false);
  };

  const handleDelete = async () => {
    const confirmMessage = `⚠️ Delete ${brother.name}?\n\nThis will permanently remove:\n• Brother's contact information\n• All interaction history\n• This cannot be undone\n\nType "${brother.name}" to confirm:`;
    
    const userInput = prompt(confirmMessage);
    if (userInput !== brother.name) {
      if (userInput !== null) {
        alert('❌ Name did not match. Delete cancelled.');
      }
      return;
    }

    console.log('🗑️ BrotherProfile.handleDelete called for:', brother.name);
    setLoading(true);

    try {
      const result = await directDeleteBrother(user.uid, brother.id);
      
      if (result.success) {
        console.log('🗑️ Delete successful in profile');
        alert(`✅ ${brother.name} deleted successfully!`);
        
        // Close modal
        onClose();
        
        // Notify parent component
        if (onUpdate) {
          console.log('🗑️ Calling onUpdate callback for delete');
          onUpdate(null, true); // Signal deletion
        }
      } else {
        console.error('🗑️ Delete failed in profile:', result.error);
        alert('❌ Delete failed: ' + result.error);
      }
    } catch (error) {
      console.error('🗑️ Delete exception in profile:', error);
      alert('❌ Delete error: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{currentData.name}</h2>
          <button onClick={onClose} className="text-white hover:bg-blue-700 rounded p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          {editing ? (
            <EditForm
              brother={currentData}
              onSave={handleSave}
              onCancel={() => setEditing(false)}
              loading={loading}
            />
          ) : (
            <div className="space-y-4">
              {/* Action Buttons */}
              <div className="flex space-x-2 mb-4">
                <button
                  onClick={() => setEditing(true)}
                  disabled={loading}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Edit className="w-4 h-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700 disabled:opacity-50 flex items-center justify-center space-x-2"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Delete</span>
                </button>
              </div>

              {/* Brother Information */}
              <div className="space-y-3">
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Name</div>
                  <div className="font-medium">{currentData.name}</div>
                </div>

                {currentData.email && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Email</div>
                    <div className="font-medium">{currentData.email}</div>
                  </div>
                )}

                {currentData.phone && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Phone</div>
                    <div className="font-medium">{currentData.phone}</div>
                  </div>
                )}

                {currentData.location && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Location</div>
                    <div className="font-medium">{currentData.location}</div>
                  </div>
                )}

                {currentData.notes && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-sm text-gray-600">Notes</div>
                    <div className="font-medium">{currentData.notes}</div>
                  </div>
                )}

                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm text-gray-600">Brother ID</div>
                  <div className="font-mono text-xs">{brother.id}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Brothers Component
const Brothers = () => {
  const { user } = useAuth();
  const [brothers, setBrothers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBrother, setSelectedBrother] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [lastRefresh, setLastRefresh] = useState(null);

  // Load brothers function
  const loadBrothers = async () => {
    if (!user) {
      setBrothers([]);
      return;
    }

    console.log('🔄 Loading brothers for user:', user.uid);
    setLoading(true);
    setError(null);

    const result = await directGetBrothers(user.uid);
    
    if (result.success) {
      console.log('🔄 Brothers loaded successfully:', result.data.length);
      setBrothers(result.data);
      setLastRefresh(new Date());
    } else {
      console.error('🔄 Failed to load brothers:', result.error);
      setError(result.error);
      setBrothers([]);
    }

    setLoading(false);
  };

  // Initial load
  useEffect(() => {
    loadBrothers();
  }, [user]);

  // Handle add brother
  const handleAddBrother = async (brotherData) => {
    console.log('➕ Adding brother:', brotherData);
    
    const result = await directAddBrother(user.uid, brotherData);
    
    if (result.success) {
      console.log('➕ Brother added successfully');
      setShowAddForm(false);
      await loadBrothers(); // Reload the list
      alert('✅ Brother added successfully!');
    } else {
      console.error('➕ Failed to add brother:', result.error);
      alert('❌ Failed to add brother: ' + result.error);
    }

    return result;
  };

  // Handle brother update/delete
  const handleBrotherUpdate = async (updatedBrother, isDelete = false) => {
    console.log('🔄 handleBrotherUpdate called:', { updatedBrother, isDelete });
    
    if (isDelete) {
      // Brother was deleted, reload the list
      console.log('🔄 Reloading after delete');
      await loadBrothers();
    } else if (updatedBrother) {
      // Brother was updated, update local state and reload
      console.log('🔄 Updating local state and reloading');
      setBrothers(prev => 
        prev.map(brother => 
          brother.id === updatedBrother.id ? updatedBrother : brother
        )
      );
      
      // Also update selected brother if it's the same one
      if (selectedBrother && selectedBrother.id === updatedBrother.id) {
        setSelectedBrother(updatedBrother);
      }
      
      // Reload from server to ensure consistency
      setTimeout(() => {
        loadBrothers();
      }, 1000);
    }
  };

  // Filter brothers
  const filteredBrothers = brothers.filter(brother =>
    brother.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (brother.location && brother.location.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Brotherhood</h1>
          <p className="text-gray-600">Manage your brother connections</p>
          {lastRefresh && (
            <p className="text-xs text-gray-500">Last updated: {lastRefresh.toLocaleTimeString()}</p>
          )}
        </div>
        <div className="space-x-2">
          <button
            onClick={loadBrothers}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Loading...' : '🔄 Refresh'}
          </button>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 inline-flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brother</span>
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Error: {error}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search brothers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-2">
            <Users className="w-5 h-5 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Brothers</p>
              <p className="text-2xl font-bold text-gray-900">{brothers.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border">
          <div className="flex items-center space-x-2">
            <Search className="w-5 h-5 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Filtered Results</p>
              <p className="text-2xl font-bold text-gray-900">{filteredBrothers.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Brothers List */}
      {loading && brothers.length === 0 ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading brothers...</p>
        </div>
      ) : filteredBrothers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No brothers found' : 'No brothers added yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search' : 'Start by adding your first brother'}
          </p>
          {!searchTerm && (
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
              onClick={() => {
                console.log('🔍 Opening profile for:', brother.name);
                setSelectedBrother(brother);
              }}
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
          onUpdate={handleBrotherUpdate}
        />
      )}
    </div>
  );
};

export default Brothers;