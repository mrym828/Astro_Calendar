import { useState } from 'react';
import { FiHome, FiCalendar, FiSearch, FiArchive, FiStar, FiMenu } from 'react-icons/fi';
import NavItem from './NavItem';
import { VscChromeClose } from "react-icons/vsc";

const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { to: '/', icon: FiHome, label: 'Home' },
    { to: '/calendar', icon: FiCalendar, label: 'Calendar' },
    { to: '/events', icon: FiStar, label: 'Celestial Events' },
    { to: '/archive', icon: FiArchive, label: 'Archive' },
    { to: '/search', icon: FiSearch, label: 'Search' },
  ];

  return (
    <>
      <nav className="w-full px-6 mb-4 text-white flex items-center justify-end md:justify-center">
        <div className="hidden md:flex space-x-6 text-lg gap-7">
          {navItems.map((item) => (
            <NavItem key={item.label} to={item.to} icon={item.icon} label={item.label} />
          ))}
        </div>

        {/* Hamburger Icon */}
        <button
          onClick={() => setIsOpen(true)}
          className="md:hidden text-3xl text-white"
          aria-label="Open Sidebar"
        >
          <FiMenu />
        </button>
      </nav>

      {/* Sidebar menu */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-[#1F2E56] text-white transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        } transition-transform duration-300 z-50 shadow-xl`}
      >
        <div className="flex justify-end p-4">
          <button onClick={() => setIsOpen(false)} className="text-2xl text-white">
            <VscChromeClose/>
          </button>
        </div>
        <nav className="flex flex-col gap-6 px-6 text-lg">
          {navItems.map((item) => (
            <NavItem
              key={item.label}
              to={item.to}
              icon={item.icon}
              label={item.label}
              onClick={() => setIsOpen(false)}
            />
          ))}
        </nav>
      </div>

      {/* Overlay when sidebar is open */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default Navigation;