import React, { useState, useEffect } from 'react';

const AuthScreen = ({ view, setView, onLogin, onSignup, error, setError, userType, setUserType }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');

  // Reset form when userType changes
  useEffect(() => {
    setEmail('');
    setPassword('');
    setDepartment('');
    setError('');
  }, [userType, setError]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'login') {
      onLogin(email, password, userType);
    } else {
      if (userType === 'admin' && !department) {
        setError('Please select a department for admin signup.');
        return;
      }
      onSignup(email, password, userType, department);
    }
  };

  const handleViewChange = (newView) => {
    setError('');
    setEmail('');
    setPassword('');
    setDepartment('');
    setView(newView);
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-text-main">{view === 'login' ? 'Welcome Back' : 'Create an Account'}</h2>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          
          {/* User Type Selection */}
          <div className="mb-4">
            <label className="block text-sm font-bold text-text-light mb-2">Account Type</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="user"
                  checked={userType === 'user'}
                  onChange={() => setUserType('user')}
                  className="mr-2"
                />
                Normal User
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="userType"
                  value="admin"
                  checked={userType === 'admin'}
                  onChange={() => setUserType('admin')}
                  className="mr-2"
                />
                Government Admin
              </label>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email-input" className="block text-sm font-bold text-text-light mb-2">Email Address</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
              {userType === 'admin' && view === 'signup' && (
                <p className="text-xs text-text-light mt-1">Must be a government email (e.g., ending with @gov.example)</p>
              )}
            </div>
            <div>
              <label htmlFor="password-input" className="block text-sm font-bold text-text-light mb-2">Password</label>
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                required
              />
            </div>
            {userType === 'admin' && view === 'signup' && (
              <div>
                <label htmlFor="department-input" className="block text-sm font-bold text-text-light mb-2">Department</label>
                <select
                  id="department-input"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg"
                  required
                >
                  <option value="">Select Department</option>
                  <option value="Public Works">Public Works</option>
                  <option value="Sanitation">Sanitation</option>
                  <option value="Water Management">Water Management</option>
                  <option value="Street Lighting">Street Lighting</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            )}
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              {view === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-text-light">
            {view === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => handleViewChange(view === 'login' ? 'signup' : 'login')} className="ml-2 text-primary hover:underline font-bold">
              {view === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;