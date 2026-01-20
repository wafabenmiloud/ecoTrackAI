import React from 'react';
import { FiBell, FiMenu, FiSearch, FiUser } from 'react-icons/fi';

const AdminTopbar = ({ onMenuClick }) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={onMenuClick}
            className="p-2 text-gray-500 rounded-md lg:hidden hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
          >
            <FiMenu className="w-6 h-6" />
          </button>
          <div className="relative mx-4 lg:mx-0">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch className="w-5 h-5 text-gray-400" />
            </span>
            <input
              className="w-full py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              type="text"
              placeholder="Search..."
            />
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <FiBell className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 overflow-hidden bg-gray-200 rounded-full">
              <FiUser className="w-full h-full p-1 text-gray-500" />
            </div>
            <span className="text-sm font-medium text-gray-700">Admin</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;