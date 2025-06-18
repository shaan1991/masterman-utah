// ===== src/components/common/Header.js =====
import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthActions } from '../../hooks/useAuth';

const Header = () => {
  const { user } = useAuth();
  const { signOut } = useAuthActions();

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
          <button className="p-2 text-gray-600 hover:text-gray-800">
            <Search className="w-5 h-5" />
          </button>
          <button className="p-2 text-gray-600 hover:text-gray-800 relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-xs"></span>
          </button>
          <button
            onClick={signOut}
            className="text-xs text-gray-500 hover:text-gray-700"
          >
            Sign Out
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;