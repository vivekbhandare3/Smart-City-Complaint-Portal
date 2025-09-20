import React from 'react';
import { LogoutIcon } from './Icons';

const Header = ({ user, userData, onLogout }) => (
  <header className="bg-white shadow-sm sticky top-0 z-40">
    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
      <div className="text-2xl font-bold text-text-main tracking-tight">
        <span className="text-primary">City</span>Pulse
      </div>
      {user && (
        <div className="flex items-center space-x-4">
          <div className="text-right hidden sm:block">
            <p className="font-semibold text-text-main leading-tight">{userData?.role === 'admin' ? userData?.fullName : userData?.email}</p>
            {userData?.role === 'admin' && (
              <p className="text-xs text-text-light">{userData?.department} Department</p>
            )}
          </div>
          <button
            onClick={onLogout}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-300"
          >
            <LogoutIcon />
            <span className="ml-2 hidden md:inline">Logout</span>
          </button>
        </div>
      )}
    </div>
  </header>
);

export default Header;