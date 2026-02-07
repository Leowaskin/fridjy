import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Camera, ChefHat, Activity } from 'lucide-react';
import clsx from 'clsx';
import { AppRoute } from '../types';

export const Navbar: React.FC = () => {
  const navItems = [
    { icon: Home, label: 'Fridge', to: AppRoute.HOME },
    { icon: Camera, label: 'Scan', to: AppRoute.SCAN },
    { icon: ChefHat, label: 'Recipes', to: AppRoute.RECIPES },
    { icon: Activity, label: 'Health', to: AppRoute.HEALTH },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-stone-200 pb-safe z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-4">
        {navItems.map(({ icon: Icon, label, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) => clsx(
              "flex flex-col items-center justify-center w-full h-full transition-colors duration-200",
              isActive ? "text-orange-500" : "text-stone-400 hover:text-stone-600"
            )}
          >
            <Icon size={24} strokeWidth={2.5} />
            <span className="text-[10px] font-medium mt-1">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
