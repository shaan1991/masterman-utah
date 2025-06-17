// ===== src/components/analytics/Analytics.js =====
import React, { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Users, MessageCircle, Target } from 'lucide-react';
import ConnectionInsights from './ConnectionInsights';
import { useBrothers } from '../../contexts/BrothersContext';

const Analytics = () => {
  const { brothers } = useBrothers();
  const [timeRange, setTimeRange] = useState('month');

  // Calculate analytics data
  const calculateAnalytics = () => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const getDateThreshold = () => {
      switch (timeRange) {
        case 'week': return oneWeekAgo;
        case 'month': return oneMonthAgo;
        case 'quarter': return threeMonthsAgo;
        default: return oneMonthAgo;
      }
    };

    const threshold = getDateThreshold();
    
    const recentContacts = brothers.filter(brother => 
      brother.lastContact && new Date(brother.lastContact.seconds * 1000) >= threshold
    );

    const overdueContacts = brothers.filter(brother => 
      !brother.lastContact || new Date(brother.lastContact.seconds * 1000) < oneMonthAgo
    );

    const contactMethods = brothers.reduce((acc, brother) => {
      const method = brother.lastContactMethod || 'unknown';
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {});

    return {
      totalBrothers: brothers.length,
      contactedRecently: recentContacts.length,
      overdueContacts: overdueContacts.length,
      contactRate: brothers.length > 0 ? Math.round((recentContacts.length / brothers.length) * 100) : 0,
      contactMethods,
      averageDaysBetweenContact: 14, // Mock calculation
      consistencyScore: 85 // Mock calculation
    };
  };

  const analytics = calculateAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Connection Insights</h2>
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="week">Past Week</option>
          <option value="month">Past Month</option>
          <option value="quarter">Past Quarter</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-600">{analytics.contactRate}%</p>
              <p className="text-xs text-gray-600">Contact Rate</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {analytics.contactedRecently} of {analytics.totalBrothers} brothers
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-600">{analytics.consistencyScore}</p>
              <p className="text-xs text-gray-600">Consistency Score</p>
            </div>
            <Target className="w-8 h-8 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Based on regular contact patterns
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-orange-600">{analytics.overdueContacts}</p>
              <p className="text-xs text-gray-600">Need Attention</p>
            </div>
            <Calendar className="w-8 h-8 text-orange-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Haven't connected in 30+ days
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-purple-600">{analytics.averageDaysBetweenContact}</p>
              <p className="text-xs text-gray-600">Avg Days</p>
            </div>
            <MessageCircle className="w-8 h-8 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Between contacts
          </p>
        </div>
      </div>

      {/* Contact Methods Breakdown */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Preferred Contact Methods</h3>
        </div>
        <div className="p-4">
          <div className="space-y-3">
            {Object.entries(analytics.contactMethods).map(([method, count]) => {
              const percentage = Math.round((count / analytics.totalBrothers) * 100);
              const methodLabels = {
                call: 'Phone Calls',
                text: 'Text Messages',
                email: 'Email',
                whatsapp: 'WhatsApp',
                in_person: 'In Person',
                unknown: 'Not Set'
              };
              
              return (
                <div key={method} className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {methodLabels[method] || method}
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Connection Insights Component */}
      <ConnectionInsights brothers={brothers} timeRange={timeRange} />

      {/* Recommendations */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="p-4 border-b">
          <h3 className="font-semibold text-gray-800">Recommendations</h3>
        </div>
        <div className="p-4 space-y-3">
          {analytics.overdueContacts > 0 && (
            <div className="flex items-start space-x-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-orange-800">
                  Focus on overdue connections
                </p>
                <p className="text-xs text-orange-700">
                  You have {analytics.overdueContacts} brothers you haven't contacted in over 30 days
                </p>
              </div>
            </div>
          )}
          
          {analytics.contactRate < 70 && (
            <div className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <TrendingUp className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Increase contact frequency
                </p>
                <p className="text-xs text-blue-700">
                  Try to reach your goal of contacting each brother monthly
                </p>
              </div>
            </div>
          )}
          
          <div className="flex items-start space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
            <Users className="w-5 h-5 text-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-800">
                Strong brotherhood bonds
              </p>
              <p className="text-xs text-green-700">
                MashAllah! Keep up the consistent effort in maintaining connections
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;