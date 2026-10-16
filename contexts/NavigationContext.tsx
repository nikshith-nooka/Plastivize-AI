import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { NavigateToFunction, View } from '../types';

interface NavigationContextType {
  navigateTo: NavigateToFunction;
  setNavigateTo: React.Dispatch<React.SetStateAction<NavigateToFunction>>;
}

const NavigationContext = createContext<NavigationContextType | undefined>(undefined);

const emptyNavigateTo: NavigateToFunction = (view: View) => {
  console.warn('NavigateTo function not yet initialized');
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [navigateTo, setNavigateTo] = useState<NavigateToFunction>(() => emptyNavigateTo);
  
  return (
    <NavigationContext.Provider value={{ navigateTo, setNavigateTo }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = (): { navigateTo: NavigateToFunction, setNavigateTo: React.Dispatch<React.SetStateAction<NavigateToFunction>> } => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within a NavigationProvider');
  }
  return { navigateTo: context.navigateTo, setNavigateTo: context.setNavigateTo };
};
