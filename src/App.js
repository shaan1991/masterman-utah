import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrothersProvider } from './contexts/BrothersContext';
import { NotificationProvider } from './contexts/NotificationContext';
import Layout from './components/common/Layout';
import AuthScreen from './components/auth/AuthScreen';
import LoadingSpinner from './components/common/LoadingSpinner';
import ErrorBoundary from './components/common/ErrorBoundary';
import NotificationBanner from './components/common/NotificationBanner';
import OfflineIndicator from './components/common/OfflineIndicator';

// Import page components
import Dashboard from './components/dashboard/Dashboard';
import BrotherhoodDirectory from './components/brothers/BrotherhoodDirectory';
import DuaRequests from './components/dua/DuaRequests';
import GoalTracking from './components/goals/GoalTracking';
import Announcements from './components/announcements/Announcements';
import Analytics from './components/analytics/Analytics';
import Settings from './components/settings/Settings';

// Import styles
import './styles/globals.css';
import './styles/components.css';

const AppContent = () => {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState('dashboard');

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <AuthScreen />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentPage} />;
      case 'brothers':
        return <BrotherhoodDirectory />;
      case 'dua':
        return <DuaRequests />;
      case 'goals':
        return <GoalTracking />;
      case 'announcements':
        return <Announcements />;
      case 'analytics':
        return <Analytics />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onNavigate={setCurrentPage} />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      <NotificationBanner />
      {renderPage()}
    </Layout>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrothersProvider>
          <NotificationProvider>
            <OfflineIndicator />
            <AppContent />
          </NotificationProvider>
        </BrothersProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;