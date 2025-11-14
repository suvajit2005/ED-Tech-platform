import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { FiMenu, FiBell, FiUser, FiLogOut, FiSettings } from 'react-icons/fi';
import { logout } from '../../store/slices/authSlice';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from '../common/ThemeToggle';
import DropdownMenu from '../common/DropdownMenu';

const Header = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { theme } = useTheme();

  const handleLogout = () => {
    dispatch(logout());
    navigate('/auth/login');
  };

  const userMenuItems = [
    {
      label: 'Profile',
      icon: FiUser,
      onClick: () => navigate(`/${user?.role}/profile`),
    },
    {
      label: 'Settings',
      icon: FiSettings,
      onClick: () => navigate(`/${user?.role}/settings`),
    },
    {
      label: 'Logout',
      icon: FiLogOut,
      onClick: handleLogout,
      className: 'text-error-600 dark:text-error-400',
    },
  ];

  return (
    <header className="bg-white dark:bg-secondary-800 border-b border-secondary-200 dark:border-secondary-700 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left side */}
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
            <FiMenu className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
          </button>
          
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gradient">
              EdTech Platform
            </h1>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Notifications */}
          <button className="relative p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
            <FiBell className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-error-500 rounded-full"></span>
          </button>
          
          {/* User Menu */}
          <DropdownMenu
            trigger={
              <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-secondary-100 dark:hover:bg-secondary-700 transition-colors">
                <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                  <span className="text-white font-medium text-sm">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100">
                    {user?.name}
                  </p>
                  <p className="text-xs text-secondary-500 dark:text-secondary-400">
                    {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
                  </p>
                </div>
              </button>
            }
            items={userMenuItems}
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
