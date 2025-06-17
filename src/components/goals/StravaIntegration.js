// ===== src/components/goals/StravaIntegration.js =====
import React, { useState } from 'react';
import { ExternalLink, Users, Activity, Trophy } from 'lucide-react';

const StravaIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  
  // Mock Strava data
  const stravaData = {
    groupName: 'Brotherhood Fitness',
    members: 28,
    activeThisWeek: 12,
    totalActivities: 156,
    recentActivities: [
      { member: 'Ahmed H.', activity: 'Morning Run', distance: '5.2 km' },
      { member: 'Omar A.', activity: 'Cycling', distance: '15.8 km' },
      { member: 'Yusuf K.', activity: 'Walking', distance: '3.1 km' }
    ]
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
      
      {isConnected ? (
        <div className="p-4 space-y-4">
          {/* Group Stats */}
          <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
            <div>
              <h4 className="font-medium text-gray-800">{stravaData.groupName}</h4>
              <p className="text-sm text-gray-600">
                {stravaData.activeThisWeek} of {stravaData.members} brothers active this week
              </p>
            </div>
            <Trophy className="w-8 h-8 text-orange-500" />
          </div>
          
          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{stravaData.members}</p>
              <p className="text-xs text-gray-600">Members</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{stravaData.activeThisWeek}</p>
              <p className="text-xs text-gray-600">Active</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-gray-800">{stravaData.totalActivities}</p>
              <p className="text-xs text-gray-600">Activities</p>
            </div>
          </div>
          
          {/* Recent Activities */}
          <div>
            <h5 className="font-medium text-gray-800 mb-2">Recent Brotherhood Activities</h5>
            <div className="space-y-2">
              {stravaData.recentActivities.map((activity, index) => (
                <div key={index} className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{activity.member}</p>
                    <p className="text-xs text-gray-600">{activity.activity}</p>
                  </div>
                  <span className="text-sm text-gray-600">{activity.distance}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex space-x-2">
            <button className="flex-1 bg-orange-100 text-orange-700 py-2 px-4 rounded-md text-sm hover:bg-orange-200 flex items-center justify-center space-x-1">
              <ExternalLink className="w-4 h-4" />
              <span>View on Strava</span>
            </button>
            <button className="bg-gray-100 text-gray-600 py-2 px-4 rounded-md text-sm hover:bg-gray-200">
              Settings
            </button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center">
          <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h4 className="font-medium text-gray-800 mb-2">Connect to Strava</h4>
          <p className="text-sm text-gray-600 mb-4">
            Join the Brotherhood fitness group and stay motivated together in maintaining physical health as part of your spiritual journey.
          </p>
          <button
            onClick={() => setIsConnected(true)}
            className="bg-orange-500 text-white py-2 px-4 rounded-md text-sm hover:bg-orange-600 flex items-center space-x-2 mx-auto"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Connect Strava Account</span>
          </button>
          <p className="text-xs text-gray-500 mt-2">
            "Take care of your body. It's the only place you have to live."
          </p>
        </div>
      )}
    </div>
  );
};

export default StravaIntegration;