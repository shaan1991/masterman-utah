// ===== src/components/dua/DuaRequests.js =====
import React, { useState, useEffect } from 'react';
import { Plus, Filter } from 'lucide-react';
import DuaCard from './DuaCard';
import DuaForm from './DuaForm';
import { subscribeToDuaRequests } from '../../services/firestore';

const DuaRequests = () => {
  const [duaRequests, setDuaRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const unsubscribe = subscribeToDuaRequests((snapshot) => {
      const requests = [];
      snapshot.forEach((doc) => {
        requests.push({ id: doc.id, ...doc.data() });
      });
      setDuaRequests(requests);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const filteredDuas = duaRequests.filter(dua => {
    switch (filter) {
      case 'urgent':
        return dua.urgent;
    //   case 'answered':
    //     return dua.answered;
    //   case 'unanswered':
    //     return !dua.answered;
      case 'mine':
        return dua.authorId === 'current-user-id'; // Replace with actual user ID
      default:
        return true;
    }
  });

  const filterOptions = [
    { value: 'all', label: 'All', count: duaRequests.length },
    { value: 'urgent', label: 'Urgent', count: duaRequests.filter(d => d.urgent).length },
   
  ];

  if (loading) {
    return <div className="text-center py-8">Loading dua requests...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Dua Requests</h2>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">Filter:</span>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {filterOptions.map(option => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`px-3 py-1 text-xs rounded-full border flex items-center space-x-1 ${
                filter === option.value 
                  ? 'bg-green-100 text-green-700 border-green-300'
                  : 'bg-gray-50 text-gray-600 border-gray-200'
              }`}
            >
              <span>{option.label}</span>
              <span className="bg-white bg-opacity-70 px-1 rounded">
                {option.count}
              </span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredDuas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No dua requests found</p>
            <p className="text-sm mt-1">Be the first to share a prayer request</p>
          </div>
        ) : (
          filteredDuas.map(dua => (
            <DuaCard key={dua.id} dua={dua} />
          ))
        )}
      </div>

      {showForm && (
        <DuaForm
          onClose={() => setShowForm(false)}
          onSubmit={(duaData) => {
            // Handle dua submission
            setShowForm(false);
          }}
        />
      )}
    </div>
  );
};

export default DuaRequests;