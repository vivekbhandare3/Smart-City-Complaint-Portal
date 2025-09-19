import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';

// Import all necessary Firebase services and config checks
import { auth, db, isConfigPlaceholder, firebaseConfig } from './firebase';

// Import all the components of the application
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import FirebaseConfigError from './FirebaseConfigError';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import AuthScreen from './AuthScreen';

export default function App() {
  // State for the current authenticated user object from Firebase Auth
  const [user, setUser] = useState(null);
  // State for the user's data from the Firestore 'users' collection (includes role)
  const [userData, setUserData] = useState(null);
  // State to show a loading indicator while fetching data
  const [loading, setLoading] = useState(true);
  // State to toggle between 'login' and 'signup' views on the AuthScreen
  const [view, setView] = useState('login');
  // State to hold and display any authentication errors
  const [error, setError] = useState('');

  useEffect(() => {
    // On initial load, check if the Firebase config in .env is missing.
    // If it is, show an error and stop execution.
    if (isConfigPlaceholder(firebaseConfig)) {
      setError("Firebase config is not set. Please create a .env file and add your project's credentials.");
      setLoading(false);
      return;
    }

    // Set up a real-time listener for authentication state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        // If a user is logged in, set the user state
        setUser(currentUser);
        // Then, fetch their corresponding document from the 'users' collection in Firestore
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          // If the document exists, set the userData state (this contains their role)
          setUserData(userDocSnap.data());
        } else {
          // Fallback for an authenticated user without a Firestore document
          setUserData({ email: currentUser.email, role: 'user' });
        }
      } else {
        // If no user is logged in, reset user states
        setUser(null);
        setUserData(null);
        setView('login');
      }
      setLoading(false);
    });

    // Clean up the listener when the component unmounts
    return () => unsubscribe();
  }, []);

  // --- Authentication Handler Functions ---

  const handleLogin = async (email, password) => {
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleSignup = async (email, password) => {
    setError('');
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      // After signup, create a document for the new user in the 'users' collection
      await setDoc(doc(db, "users", newUser.uid), {
        email: newUser.email,
        role: 'user', // All new users default to the 'user' role
        createdAt: serverTimestamp()
      });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError("Failed to log out.");
      console.error(err);
    }
  };

  // --- Render Logic ---

  // Show error screen if the .env file is not configured
  if (isConfigPlaceholder(firebaseConfig)) {
    return <FirebaseConfigError error={error} />;
  }

  // Show a loading screen while checking auth state
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-secondary font-sans">
      <Header user={user} userData={userData} onLogout={handleLogout} />
      <main className="container mx-auto p-4 md:p-8">
        {user && userData ? (
          // This is the core logic for role-based routing:
          // If the user's role is 'admin', render the AdminDashboard.
          // Otherwise, render the standard UserDashboard.
          userData.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <UserDashboard user={user} />
          )
        ) : (
          // If there is no logged-in user, show the authentication screen
          <AuthScreen
            view={view}
            setView={setView}
            onLogin={handleLogin}
            onSignup={handleSignup}
            error={error}
            setError={setError}
          />
        )}
      </main>
    </div>
  );
}
