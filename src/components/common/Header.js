// src/components/common/Header.js
import React, { useState } from 'react';
import { Bell, Search, Settings } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import { useAuthActions } from '../../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

const Header = ({ onNavigate }) => {
  const { user } = useAuth();
  const { signOut } = useAuthActions();
  const { getUnreadCount } = useNotifications();
  const [isNotificationDropdownOpen, setIsNotificationDropdownOpen] = useState(false);
  
  const unreadCount = getUnreadCount();

  const handleNotificationClick = () => {
    setIsNotificationDropdownOpen(!isNotificationDropdownOpen);
  };

  const closeNotificationDropdown = () => {
    setIsNotificationDropdownOpen(false);
  };

  const handleSettingsClick = () => {
    if (onNavigate) {
      onNavigate('settings');
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-800">Masterman - Utah</h1>
          <p className="text-xs text-gray-600">
            Assalamu Alaikum, {user?.displayName?.split(' ')[0] || 'Brother'}
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button className="p-2 text-gray-600 hover:text-gray-800 transition-colors">
            <Search className="w-5 h-5" />
          </button>
          
          {/* Functional Notification Bell */}
          <div className="relative">
            <button 
              onClick={handleNotificationClick}
              className="p-2 text-gray-600 hover:text-gray-800 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </button>
            
            <NotificationDropdown 
              isOpen={isNotificationDropdownOpen}
              onClose={closeNotificationDropdown}
            />
          </div>

          {/* Settings Icon */}
          <button 
            onClick={handleSettingsClick}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
          
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;