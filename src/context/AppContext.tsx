'use client'

import React, { createContext, useContext } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AppContextType {
  currentPage: string;
  navigateTo: (path: string) => void;
}

const AppContext = createContext<AppContextType>({
  currentPage: '/',
  navigateTo: () => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <AppContext.Provider value={{ currentPage: pathname || '/', navigateTo }}>
      {children}
    </AppContext.Provider>
  );
};