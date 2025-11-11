import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UserIcon } from './icons';
const Navigation = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-[#171b2f] text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-xl font-bold">Iternal AI</span>
        </div>
        
        <div className="flex space-x-4">
          <NavLink to="/" isActive={location.pathname === '/'}>
            Home
          </NavLink>
          <NavLink to="/chat" isActive={location.pathname === '/chat'}>
            Chat
          </NavLink>
          <NavLink to="/ask" isActive={location.pathname === '/ask'}>
            <span className="flex items-center gap-1">
              <UserIcon size={14} />
              Ask AI
            </span>
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, children, isActive }) => {
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium ${
        isActive 
          ? 'bg-[#dfa21e] text-white' 
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navigation; 