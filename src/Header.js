import React from 'react';
import { LogoutIcon } from './Icons';

const Header = ({ user, userData, onLogout }) => (
  <header className="bg-white shadow-md">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold">
        <span className="text-blue-600">Smart City</span> Complaint Portal
      </div>

      {user && (
        <div className="flex items-center">
          <span className="mr-4 hidden md:block">
            Welcome, {userData?.email}
            {userData?.role === 'admin' && <span className="ml-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">Admin</span>}
          </span>
          <button onClick={onLogout} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg flex items-center">
            <LogoutIcon /><span className="ml-2 hidden md:block">Logout</span>
          </button>
        </div>
      )}
    </div>
  </header>
);

export default Header;
