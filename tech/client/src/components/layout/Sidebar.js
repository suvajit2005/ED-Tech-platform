import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FiHome,
  FiBookOpen,
  FiUsers,
  FiBarChart2,
  FiVideo,
  FiFileText,
  FiSettings,
  FiDollarSign,
  FiShield,
  FiTrendingUp,
  FiCalendar,
  FiAward,
} from 'react-icons/fi';

const Sidebar = () => {
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  const getNavigationItems = () => {
    const baseItems = [
      {
        name: 'Dashboard',
        href: `/${user?.role}`,
        icon: FiHome,
      },
    ];

    if (user?.role === 'student') {
      return [
        ...baseItems,
        {
          name: 'My Courses',
          href: '/student/courses',
          icon: FiBookOpen,
        },
        {
          name: 'Tests',
          href: '/student/tests',
          icon: FiAward,
        },
        {
          name: 'Progress',
          href: '/student/progress',
          icon: FiTrendingUp,
        },
        {
          name: 'Profile',
          href: '/student/profile',
          icon: FiSettings,
        },
      ];
    }

    if (user?.role === 'teacher') {
      return [
        ...baseItems,
        {
          name: 'My Courses',
          href: '/teacher/courses',
          icon: FiBookOpen,
        },
        {
          name: 'Create Course',
          href: '/teacher/courses/create',
          icon: FiFileText,
        },
        {
          name: 'Live Classes',
          href: '/teacher/live-classes',
          icon: FiVideo,
        },
        {
          name: 'Analytics',
          href: '/teacher/analytics',
          icon: FiBarChart2,
        },
        {
          name: 'Students',
          href: '/teacher/students',
          icon: FiUsers,
        },
        {
          name: 'Profile',
          href: '/teacher/profile',
          icon: FiSettings,
        },
      ];
    }

    if (user?.role === 'admin') {
      return [
        ...baseItems,
        {
          name: 'Users',
          href: '/admin/users',
          icon: FiUsers,
        },
        {
          name: 'Courses',
          href: '/admin/courses',
          icon: FiBookOpen,
        },
        {
          name: 'Revenue',
          href: '/admin/revenue',
          icon: FiDollarSign,
        },
        {
          name: 'Analytics',
          href: '/admin/analytics',
          icon: FiBarChart2,
        },
        {
          name: 'Reports',
          href: '/admin/reports',
          icon: FiShield,
        },
      ];
    }

    return baseItems;
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="w-64 bg-white dark:bg-secondary-800 border-r border-secondary-200 dark:border-secondary-700 min-h-screen">
      <div className="p-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
            <FiBookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-secondary-900 dark:text-secondary-100">
              EdTech
            </h2>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              Learning Platform
            </p>
          </div>
        </div>
      </div>

      <nav className="px-4 pb-6">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <li key={item.name}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `sidebar-item ${
                      isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'
                    }`
                  }
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  {item.name}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-secondary-200 dark:border-secondary-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-secondary-900 dark:text-secondary-100 truncate">
              {user?.name}
            </p>
            <p className="text-xs text-secondary-500 dark:text-secondary-400">
              {user?.role?.charAt(0).toUpperCase() + user?.role?.slice(1)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
