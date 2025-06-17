// / ===== src/components/dashboard/Dashboard.js =====
import React from 'react';
import StatsCards from './StatsCards';
import ContactSuggestions from './ContactSuggestions';
import { useBrothers } from '../../contexts/BrothersContext';
import { Heart } from 'lucide-react';

const Dashboard = () => {
  const { brothers, loading } = useBrothers();

  if (loading) {
    return <div className="text-center py-8">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg">
        <h2 className="text-lg font-semibold">Assalamu Alaikum!</h2>
        <p className="text-sm opacity-90">
          May Allah bless your connections today
        </p>
      </div>
      
      <StatsCards brothers={brothers} />
      <ContactSuggestions brothers={brothers} />
      
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center space-x-2 mb-3">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-semibold text-gray-800">Today's Reminder</h3>
        </div>
        <p className="text-sm text-gray-600 italic">
          "The believers in their mutual kindness, compassion, and sympathy are just one body. 
          When a limb suffers, the whole body responds to it with wakefulness and fever."
        </p>
        <p className="text-xs text-gray-500 mt-2">- Prophet Muhammad ﷺ</p>
      </div>
    </div>
  );
};

export default Dashboard;