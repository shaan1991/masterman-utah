// ===== src/components/common/LoadingSpinner.js =====
import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
        <p className="text-gray-600 mt-4">Loading... Bismillah</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;