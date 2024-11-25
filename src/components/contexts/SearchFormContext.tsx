// contexts/SearchFormContext.tsx
import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SearchType, SearchInType } from '../../types';

interface SearchField {
  term: string;
  searchIn: SearchInType;
  definite: boolean;
  proclitic: boolean;
  tabType?: 'AND' | 'OR';
}

interface SearchFormState {
  searchType: SearchType;
  simple: {
    term: string;
    searchIn: SearchInType;
    definite: boolean;
    proclitic: boolean;
  };
  advanced: {
    andFields: SearchField[];
    orFields: SearchField[];
  };
  proximity: {
    firstTerm: SearchField;
    secondTerm: SearchField;
    slop: number;
  };
}

interface SearchFormContextValue {
  searchFormState: SearchFormState;
  setSearchType: (type: SearchType) => void;
  handleSimpleFieldChange: (name: string, value: string | boolean) => void;
  handleAdvancedFieldChange: (index: number, name: string, value: string | boolean, type: 'AND' | 'OR') => void;
  handleProximityFieldChange: (index: number, name: string, value: string | boolean) => void;
  handleSlopChange: (value: number) => void;
  addAdvancedField: (type: 'AND' | 'OR') => void;
  removeAdvancedField: (index: number, type: 'AND' | 'OR') => void;
  resetSearchForm: () => void;
}

interface SearchFormProviderProps {
  children: React.ReactNode;
}

const initialSearchFormState: SearchFormState = {
  searchType: 'simple',
  simple: {
    term: '',
    searchIn: 'tok',
    definite: false,
    proclitic: false
  },
  advanced: {
    andFields: [
      {
        term: '',
        searchIn: 'tok',
        definite: false,
        proclitic: false,
        tabType: 'AND'
      },
      {
        term: '',
        searchIn: 'tok',
        definite: false,
        proclitic: false,
        tabType: 'AND'
      }
    ],
    orFields: [
      {
        term: '',
        searchIn: 'tok',
        definite: false,
        proclitic: false,
        tabType: 'OR'
      },
      {
        term: '',
        searchIn: 'tok',
        definite: false,
        proclitic: false,
        tabType: 'OR'
      }
    ]
  },
  proximity: {
    firstTerm: {
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false
    },
    secondTerm: {
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false
    },
    slop: 5
  }
};

const SearchFormContext = createContext<SearchFormContextValue | undefined>(undefined);

export const SearchFormProvider: React.FC<SearchFormProviderProps> = ({ children }) => {
  const [searchFormState, setSearchFormState] = useState<SearchFormState>(initialSearchFormState);

  const setSearchType = useCallback((type: SearchType) => {
    setSearchFormState(prev => ({
      ...prev,
      searchType: type
    }));
  }, []);

  const handleSimpleFieldChange = useCallback((name: string, value: string | boolean) => {
    setSearchFormState(prev => ({
      ...prev,
      simple: {
        ...prev.simple,
        [name]: value
      }
    }));
  }, []);

  const handleAdvancedFieldChange = useCallback((
    index: number,
    name: string,
    value: string | boolean,
    type: 'AND' | 'OR'
  ) => {
    setSearchFormState(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [type === 'AND' ? 'andFields' : 'orFields']: prev.advanced[type === 'AND' ? 'andFields' : 'orFields']
          .map((field, i) => i === index ? { ...field, [name]: value } : field)
      }
    }));
  }, []);

  const handleProximityFieldChange = useCallback((
    index: number,
    name: string,
    value: string | boolean
  ) => {
    setSearchFormState(prev => ({
      ...prev,
      proximity: {
        ...prev.proximity,
        [index === 0 ? 'firstTerm' : 'secondTerm']: {
          ...prev.proximity[index === 0 ? 'firstTerm' : 'secondTerm'],
          [name]: value
        }
      }
    }));
  }, []);

  const handleSlopChange = useCallback((value: number) => {
    setSearchFormState(prev => ({
      ...prev,
      proximity: {
        ...prev.proximity,
        slop: value
      }
    }));
  }, []);

  const addAdvancedField = useCallback((type: 'AND' | 'OR') => {
    const newField: SearchField = {
      term: '',
      searchIn: 'tok',
      definite: false,
      proclitic: false,
      tabType: type
    };

    setSearchFormState(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [type === 'AND' ? 'andFields' : 'orFields']: [
          ...prev.advanced[type === 'AND' ? 'andFields' : 'orFields'],
          newField
        ]
      }
    }));
  }, []);

  const removeAdvancedField = useCallback((index: number, type: 'AND' | 'OR') => {
    setSearchFormState(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        [type === 'AND' ? 'andFields' : 'orFields']: prev.advanced[type === 'AND' ? 'andFields' : 'orFields']
          .filter((_, i) => i !== index)
      }
    }));
  }, []);

  const resetSearchForm = useCallback(() => {
    setSearchFormState(initialSearchFormState);
  }, []);

  const value = {
    searchFormState,
    setSearchType,
    handleSimpleFieldChange,
    handleAdvancedFieldChange,
    handleProximityFieldChange,
    handleSlopChange,
    addAdvancedField,
    removeAdvancedField,
    resetSearchForm
  };

  return (
    <SearchFormContext.Provider value={value}>
      {children}
    </SearchFormContext.Provider>
  );
};

export const useSearchForm = (): SearchFormContextValue => {
  const context = useContext(SearchFormContext);
  if (context === undefined) {
    throw new Error('useSearchForm must be used within a SearchFormProvider');
  }
  return context;
};