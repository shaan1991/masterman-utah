// src/components/brothers/PreloadContactsButton.js
import React, { useState } from 'react';
import { Users, Download, Check, AlertCircle } from 'lucide-react';
import { preloadedContacts, addPreloadedContactsToFirestore } from '../../data/preloadedContacts';
import { useAuth } from '../../contexts/AuthContext';

const PreloadContactsButton = ({ onContactsAdded }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', or null

  const handlePreloadContacts = async () => {
    if (!user) {
      setStatus('error');
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      // This assumes you have an addBrother function available
      // You might need to pass this as a prop or import it from your context
      const mockAddBrother = async (brotherData) => {
        // Simulate API call
        console.log('Adding brother:', brotherData.name);
        await new Promise(resolve => setTimeout(resolve, 50));
      };

      const result = await addPreloadedContactsToFirestore(user, mockAddBrother);
      
      if (result.success) {
        setStatus('success');
        if (onContactsAdded) {
          onContactsAdded(preloadedContacts);
        }
      } else {
        setStatus('error');
      }
    } catch (error) {
      console.error('Error preloading contacts:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
          <Users className="h-6 w-6 text-blue-600" />
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Preload Sample Contacts
        </h3>
        
        <p className="text-sm text-gray-500 mb-6">
          Add 40 sample brother contacts to get started with your brotherhood tracking app. 
          Perfect for testing features and demonstrating functionality.
        </p>

        <div className="space-y-4">
          <button
            onClick={handlePreloadContacts}
            disabled={loading || status === 'success'}
            className={`w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md ${
              status === 'success'
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : loading
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            } transition-colors`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2"></div>
                Adding Contacts...
              </>
            ) : status === 'success' ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Contacts Added Successfully
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Add 40 Sample Contacts
              </>
            )}
          </button>

          {status === 'error' && (
            <div className="flex items-center justify-center text-red-600 text-sm">
              <AlertCircle className="h-4 w-4 mr-2" />
              Failed to add contacts. Please try again.
            </div>
          )}

          {status === 'success' && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-600 mr-2" />
                <p className="text-sm text-green-800">
                  Successfully added 40 brother contacts! You can now test call, text, and interaction logging features.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 text-xs text-gray-400">
          <p>Sample data includes names, phone numbers, emails, locations, and brief bios.</p>
          <p className="mt-1">All phone numbers are test numbers (+1-555-XXXX format).</p>
        </div>
      </div>
    </div>
  );
};

export default PreloadContactsButton;