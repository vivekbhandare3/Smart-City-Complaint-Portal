import React from 'react';

const FirebaseConfigError = ({ error }) => (
  <div className="flex items-center justify-center min-h-screen bg-red-50">
    <div className="p-8 bg-white rounded-lg shadow-lg text-center max-w-md">
      <h1 className="text-2xl font-bold text-red-600 mb-4">Configuration Error</h1>
      <p>{error}</p>
      <p className="mt-4 text-sm text-gray-500">Please check firebase.js configuration.</p>
    </div>
  </div>
);

export default FirebaseConfigError;
