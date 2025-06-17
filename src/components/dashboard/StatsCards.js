// ===== src/components/dashboard/StatsCards.js =====
import React from 'react';
import { Users, MessageCircle, Calendar, TrendingUp } from 'lucide-react';
import { getDaysAgo } from '../../utils/dateHelpers';

const StatsCards = ({ brothers = [] }) => {
  const thisMonth = brothers.filter(b => 
    b.lastContact && getDaysAgo(b.lastContact) <= 30
  ).length;
  
  const thisWeek = brothers.filter(b => 
    b.lastContact && getDaysAgo(b.lastContact) <= 7
  ).length;

  const needsContact = brothers.filter(b => 
    !b.lastContact || getDaysAgo(b.lastContact) > 21
  ).length;

  const stats = [
    {
      label: 'Total Brothers',
      value: brothers.length,
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'This Month',
      value: thisMonth,
      icon: MessageCircle,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'This Week',
      value: thisWeek,
      icon: Calendar,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Need Contact',
      value: needsContact,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div key={index} className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
              <div className={`p-2 rounded-full ${stat.bgColor}`}>
                <Icon className={`w-5 h-5 ${stat.color}`} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;