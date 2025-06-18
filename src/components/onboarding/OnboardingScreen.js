// src/components/onboarding/OnboardingScreen.js
import React, { useState } from 'react';
import { 
  Users, 
  Heart, 
  MessageCircle, 
  Target, 
  Bell, 
  Shield,
  ChevronRight,
  CheckCircle
} from 'lucide-react';

const OnboardingScreen = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    enableNotifications: true,
    shareProfile: true,
    receiveReminders: true
  });

  const steps = [
    {
      id: 'welcome',
      title: 'Assalamu Alaikum!',
      subtitle: 'Welcome to Brotherhood',
      content: 'A sacred space to connect with your brothers in faith, share prayers, and grow together in your spiritual journey.',
      icon: Users,
      action: 'Get Started'
    },
    {
      id: 'features',
      title: 'What you can do here',
      subtitle: 'Discover the features',
      content: [
        { icon: MessageCircle, text: 'Request and offer duas (prayers)' },
        { icon: Target, text: 'Track spiritual and fitness goals' },
        { icon: Users, text: 'Connect with verified brothers' },
        { icon: Bell, text: 'Receive Islamic reminders' }
      ],
      action: 'Continue'
    },
    {
      id: 'privacy',
      title: 'Your privacy matters',
      subtitle: 'Brotherhood principles',
      content: [
        '🔒 Your data is secure and encrypted',
        '👥 Only verified brothers can see your profile',
        '🕌 Islamic values guide our community standards',
        '⚖️ You control what information you share'
      ],
      action: 'I understand'
    },
    {
      id: 'preferences',
      title: 'Customize your experience',
      subtitle: 'Set your preferences',
      content: 'preferences',
      action: 'Save & Continue'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // Save preferences and complete onboarding
      const onboardingData = {
        completedAt: new Date().toISOString(),
        preferences: preferences,
        version: '1.0'
      };
      
      // Store in localStorage (in real app, you'd save to Firestore)
      localStorage.setItem('brotherhood_onboarding_completed', JSON.stringify(onboardingData));
      onComplete();
    }
  };

  const handlePreferenceChange = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md">
        {/* Progress indicator */}
        <div className="flex justify-center mb-6">
          <div className="flex space-x-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          {Icon && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon className="w-8 h-8 text-green-600" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            {currentStepData.title}
          </h1>
          <p className="text-gray-600 text-sm">
            {currentStepData.subtitle}
          </p>
        </div>

        {/* Content */}
        <div className="mb-8">
          {currentStepData.id === 'welcome' && (
            <div className="text-center">
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.content}
              </p>
              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <p className="text-green-800 text-sm font-medium">
                  "And whoever relies upon Allah - then He is sufficient for him. 
                  Indeed, Allah will accomplish His purpose."
                </p>
                <p className="text-green-600 text-xs mt-1">- Quran 65:3</p>
              </div>
            </div>
          )}

          {currentStepData.id === 'features' && (
            <div className="space-y-4">
              {currentStepData.content.map((feature, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <feature.icon className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">{feature.text}</span>
                </div>
              ))}
            </div>
          )}

          {currentStepData.id === 'privacy' && (
            <div className="space-y-3">
              {currentStepData.content.map((item, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700 text-sm">{item}</span>
                </div>
              ))}
            </div>
          )}

          {currentStepData.id === 'preferences' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Push Notifications</h3>
                    <p className="text-sm text-gray-600">Get notified of new dua requests</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.enableNotifications}
                      onChange={() => handlePreferenceChange('enableNotifications')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Profile Sharing</h3>
                    <p className="text-sm text-gray-600">Allow brothers to see your profile</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.shareProfile}
                      onChange={() => handlePreferenceChange('shareProfile')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">Islamic Reminders</h3>
                    <p className="text-sm text-gray-600">Weekly spiritual reminders</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.receiveReminders}
                      onChange={() => handlePreferenceChange('receiveReminders')}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-blue-800 text-sm font-medium">Privacy Note</p>
                    <p className="text-blue-700 text-xs mt-1">
                      You can change these settings anytime in your profile
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={handleNext}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2 font-medium"
        >
          <span>{currentStepData.action}</span>
          {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
        </button>

        {/* Skip option for non-critical steps */}
        {currentStep > 0 && currentStep < steps.length - 1 && (
          <button
            onClick={() => setCurrentStep(steps.length - 1)}
            className="w-full mt-3 text-gray-500 hover:text-gray-700 transition-colors text-sm"
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
};

export default OnboardingScreen;