// ===== src/components/goals/StravaIntegration.js =====
import React, { useState, useEffect } from 'react';
import { ExternalLink, Users, Activity, Trophy } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

const StravaIntegration = () => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [stravaData, setStravaData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      checkStravaConnection();
    }
  }, [user]);

  const checkStravaConnection = async () => {
    try {
      // Check if user has connected Strava account
      // This would typically check Firestore for stored Strava credentials
      const savedConnection = localStorage.getItem(`strava_connected_${user.uid}`);
      setIsConnected(!!savedConnection);
      
      if (savedConnection) {
        loadStravaData();
      }
    } catch (err) {
      setError('Failed to check Strava connection');
    }
  };

  const loadStravaData = async () => {
    setLoading(true);
    try {
      // In production, this would fetch real data from your backend
      // which would interface with Strava API
      
      // For now, show that integration is connected but no data
      setStravaData({
        groupName: 'Brotherhood Fitness',
        members: 0,
        activeThisWeek: 0,
        totalActivities: 0,
        recentActivities: []
      });
    } catch (err) {
      setError('Failed to load Strava data');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      // In production, this would redirect to Strava OAuth
      // For now, simulate connection
      localStorage.setItem(`strava_connected_${user.uid}`, 'true');
      setIsConnected(true);
      await loadStravaData();
    } catch (err) {
      setError('Failed to connect to Strava');
    }
  };

  const handleDisconnect = () => {
    localStorage.removeItem(`strava_connected_${user.uid}`);
    setIsConnected(false);
    setStravaData(null);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-500" />
            <h3 className="font-semibold text-gray-800">Fitness Integration</h3>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-500 rounded-sm flex items-center justify-center">
              <span className="text-white text-xs font-bold">S</span>
            </div>
            <span className="text-sm text-gray-600">Strava</span>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="p-4 bg-red-50 border-b border-red-200">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isConnected ? (
        <div className="p-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
              <span className="ml-2 text-gray-600">Loading fitness data...</span>
            </div>
          ) : stravaData ? (
            <div className="space-y-4">
              {/* Group Stats */}
              <div className="bg-orange-50 rounded-lg p-3">
                <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                  <Users className="w-4 h-4 mr-2 text-orange-600" />
                  {stravaData.groupName}
                </h4>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-lg font-bold text-gray-800">{stravaData.members}</p>
                    <p className="text-xs text-gray-600">Members</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{stravaData.activeThisWeek}</p>
                    <p className="text-xs text-gray-600">Active</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-800">{stravaData.totalActivities}</p>
                    <p className="text-xs text-gray-600">Activities</p>
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              {stravaData.recentActivities.length > 0 ? (
                <div>
                  <h5 className="font-medium text-gray-800 mb-2">Recent Activities</h5>
                  <div className="space-y-2">
                    {stravaData.recentActivities.map((activity, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">{activity.member}</span>
                        <div className="text-right">
                          <p className="font-medium text-gray-800">{activity.activity}</p>
                          <p className="text-gray-500">{activity.distance}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent activities</p>
                  <p className="text-gray-400 text-xs">Share your workouts to motivate the brotherhood!</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex space-x-2 pt-2">
                <button
                  onClick={() => window.open('https://strava.com', '_blank')}
                  className="flex-1 flex items-center justify-center space-x-2 py-2 px-3 bg-orange-500 text-white rounded-md hover:bg-orange-600 text-sm"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Open Strava</span>
                </button>
                <button
                  onClick={handleDisconnect}
                  className="py-2 px-3 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-sm"
                >
                  Disconnect
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <div className="p-4">
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-6 h-6 text-orange-600" />
            </div>
            <h4 className="font-medium text-gray-800 mb-2">Connect with Brotherhood Fitness</h4>
            <p className="text-sm text-gray-600 mb-4">
              Track workouts together and motivate each other on your fitness journey
            </p>
            <button
              onClick={handleConnect}
              className="bg-orange-500 text-white py-2 px-4 rounded-md hover:bg-orange-600 flex items-center space-x-2 mx-auto"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Connect Strava</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StravaIntegration;