// ===== src/components/analytics/ConnectionInsights.js =====
import React, { useState, useEffect } from 'react';
import { Clock, TrendingUp, Calendar, Users, MessageSquare } from 'lucide-react';
import { getDaysAgo } from '../../utils/dateHelpers';
import { useAuth } from '../../contexts/AuthContext';
import { getInteractions } from '../../services/firestore';

const ConnectionInsights = ({ brothers, timeRange }) => {
  const { user } = useAuth();
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && brothers.length > 0) {
      generateInsights();
    } else {
      setLoading(false);
    }
  }, [user, brothers, timeRange]);

  const generateInsights = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get all interactions for analysis
      const allInteractions = [];
      
      for (const brother of brothers) {
        const result = await getInteractions(user.uid, brother.id);
        if (!result.error && result.data) {
          allInteractions.push(...result.data.map(interaction => ({
            ...interaction,
            brotherName: brother.name
          })));
        }
      }

      const contactFrequency = generateContactFrequency(brothers);
      const weeklyPattern = generateWeeklyPattern(allInteractions);
      const monthlyTrend = generateMonthlyTrend(allInteractions);
      const methodAnalysis = generateMethodAnalysis(allInteractions);

      setInsights({
        contactFrequency: contactFrequency.slice(0, 5),
        weeklyPattern,
        monthlyTrend,
        methodAnalysis,
        bestContactDay: getBestContactDay(weeklyPattern),
        improvementSuggestion: getImprovementSuggestion(contactFrequency),
        totalInteractions: allInteractions.length
      });
    } catch (err) {
      setError('Failed to generate insights');
    } finally {
      setLoading(false);
    }
  };

  const generateContactFrequency = (brothers) => {
    return brothers.map(brother => ({
      id: brother.id,
      name: brother.name,
      daysSinceContact: brother.lastContact ? getDaysAgo(brother.lastContact) : 999,
      lastContact: brother.lastContact,
      lastContactMethod: brother.lastContactMethod
    })).sort((a, b) => b.daysSinceContact - a.daysSinceContact);
  };

  const generateWeeklyPattern = (interactions) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const pattern = days.map(day => ({ day, contacts: 0 }));

    interactions.forEach(interaction => {
      const date = interaction.timestamp?.seconds 
        ? new Date(interaction.timestamp.seconds * 1000)
        : new Date(interaction.timestamp);
      
      if (!isNaN(date.getTime())) {
        const dayIndex = date.getDay();
        pattern[dayIndex].contacts++;
      }
    });

    return pattern;
  };

  const generateMonthlyTrend = (interactions) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = new Date().getFullYear();
    const trend = [];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      trend.push({
        month: months[date.getMonth()],
        year: date.getFullYear(),
        contacts: 0
      });
    }

    interactions.forEach(interaction => {
      const date = interaction.timestamp?.seconds 
        ? new Date(interaction.timestamp.seconds * 1000)
        : new Date(interaction.timestamp);
      
      if (!isNaN(date.getTime())) {
        const monthIndex = trend.findIndex(t => 
          t.month === months[date.getMonth()] && t.year === date.getFullYear()
        );
        if (monthIndex >= 0) {
          trend[monthIndex].contacts++;
        }
      }
    });

    return trend;
  };

  const generateMethodAnalysis = (interactions) => {
    const methods = {};
    
    interactions.forEach(interaction => {
      const method = interaction.method || 'unknown';
      if (!methods[method]) {
        methods[method] = { count: 0, avgRating: 0, totalRating: 0, ratedCount: 0 };
      }
      methods[method].count++;
      
      if (interaction.rating) {
        methods[method].totalRating += interaction.rating;
        methods[method].ratedCount++;
        methods[method].avgRating = methods[method].totalRating / methods[method].ratedCount;
      }
    });

    return Object.entries(methods)
      .map(([method, data]) => ({
        method: method.replace('_', ' '),
        count: data.count,
        avgRating: data.avgRating || 0,
        percentage: interactions.length > 0 ? (data.count / interactions.length * 100) : 0
      }))
      .sort((a, b) => b.count - a.count);
  };

  const getBestContactDay = (pattern) => {
    if (!pattern || pattern.length === 0) return { day: 'N/A', contacts: 0 };
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

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Analyzing connections...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <p className="text-red-600 mb-2">Error generating insights</p>
          <p className="text-gray-500 text-sm">{error}</p>
          <button
            onClick={generateInsights}
            className="mt-3 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!insights || brothers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="text-center py-8">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No brothers added yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Add brothers to see connection insights
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-full">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Brothers</p>
              <p className="text-xl font-semibold text-gray-800">{brothers.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-50 rounded-full">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Interactions</p>
              <p className="text-xl font-semibold text-gray-800">{insights.totalInteractions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-50 rounded-full">
              <TrendingUp className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Best Day</p>
              <p className="text-xl font-semibold text-gray-800">{insights.bestContactDay.day}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Frequency */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <span>Brothers Needing Attention</span>
        </h3>
        
        {insights.contactFrequency.length === 0 ? (
          <p className="text-gray-500 text-center py-4">All brothers contacted recently!</p>
        ) : (
          <div className="space-y-3">
            {insights.contactFrequency.map(brother => (
              <div key={brother.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-800">{brother.name}</p>
                  <p className="text-sm text-gray-500">
                    {brother.daysSinceContact === 999 
                      ? 'Never contacted' 
                      : `${brother.daysSinceContact} days ago`}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    brother.daysSinceContact > 30 
                      ? 'bg-red-100 text-red-800' 
                      : brother.daysSinceContact > 14
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {brother.daysSinceContact > 30 ? 'Overdue' : 
                     brother.daysSinceContact > 14 ? 'Due Soon' : 'Recent'}
                  </div>
                  {brother.lastContactMethod && (
                    <p className="text-xs text-gray-400 mt-1 capitalize">
                      via {brother.lastContactMethod.replace('_', ' ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Weekly Pattern */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <span>Weekly Contact Pattern</span>
        </h3>
        
        <div className="grid grid-cols-7 gap-2">
          {insights.weeklyPattern.map(day => {
            const maxContacts = Math.max(...insights.weeklyPattern.map(d => d.contacts));
            const height = maxContacts > 0 ? (day.contacts / maxContacts) * 100 : 0;
            
            return (
              <div key={day.day} className="text-center">
                <div className="h-20 flex items-end justify-center mb-2">
                  <div 
                    className="w-8 bg-blue-500 rounded-t"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">{day.day}</p>
                <p className="text-xs font-medium text-gray-800">{day.contacts}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Method Analysis */}
      {insights.methodAnalysis.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Methods</h3>
          
          <div className="space-y-3">
            {insights.methodAnalysis.map(method => (
              <div key={method.method} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="capitalize font-medium text-gray-800">{method.method}</span>
                  <span className="text-sm text-gray-500">({method.count} times)</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-24 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full"
                      style={{ width: `${method.percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-600">{method.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Improvement Suggestion */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">📈 Suggestion</h3>
        <p className="text-gray-700">{insights.improvementSuggestion}</p>
      </div>
    </div>
  );
};

export default ConnectionInsights;