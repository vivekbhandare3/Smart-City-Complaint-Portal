import React, { useState } from 'react';

const UserAuth = ({ onLogin, onSignup, error, setError, onSwitchToGov }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [view, setView] = useState('login'); // 'login' or 'signup'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'login') {
      onLogin(email, password, 'user');
    } else {
      onSignup(email, password, 'user', null); // No department for users
    }
  };

  const handleViewChange = () => {
    setError('');
    setEmail('');
    setPassword('');
    setView(view === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-text-main">
            {view === 'login' ? 'Welcome Back, Citizen' : 'Join the Portal'}
          </h2>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          
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
            <button type="submit" className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              {view === 'login' ? 'Login' : 'Sign Up'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-text-light">
            {view === 'login' ? "Don't have an account?" : "Already have an account?"}
            <button onClick={handleViewChange} className="ml-2 text-primary hover:underline font-bold">
              {view === 'login' ? 'Sign Up' : 'Login'}
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-text-light">
            <button onClick={onSwitchToGov} className="text-blue-600 hover:underline">
              Login as Government User Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserAuth;