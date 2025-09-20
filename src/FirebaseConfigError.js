// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore, serverTimestamp, arrayUnion } from 'firebase/firestore';
// import { getStorage } from 'firebase/storage';

// // Read configuration from environment variables
// export const firebaseConfig = {
//   apiKey: process.env.REACT_APP_API_KEY,
//   authDomain: process.env.REACT_APP_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_APP_ID,
// };

// // Function to check if the config is valid
// export const isConfigPlaceholder = (config) => {
//   return !config.apiKey || !config.authDomain || !config.projectId || !config.appId;
// };

// // Initialize Firebase
// let app;
// let auth;
// let db;
// let storage;

// try {
//   if (!isConfigPlaceholder(firebaseConfig)) {
//     app = initializeApp(firebaseConfig);
//     auth = getAuth(app);
//     db = getFirestore(app);
//     storage = getStorage(app);
//   } else {
//     console.error('🔥🔥🔥 Firebase config is missing. Please check your .env file.');
//     throw new Error('Invalid Firebase configuration');
//   }
// } catch (error) {
//   console.error('🔥🔥🔥 Firebase initialization error:', error);
//   // Optionally, set default values or throw an error to prevent further execution
// }

// // Export Firebase services only if initialized
// export { auth, db, storage, arrayUnion, serverTimestamp };

import React from 'react';

export default function FirebaseConfigError({ message }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-red-50 text-red-800">
      <div className="text-center p-8 max-w-lg mx-auto">
        <h1 className="text-2xl font-bold mb-4">Firebase Configuration Error</h1>
        <p className="bg-red-100 p-4 rounded-md border border-red-300">
          {message}
        </p>
        <p className="mt-4 text-sm text-red-600">
          Please make sure your `.env` file is in the root directory of your project (the same level as `package.json`) and that it contains all the required Firebase credentials. You may need to restart your development server after creating or updating the `.env` file.
        </p>
      </div>
    </div>
  );
}