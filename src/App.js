import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, getDoc, doc, serverTimestamp } from 'firebase/firestore';
import { auth, db, isConfigPlaceholder, firebaseConfig } from './firebase';
import Header from './Header';
import LoadingScreen from './LoadingScreen';
import FirebaseConfigError from './FirebaseConfigError';
import AdminDashboard from './AdminDashboard';
import UserDashboard from './UserDashboard';
import UserAuth from './UserAuth';
import GovAuth from './GovAuth';

export default function App() {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authType, setAuthType] = useState('user');
  const [error, setError] = useState('');

  const GOVERNMENT_DOMAIN = '@gov.example';

  useEffect(() => {
    if (isConfigPlaceholder(firebaseConfig)) {
      setError("Firebase config is not set. Please create a .env file and add your project's credentials.");
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setLoading(true);
      if (currentUser) {
        setUser(currentUser);
        const userDocRef = doc(db, "users", currentUser.uid);
        const adminDocRef = doc(db, "admins", currentUser.uid);
        try {
          const [userDocSnap, adminDocSnap] = await Promise.all([
            getDoc(userDocRef),
            getDoc(adminDocRef)
          ]);

          if (adminDocSnap.exists()) {
            const adminData = adminDocSnap.data();
            setUserData({ ...adminData, role: 'admin', email: currentUser.email });
          } else if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            setUserData({ ...userData, role: 'user', email: currentUser.email });
          } else {
            if (currentUser.email.endsWith(GOVERNMENT_DOMAIN)) {
              setUserData({ email: currentUser.email, role: 'admin', department: 'General' });
              await setDoc(doc(db, "admins", currentUser.uid), {
                email: currentUser.email,
                role: 'admin',
                department: 'General',
                createdAt: serverTimestamp()
              }, { merge: true });
            } else {
              setUserData({ email: currentUser.email, role: 'user' });
              await setDoc(doc(db, "users", currentUser.uid), {
                email: currentUser.email,
                role: 'user',
                createdAt: serverTimestamp()
              }, { merge: true });
            }
            setError('Account data missing. Role assigned based on email. Please contact support if incorrect.');
          }
        } catch (err) {
          setError('Failed to load account data: ' + (err.code === 'permission-denied' ? 'Insufficient permissions. Please check Firestore rules.' : err.message));
          setUserData({
            email: currentUser.email,
            role: currentUser.email.endsWith(GOVERNMENT_DOMAIN) ? 'admin' : 'user',
            department: currentUser.email.endsWith(GOVERNMENT_DOMAIN) ? 'General' : undefined
          });
        }
      } else {
        setUser(null);
        setUserData(null);
        setAuthType('user');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleLogin = async (email, password, userType) => {
    setError('');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      const userDocRef = doc(db, "users", currentUser.uid);
      const adminDocRef = doc(db, "admins", currentUser.uid);
      const [userDocSnap, adminDocSnap] = await Promise.all([getDoc(userDocRef), getDoc(adminDocRef)]);

      if (userDocSnap.exists() && userType !== 'user') {
        await signOut(auth);
        throw new Error('This email is registered as a normal user. Please use the Citizen Portal.');
      } else if (adminDocSnap.exists() && userType !== 'admin') {
        await signOut(auth);
        throw new Error('This email is registered as a government user. Please use the Government Portal.');
      } else if (!userDocSnap.exists() && !adminDocSnap.exists()) {
        await signOut(auth);
        throw new Error('No account found for this email. Please sign up first.');
      }
    } catch (err) {
      setError(err.message);
      if (auth.currentUser) await signOut(auth);
    }
  };

  const handleSignup = async (email, password, userType, department, fullName, phone, position) => {
    setError('');
    try {
      if (userType === 'admin' && !email.endsWith(GOVERNMENT_DOMAIN)) {
        throw new Error('Government accounts require an email ending with @gov.example.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      const collection = userType === 'admin' ? 'admins' : 'users';
      const userData = {
        email: newUser.email,
        role: userType,
        createdAt: serverTimestamp()
      };
      if (userType === 'admin') {
        userData.department = department || 'General';
        userData.fullName = fullName || '';
        userData.phone = phone || '';
        userData.position = position || '';
      }
      await setDoc(doc(db, collection, newUser.uid), userData, { merge: true });
    } catch (err) {
      setError(err.message);
      if (auth.currentUser) await signOut(auth);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      setError('Failed to log out. Please try again.');
    }
  };

  if (error.includes("Firebase config is not set")) {
    return <FirebaseConfigError message={error} />;
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-secondary">
      <Header
        user={user}
        userData={userData}
        onLogout={handleLogout}
      />
      <main className="container mx-auto px-4 py-8">
        {user ? (
          userData?.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <UserDashboard user={user} />
          )
        ) : authType === 'user' ? (
          <UserAuth
            onLogin={handleLogin}
            onSignup={handleSignup}
            error={error}
            setError={setError}
            onSwitchToGov={() => setAuthType('gov')}
          />
        ) : (
          <GovAuth
            onLogin={handleLogin}
            onSignup={handleSignup}
            error={error}
            setError={setError}
            onSwitchToUser={() => setAuthType('user')}
          />
        )}
      </main>
    </div>
  );
}