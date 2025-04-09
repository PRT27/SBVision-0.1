
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Home, Image, Shield, Settings, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const AppNavigation = () => {
  const location = useLocation();
  
  const navigationItems = [
    { name: 'Home', icon: <Home size={20} />, path: '/' },
    { name: 'Camera', icon: <Camera size={20} />, path: '/camera' },
    { name: 'Image Gallery', icon: <Image size={20} />, path: '/gallery' },
    { name: 'Security', icon: <Shield size={20} />, path: '/security' },
    { name: 'Settings', icon: <Settings size={20} />, path: '/settings' },
    { name: 'About', icon: <Info size={20} />, path: '/about' },
  ];

  return (
    <nav className="h-full bg-white">
      <div className="p-6 bg-app-blue text-white">
        <h2 className="text-xl font-bold">Sight Beyond Vision</h2>
        <p className="text-sm opacity-75">Advanced Image Analysis</p>
      </div>
      <ul className="p-4">
        {navigationItems.map((item) => (
          <li key={item.name} className="mb-2">
            <Link
              to={item.path}
              className={cn(
                "flex items-center p-3 rounded-lg transition-colors",
                location.pathname === item.path
                  ? "bg-app-blue text-white"
                  : "text-app-dark-gray hover:bg-gray-100"
              )}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
      <div className="absolute bottom-8 left-0 right-0 px-4">
        <div className="text-center text-sm text-gray-500">
          <p>Sight Beyond Vision v1.0</p>
          <p>© 2025 All Rights Reserved</p>
        </div>
      </div>
    </nav>
  );
};

export default AppNavigation;
