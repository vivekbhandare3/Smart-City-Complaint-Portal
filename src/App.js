import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { setDoc, getDoc, doc, query, where, getDocs, collection, serverTimestamp } from 'firebase/firestore';
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

          console.log('DEBUG: Checking Firestore for user:', currentUser.email);
          console.log('DEBUG: Admin doc exists:', adminDocSnap.exists(), 'Data:', adminDocSnap.data());
          console.log('DEBUG: User doc exists:', userDocSnap.exists(), 'Data:', userDocSnap.data());

          if (adminDocSnap.exists()) {
            const adminData = adminDocSnap.data();
            console.log('DEBUG: Setting admin role for:', currentUser.email);
            setUserData({ ...adminData, role: 'admin', email: currentUser.email });
          } else if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            console.log('DEBUG: Setting user role for:', currentUser.email);
            setUserData({ ...userData, role: 'user', email: currentUser.email });
          } else {
            console.warn('DEBUG: No user or admin doc found for:', currentUser.email);
            if (currentUser.email.endsWith(GOVERNMENT_DOMAIN)) {
              console.log('DEBUG: Email suggests admin, setting admin role');
              setUserData({ email: currentUser.email, role: 'admin', department: 'General' });
              await setDoc(doc(db, "admins", currentUser.uid), {
                email: currentUser.email,
                role: 'admin',
                department: 'General',
                createdAt: serverTimestamp()
              }, { merge: true });
              console.log('DEBUG: Admin doc created for:', currentUser.uid);
            } else {
              console.log('DEBUG: Defaulting to user role');
              setUserData({ email: currentUser.email, role: 'user' });
              await setDoc(doc(db, "users", currentUser.uid), {
                email: currentUser.email,
                role: 'user',
                createdAt: serverTimestamp()
              }, { merge: true });
              console.log('DEBUG: User doc created for:', currentUser.uid);
            }
            setError('Account data missing. Role assigned based on email. Please contact support if incorrect.');
          }
        } catch (err) {
          console.error('DEBUG: Error fetching user/admin data:', err);
          setError('Failed to load account data: ' + (err.code === 'permission-denied' ? 'Insufficient permissions. Please check Firestore rules.' : err.message));
          setUserData({
            email: currentUser.email,
            role: currentUser.email.endsWith(GOVERNMENT_DOMAIN) ? 'admin' : 'user',
            department: currentUser.email.endsWith(GOVERNMENT_DOMAIN) ? 'General' : undefined
          });
        }
      } else {
        console.log('DEBUG: No user logged in');
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
      console.log('DEBUG: Attempting login for:', email, 'as', userType);

      // Check Firestore for user type before authentication
      const expectedCollection = userType === 'admin' ? 'admins' : 'users';
      const oppositeCollection = userType === 'admin' ? 'users' : 'admins';
      const expectedQuery = query(collection(db, expectedCollection), where('email', '==', email));
      const oppositeQuery = query(collection(db, oppositeCollection), where('email', '==', email));

      let [expectedDocs, oppositeDocs] = [null, null];
      try {
        [expectedDocs, oppositeDocs] = await Promise.all([
          getDocs(expectedQuery),
          getDocs(oppositeQuery)
        ]);
      } catch (queryErr) {
        console.warn('DEBUG: Permission denied on pre-login query:', queryErr);
        // Fallback: Allow login and validate post-authentication
        console.log('DEBUG: Proceeding with login, will validate role after authentication');
      }

      if (expectedDocs && !expectedDocs.empty) {
        if (oppositeDocs && !oppositeDocs.empty) {
          const oppositeRole = userType === 'admin' ? 'normal user' : 'government user';
          throw new Error(`Wrong details for ${userType === 'admin' ? 'government' : 'normal'} user. This email is registered as a ${oppositeRole} account.`);
        }
      } else if (expectedDocs) {
        throw new Error(`No ${userType === 'admin' ? 'government' : 'normal'} user account found for this email. Please sign up first.`);
      }

      // Proceed with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log(`DEBUG: Logged in as ${userType} with email: ${email}`);

      // Post-login validation (if query failed due to permissions)
      const currentUser = userCredential.user;
      const userDocRef = doc(db, "users", currentUser.uid);
      const adminDocRef = doc(db, "admins", currentUser.uid);
      const [userDocSnap, adminDocSnap] = await Promise.all([getDoc(userDocRef), getDoc(adminDocRef)]);
      if (userDocSnap.exists() && userType !== 'user') {
        throw new Error('Wrong details for government user. This email is registered as a normal user account.');
      } else if (adminDocSnap.exists() && userType !== 'admin') {
        throw new Error('Wrong details for normal user. This email is registered as a government user account.');
      }
    } catch (err) {
      console.error('DEBUG: Login error:', err);
      if (err.code === 'permission-denied') {
        setError('Insufficient permissions to verify account. Please check Firestore rules or contact support.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleSignup = async (email, password, userType, department, fullName, phone, position) => {
    setError('');
    try {
      console.log('DEBUG: Starting signup for:', email, 'as', userType); // Fixed unterminated string
      if (userType === 'admin' && !email.endsWith(GOVERNMENT_DOMAIN)) {
        throw new Error('Government accounts require an email ending with @gov.example.');
      }
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const newUser = userCredential.user;
      console.log('DEBUG: User created with UID:', newUser.uid);
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
      console.log('DEBUG: Attempting to write to', collection, 'for UID:', newUser.uid);
      await setDoc(doc(db, collection, newUser.uid), userData, { merge: true });
      console.log('DEBUG: Successfully wrote to', collection, 'for UID:', newUser.uid);
    } catch (err) {
      console.error('DEBUG: Signup error:', err);
      if (err.code === 'permission-denied') {
        setError('Insufficient permissions to create account. Please check Firestore rules.');
      } else {
        setError(err.message);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('DEBUG: User logged out');
    } catch (err) {
      console.error('DEBUG: Logout error:', err);
      setError('Failed to log out. Please try again.');
    }
  };

  if (error.includes("Firebase config is not set")) {
    return <FirebaseConfigError message={error} />;
  }

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        user={user}
        userData={userData}
        onLogout={handleLogout}
        onNormalLoginClick={() => setAuthType('user')}
        onGovLoginClick={() => setAuthType('gov')}
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
            onSwitchToNormal={() => setAuthType('user')}
          />
        )}
      </main>
    </div>
  );
}