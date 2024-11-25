// components/search/SimpleSearch.tsx
import React, { useCallback } from 'react';
import SearchInputSelect from './SearchInputSelect';
import { SearchField } from '../../types';

interface SimpleSearchProps {
  searchField: SearchField;
  handleFieldChange: (name: string, value: string | boolean) => void;
}

const SimpleSearch: React.FC<SimpleSearchProps> = ({ searchField, handleFieldChange }) => {
  const handleInputChange = useCallback((index: number, name: string, value: string | boolean) => {
    handleFieldChange(name, value);
  }, [handleFieldChange]);

  return (
    <div className="simple-search-container">
      <SearchInputSelect
        index={0}
        searchField={searchField}
        handleFieldChange={handleInputChange}
        searchType="simple"
      />
    </div>
  );
};

export default React.memo(SimpleSearch);