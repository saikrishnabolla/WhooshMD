'use client'

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Stethoscope, Menu, X } from 'lucide-react';
import { Link } from '../components/ui/Link';
import { useAppContext } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';

const Header: React.FC = () => {
  const [isNavOpen, setIsNavOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { currentPage } = useAppContext();

  const handleNavToggle = () => {
    setIsNavOpen(!isNavOpen);
  };

  // Close mobile nav when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (isNavOpen) setIsNavOpen(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isNavOpen]);

  const isActive = (path: string) => currentPage === path;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary-600 no-underline">
          <Image 
            src="/whoosh-logo.png" 
            alt="Whoosh MD Logo" 
            width={32}
            height={32}
            className="w-8 h-8 object-contain"
          />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
            Whoosh MD
          </h1>
        </Link>
        
        <nav className="hidden md:flex items-center gap-8">
          <Link 
            href="/" 
            className={`text-gray-700 hover:text-primary-600 transition-colors relative group ${
              isActive('/') ? 'text-primary-600' : ''
            }`}
          >
            Home
            <span className={`absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 transition-transform origin-left ${
              isActive('/') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </Link>
          <Link 
            href="/search" 
            className={`text-gray-700 hover:text-primary-600 transition-colors relative group ${
              isActive('/search') ? 'text-primary-600' : ''
            }`}
          >
            Find Providers
            <span className={`absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 transition-transform origin-left ${
              isActive('/search') ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
            }`}></span>
          </Link>
          <Link href="/favorites" className="text-gray-700 hover:text-primary-600 transition-colors relative group">
            My Favorites
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          <Link href="/about" className="text-gray-700 hover:text-primary-600 transition-colors relative group">
            About us
            <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
          </Link>
          {user ? (
            <>
              <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors relative group">
                Dashboard
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </Link>
              <button
                onClick={() => signOut()} 
                className="text-gray-700 hover:text-primary-600 transition-colors relative group"
              > 
                Sign Out
                <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
              </button>
            </>
          ) : (
            <Link href="/dashboard" className="text-gray-700 hover:text-primary-600 transition-colors relative group">
              Sign In
              <span className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></span>
            </Link>
          )}
          <Link 
            href="/search" 
            className="btn-primary shadow-sm hover:shadow-md hover-lift"
          >
            Get Started
          </Link>
        </nav>
        
        <button 
          className="md:hidden text-gray-700 focus:outline-none"
          onClick={(e) => {
            e.stopPropagation();
            handleNavToggle();
          }}
          aria-label={isNavOpen ? "Close menu" : "Open menu"}
        >
          {isNavOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>
      
      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-50 transition-all duration-300 ${
          isNavOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleNavToggle}
      >
        <div 
          className={`fixed inset-y-0 right-0 w-[320px] bg-white shadow-2xl transform transition-transform duration-300 ease-out ${
            isNavOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <Image 
                  src="/whoosh-logo.png" 
                  alt="Whoosh MD Logo" 
                  width={24}
                  height={24}
                  className="w-6 h-6 object-contain"
                />
                <span className="text-lg font-bold text-gray-900">Whoosh MD</span>
              </div>
              <button
                onClick={handleNavToggle}
                className="p-2 -mr-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>
            
            <nav className="flex-1 px-6 py-8 space-y-1 overflow-y-auto">
              <Link 
                href="/" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive('/') 
                    ? 'bg-primary-50 text-primary-600' 
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={handleNavToggle}
              >
                Home
              </Link>
              <Link 
                href="/search" 
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive('/search')
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-700 hover:text-primary-600 hover:bg-gray-50'
                }`}
                onClick={handleNavToggle}
              >
                Find Providers
              </Link>
              <Link 
                href="/favorites" 
                className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={handleNavToggle}
              >
                My Favorites
              </Link>
              <Link 
                href="/about" 
                className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={handleNavToggle}
              >
                About us
              </Link>
              {user ? (
                <>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={handleNavToggle}
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      signOut();
                      handleNavToggle();
                    }}
                    className="flex items-center w-full px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <Link 
                  href="/dashboard" 
                  className="flex items-center px-4 py-3 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-lg transition-colors"
                  onClick={handleNavToggle}
                >
                  Sign In
                </Link>
              )}
            </nav>
            
            <div className="p-6 border-t border-gray-100">
              <Link 
                href="/search" 
                className="btn-primary w-full flex items-center justify-center"
                onClick={handleNavToggle}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;