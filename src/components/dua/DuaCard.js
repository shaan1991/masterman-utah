import React, { useState } from 'react';
import { Heart, MessageCircle, Clock, Star, Edit, Trash2, MoreVertical, X, Save } from 'lucide-react';
import { formatDate } from '../../utils/dateHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { updateDoc, doc, arrayUnion, deleteDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';

const DuaCard = ({ dua, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [hasResponded, setHasResponded] = useState(
    (dua.responses || []).includes(user?.uid) || false
  );
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedRequest, setEditedRequest] = useState(dua.request);
  const [editedUrgent, setEditedUrgent] = useState(dua.urgent || false);

  // Security: Check if current user is the creator
  const isCreator = dua.authorId === user?.uid;
  
  // Security: Validate user authentication
  const isAuthenticated = user && user.uid;

  const handleAmeen = async () => {
    if (!isAuthenticated || hasResponded || loading) return;
    
    setLoading(true);
    try {
      const duaRef = doc(db, 'duaRequests', dua.id);
      await updateDoc(duaRef, {
        responses: arrayUnion(user.uid),
        responseCount: (dua.responseCount || 0) + 1
      });
      
      setHasResponded(true);
      
      if (onUpdate) {
        onUpdate({
          ...dua,
          responses: [...(dua.responses || []), user.uid],
          responseCount: (dua.responseCount || 0) + 1
        });
      }
    } catch (error) {
      console.error('Error saying Ameen:', error);
    }
    setLoading(false);
  };

  const handleMarkAnswered = async () => {
    // Security: Only creator can mark as answered
    if (!isAuthenticated || !isCreator) return;
    
    setLoading(true);
    try {
      const duaRef = doc(db, 'duaRequests', dua.id);
      await updateDoc(duaRef, {
        answered: true,
        answeredAt: new Date(),
        answeredNote: 'Alhamdulillah, this prayer has been answered.',
        // Security: Track who marked it answered
        answeredBy: user.uid
      });
      
      if (onUpdate) {
        onUpdate({
          ...dua,
          answered: true,
          answeredAt: new Date(),
          answeredNote: 'Alhamdulillah, this prayer has been answered.',
          answeredBy: user.uid
        });
      }
    } catch (error) {
      console.error('Error marking as answered:', error);
    }
    setLoading(false);
  };

  const handleEdit = async () => {
    // Security: Only creator can edit
    if (!isAuthenticated || !isCreator) return;
    
    // Validation: Check for empty or invalid content
    const trimmedRequest = editedRequest?.trim();
    if (!trimmedRequest || trimmedRequest.length < 10) {
      alert('Dua request must be at least 10 characters long.');
      return;
    }

    // Security: Prevent XSS by sanitizing input
    const sanitizedRequest = trimmedRequest.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    
    if (sanitizedRequest !== trimmedRequest) {
      alert('Invalid content detected. Please remove any script tags.');
      return;
    }

    setLoading(true);
    try {
      const duaRef = doc(db, 'duaRequests', dua.id);
      const updateData = {
        request: sanitizedRequest,
        urgent: editedUrgent,
        // Security: Track edit metadata
        editedAt: new Date(),
        editedBy: user.uid,
        // Increment edit count for audit trail
        editCount: (dua.editCount || 0) + 1
      };

      await updateDoc(duaRef, updateData);
      
      if (onUpdate) {
        onUpdate({
          ...dua,
          ...updateData
        });
      }
      
      setIsEditing(false);
      setShowMenu(false);
    } catch (error) {
      console.error('Error updating dua:', error);
      alert('Failed to update dua. Please try again.');
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    // Security: Only creator can delete
    if (!isAuthenticated || !isCreator) return;
    
    // Security: Prevent accidental deletion
    const confirmMessage = `Are you sure you want to delete this dua request? This action cannot be undone.

Request: "${dua.request.substring(0, 100)}${dua.request.length > 100 ? '...' : ''}"`;
    
    if (!window.confirm(confirmMessage)) return;

    // Security: Additional confirmation for duas with responses
    if (dua.responseCount > 0) {
      const secondConfirm = `This dua has ${dua.responseCount} responses from brothers. Are you absolutely sure you want to delete it?`;
      if (!window.confirm(secondConfirm)) return;
    }

    setLoading(true);
    try {
      await deleteDoc(doc(db, 'duaRequests', dua.id));
      
      if (onDelete) {
        onDelete(dua.id);
      }
    } catch (error) {
      console.error('Error deleting dua:', error);
      alert('Failed to delete dua. Please try again.');
    }
    setLoading(false);
  };

  const cancelEdit = () => {
    setEditedRequest(dua.request);
    setEditedUrgent(dua.urgent || false);
    setIsEditing(false);
    setShowMenu(false);
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border relative">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <span className="text-green-600 font-medium text-xs">
              {dua.authorName?.charAt(0) || 'B'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-800 text-sm">
              {dua.authorName || 'Anonymous Brother'}
            </span>
            <div className="flex items-center space-x-2 mt-1">
              {(isEditing ? editedUrgent : dua.urgent) && (
                <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-medium">
                  Urgent
                </span>
              )}
              {dua.answered && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                  Alhamdulillah ✓
                </span>
              )}
              {dua.editCount > 0 && (
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                  Edited
                </span>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right text-xs text-gray-500">
            <div className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDate(dua.createdAt)}
            </div>
          </div>
          
          {/* Security: Only show menu to creator */}
          {isCreator && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                disabled={loading}
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 top-8 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[120px]">
                  <button
                    onClick={() => {
                      setIsEditing(true);
                      setShowMenu(false);
                    }}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center space-x-2"
                    disabled={loading || dua.answered}
                  >
                    <Edit className="w-3 h-3" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={handleDelete}
                    className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 text-red-600 flex items-center space-x-2"
                    disabled={loading}
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="mb-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={editedRequest}
              onChange={(e) => setEditedRequest(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 text-sm resize-none"
              rows="3"
              placeholder="What do you need prayers for?"
              maxLength={500}
              disabled={loading}
            />
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  checked={editedUrgent}
                  onChange={(e) => setEditedUrgent(e.target.checked)}
                  className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  disabled={loading}
                />
                <span className="text-gray-700">Mark as urgent</span>
              </label>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={handleEdit}
                disabled={loading || !editedRequest.trim()}
                className="px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 disabled:opacity-50 flex items-center space-x-1"
              >
                <Save className="w-3 h-3" />
                <span>{loading ? 'Saving...' : 'Save'}</span>
              </button>
              <button
                onClick={cancelEdit}
                disabled={loading}
                className="px-3 py-1 bg-gray-300 text-gray-700 rounded-md text-sm hover:bg-gray-400 flex items-center space-x-1"
              >
                <X className="w-3 h-3" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm leading-relaxed">
            {dua.request}
          </p>
        )}
      </div>
      
      {!isEditing && (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Heart className="w-3 h-3" />
              <span>{dua.responseCount || 0} responses</span>
            </div>
            
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <MessageCircle className="w-3 h-3" />
              <span>{dua.comments || 0} comments</span>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAmeen}
              disabled={hasResponded || loading || !isAuthenticated}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
                hasResponded
                  ? 'bg-green-100 text-green-700'
                  : isAuthenticated
                  ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              {loading ? 'Saving...' : hasResponded ? 'Ameen ✓' : 'Ameen'}
            </button>
            
            {/* Security: Only creator can mark as answered */}
            
          </div>
        </div>
      )}
      
      {/* Click outside to close menu */}
      {showMenu && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  );
};

export default DuaCard;