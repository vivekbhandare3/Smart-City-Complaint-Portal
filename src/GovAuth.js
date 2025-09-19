import React, { useState } from 'react';

const GovAuth = ({ onLogin, onSignup, error, setError, onSwitchToUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [department, setDepartment] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [position, setPosition] = useState('');
  const [view, setView] = useState('login');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (view === 'login') {
      onLogin(email, password, 'admin');
    } else {
      if (!department) {
        setError('Please select a department.');
        return;
      }
      if (!fullName || !phone || !position) {
        setError('Please fill all admin details.');
        return;
      }
      onSignup(email, password, 'admin', department, fullName, phone, position);
    }
  };

  const handleViewChange = () => {
    setError('');
    setEmail('');
    setPassword('');
    setDepartment('');
    setFullName('');
    setPhone('');
    setPosition('');
    setView(view === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-xl shadow-2xl">
          <h2 className="text-3xl font-bold mb-6 text-center text-text-main">
            {view === 'login' ? 'Government Portal Access' : 'Government Registration'}
          </h2>
          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email-input" className="block text-sm font-bold text-text-light mb-2">Government Email</label>
              <input
                id="email-input"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="e.g., admin@gov.example"
                required
              />
              {view === 'signup' && (
                <p className="text-xs text-text-light mt-1">Must end with @gov.example</p>
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
            {view === 'signup' && (
              <>
                <div>
                  <label htmlFor="fullName-input" className="block text-sm font-bold text-text-light mb-2">Full Name</label>
                  <input
                    id="fullName-input"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="phone-input" className="block text-sm font-bold text-text-light mb-2">Phone Number</label>
                  <input
                    id="phone-input"
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="position-input" className="block text-sm font-bold text-text-light mb-2">Position/Title</label>
                  <input
                    id="position-input"
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    placeholder="e.g., City Engineer"
                    required
                  />
                </div>
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
              </>
            )}
            <button type="submit" className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105">
              {view === 'login' ? 'Government Login' : 'Register Admin'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-text-light">
            {view === 'login' ? "New to the portal?" : "Already registered?"}
            <button onClick={handleViewChange} className="ml-2 text-green-600 hover:underline font-bold">
              {view === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
          <p className="mt-4 text-center text-sm text-text-light">
            <button onClick={onSwitchToUser} className="text-blue-600 hover:underline">
              Login as Normal User Instead
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default GovAuth;