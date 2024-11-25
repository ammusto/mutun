import React, { createContext } from 'react';
import { useUnifiedCollections } from './useUnifiedCollections';
import type { Text, Collection } from '../../types';



interface UnifiedCollectionsContextValue {
  collections: Collection[];
  isLoading: boolean;
  textMatchesCollections: (text: Text, selectedCollections: string[]) => boolean;
}

interface UnifiedCollectionsProviderProps {
  children: React.ReactNode;
}

export const UnifiedCollectionsContext = createContext<UnifiedCollectionsContextValue | undefined>(undefined);

export const UnifiedCollectionsProvider: React.FC<UnifiedCollectionsProviderProps> = ({ children }) => {
  const { collections, isLoading, textMatchesCollections } = useUnifiedCollections();

  return (
    <UnifiedCollectionsContext.Provider value={{ 
      collections, 
      isLoading, 
      textMatchesCollections 
    }}>
      {children}
    </UnifiedCollectionsContext.Provider>
  );
};