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
      if (!department || !fullName || !phone || !position) {
        setError('Please fill all registration details.');
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
    <div className="flex items-center justify-center min-h-[85vh]">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl border border-gray-200">
          <h2 className="text-3xl font-bold mb-2 text-center text-text-main">
            {view === 'login' ? 'Government Portal' : 'Government Registration'}
          </h2>
          <p className="text-center text-text-light mb-8">
            {view === 'login' ? 'Authorized personnel access only.' : 'Register for an official account.'}
          </p>

          {error && <p className="bg-red-100 text-red-700 p-3 rounded-md mb-4 text-sm">{error}</p>}
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Government Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                placeholder="e.g., admin@gov.example"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-light mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                required
              />
            </div>
            {view === 'signup' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-text-light mb-2">Phone</label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Position / Title</label>
                  <input
                    type="text"
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
                    placeholder="e.g., City Engineer"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-light mb-2">Department</label>
                  <select
                    value={department}
                    onChange={e => setDepartment(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-lg"
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
            <button type="submit" className="w-full bg-accent hover:bg-yellow-500 text-white font-bold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-md">
              {view === 'login' ? 'Login' : 'Register Admin'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-text-light">
            {view === 'login' ? "New to the portal?" : "Already registered?"}
            <button onClick={handleViewChange} className="ml-1 text-primary hover:underline font-semibold">
              {view === 'login' ? 'Register' : 'Login'}
            </button>
          </p>
          <div className="mt-4 pt-4 border-t text-center">
            <button onClick={onSwitchToUser} className="text-sm text-text-light hover:text-primary hover:underline transition-colors">
              Access the Citizen Portal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GovAuth;