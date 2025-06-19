// ===== src/components/settings/ContactPreloadSection.js =====
import React, { useState } from 'react';
import { Users, Download, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { preloadContacts } from '../../data/contacts';

const ContactPreloadSection = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // 'success', 'error', null
  const [progress, setProgress] = useState(0);
  const [processedCount, setProcessedCount] = useState(0);

  const addContacts = async () => {
    if (!user) return;

    setLoading(true);
    setStatus(null);
    setProgress(0);
    setProcessedCount(0);

    try {
      console.log('Starting to add contacts for user:', user.uid);
      
      let successCount = 0;
      let errorCount = 0;

      for (let i = 0; i < preloadContacts.length; i++) {
        const contact = preloadContacts[i];
        
        try {
          // Use the same structure as your existing addBrother function
          const brotherData = {
            name: contact.name,
            phone: contact.phone,
            email: contact.email,
            location: contact.location,
            bio: contact.bio,
            notes: contact.notes,
            lastContact: null,
            lastContactMethod: null,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          await addDoc(collection(db, 'users', user.uid, 'brothers'), brotherData);
          successCount++;
          console.log(`✅ Added: ${contact.name}`);
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Failed to add ${contact.name}:`, error);
        }

        // Update progress
        const newProgress = Math.round(((i + 1) / preloadContacts.length) * 100);
        setProgress(newProgress);
        setProcessedCount(i + 1);

        // Small delay to avoid overwhelming Firestore and show progress
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`✅ Completed! Success: ${successCount}, Errors: ${errorCount}`);
      setStatus('success');
      
    } catch (error) {
      console.error('❌ Critical error:', error);
      setStatus('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-gray-600" />
          <h3 className="font-semibold text-gray-800">Community Contacts</h3>
        </div>
      </div>
      
      <div className="p-4">
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-2">
              Preload Brotherhood Contacts
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Add {preloadContacts.length} community brother contacts to your directory. 
              These are real community members you can connect with.
            </p>
          </div>

          {/* Progress Display */}
          {loading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Adding contacts...</span>
                <span>{processedCount} of {preloadContacts.length}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Status Messages */}
          {status === 'success' && (
            <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-green-800 font-medium text-sm">
                  Contacts Added Successfully!
                </p>
                <p className="text-green-700 text-xs mt-1">
                  All {preloadContacts.length} community contacts have been added to your directory.
                </p>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
              <div>
                <p className="text-red-800 font-medium text-sm">
                  Error Adding Contacts
                </p>
                <p className="text-red-700 text-xs mt-1">
                  There was an issue adding the contacts. Please try again.
                </p>
              </div>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={addContacts}
            disabled={loading || status === 'success'}
            className={`w-full flex items-center justify-center px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              status === 'success'
                ? 'bg-green-100 text-green-800 cursor-not-allowed'
                : loading
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                Adding Contacts...
              </>
            ) : status === 'success' ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Contacts Added
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Add {preloadContacts.length} Contacts
              </>
            )}
          </button>

          <div className="text-xs text-gray-500">
            <p>This will add community contacts to your Brothers directory.</p>
            <p className="mt-1">You can remove individual contacts later if needed.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPreloadSection;
