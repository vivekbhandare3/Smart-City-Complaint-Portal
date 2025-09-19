import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp, arrayUnion } from "firebase/firestore";

// Read configuration from environment variables
export const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

// This function checks if the config is missing.
export const isConfigPlaceholder = (config) => !config.apiKey;

// Initialize Firebase
let app;
try {
  if (!isConfigPlaceholder(firebaseConfig)) {
    app = initializeApp(firebaseConfig);
  } else {
    console.error("🔥🔥🔥 Firebase config is missing. Please check your .env file.");
  }
} catch (error) {
  console.error("🔥🔥🔥 Firebase initialization error:", error);
}

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export { arrayUnion, serverTimestamp }; // Added serverTimestamp