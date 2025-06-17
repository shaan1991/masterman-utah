// ===== src/components/analytics/ConnectionInsights.js =====
import React from 'react';
import { Clock, TrendingUp, Calendar } from 'lucide-react';
import { getDaysAgo } from '../../utils/dateHelpers';

const ConnectionInsights = ({ brothers, timeRange }) => {
  const generateInsights = () => {
    const contactFrequency = brothers.map(brother => ({
      name: brother.name,
      daysSinceContact: getDaysAgo(brother.lastContact),
      lastContact: brother.lastContact
    })).sort((a, b) => b.daysSinceContact - a.daysSinceContact);

    const weeklyPattern = generateWeeklyPattern(brothers);
    const monthlyTrend = generateMonthlyTrend(brothers);

    return {
      contactFrequency: contactFrequency.slice(0, 5),
      weeklyPattern,
      monthlyTrend,
      bestContactDay: getBestContactDay(weeklyPattern),
      improvementSuggestion: getImprovementSuggestion(contactFrequency)
    };
  };

  const generateWeeklyPattern = (brothers) => {
    // Mock weekly pattern data
    return [
      { day: 'Mon', contacts: 3 },
      { day: 'Tue', contacts: 2 },
      { day: 'Wed', contacts: 5 },
      { day: 'Thu', contacts: 4 },
      { day: 'Fri', contacts: 8 },
      { day: 'Sat', contacts: 6 },
      { day: 'Sun', contacts: 7 }
    ];
  };

  const generateMonthlyTrend = (brothers) => {
    // Mock monthly trend data
    return [
      { month: 'Mar', contacts: 28 },
      { month: 'Apr', contacts: 32 },
      { month: 'May', contacts: 29 },
      { month: 'Jun', contacts: 35 }
    ];
  };

  const getBestContactDay = (pattern) => {
    return pattern.reduce((best, day) => 
      day.contacts > best.contacts ? day : best
    );
  };

  const getImprovementSuggestion = (frequency) => {
    const overdue = frequency.filter(f => f.daysSinceContact > 30);
    if (overdue.length > 5) {
      return "Consider setting weekly reminders to contact brothers more regularly";
    } else if (overdue.length > 0) {
      return "Great consistency! Focus on the few brothers who need attention";
    }
    return "Excellent work maintaining regular contact with all brothers!";
  };

  const insights = generateInsights();

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <h3 className="font-semibold text-gray-800">Connection Patterns</h3>
      </div>
      
      <div className="p-4 space-y-6">
        {/* Most Overdue Contacts */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Brothers Needing Attention
          </h4>
          <div className="space-y-2">
            {insights.contactFrequency.slice(0, 3).map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-800">{contact.name}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  contact.daysSinceContact > 30 
                    ? 'bg-red-100 text-red-700' 
                    : contact.daysSinceContact > 21
                    ? 'bg-yellow-100 text-yellow-700'
                    : 'bg-green-100 text-green-700'
                }`}>
                  {contact.daysSinceContact} days ago
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Contact Pattern */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Calendar className="w-4 h-4 mr-2" />
            Weekly Contact Pattern
          </h4>
          <div className="space-y-2">
            {insights.weeklyPattern.map((day, index) => {
              const maxContacts = Math.max(...insights.weeklyPattern.map(d => d.contacts));
              const percentage = (day.contacts / maxContacts) * 100;
              
              return (
                <div key={index} className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600 w-8">{day.day}</span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600 w-6">{day.contacts}</span>
                </div>
              );
            })}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Your most active day: {insights.bestContactDay.day} ({insights.bestContactDay.contacts} contacts)
          </p>
        </div>

        {/* Improvement Suggestion */}
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-800">Insight</p>
              <p className="text-xs text-blue-700 mt-1">
                {insights.improvementSuggestion}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConnectionInsights;