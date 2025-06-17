// ===== src/components/common/Navigation.js =====
import React from 'react';
import { 
  Home, 
  Users, 
  Heart, 
  Target, 
  MessageSquare, 
  BarChart3, 
  Settings 
} from 'lucide-react';

const Navigation = ({ currentPage, onPageChange }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'brothers', icon: Users, label: 'Brothers' },
    { id: 'dua', icon: Heart, label: 'Dua' },
    { id: 'goals', icon: Target, label: 'Goals' },
    { id: 'announcements', icon: MessageSquare, label: 'Updates' },
    { id: 'analytics', icon: BarChart3, label: 'Insights' },
    { id: 'settings', icon: Settings, label: 'Settings' }
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t border-gray-200">
      <div className="flex justify-around py-2">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors ${
                isActive 
                  ? 'text-green-600 bg-green-50' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs mt-1">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default Navigation;