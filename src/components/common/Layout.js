// ===== src/components/common/Layout.js =====
import React from 'react';
import Navigation from './Navigation';
import Header from './Header';

const Layout = ({ children, currentPage, onPageChange }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-lg">
        <main className="p-4 pb-20">
          {children}
        </main>
        <Navigation currentPage={currentPage} onPageChange={onPageChange} />
      </div>
    </div>
  );
};

export default Layout;